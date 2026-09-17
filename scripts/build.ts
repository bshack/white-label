/** Values injected into page templates and the generated config file. */
export interface BuildConfig {cdn: string; production: boolean; siteUrl: string; version: string; www: string}
import {execFile} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {promisify} from 'node:util';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {build as buildJavaScript} from 'esbuild';

const execFileAsync = promisify(execFile);
const defaultProjectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const relativePublicPrefix = /^\/(?!\/)[A-Za-z0-9._~!$&'()*+,;=:@%/-]*$/;

function hasControlCharacters(value: string): boolean {
    return [...value].some(character => {
        const code = character.charCodeAt(0);
        return code <= 0x1f || code === 0x7f;
    });
}

function normalizeVersion(value: unknown): string {
    if (typeof value !== 'string' || !/^[A-Za-z0-9._-]+$/.test(value) || value === '.' || value === '..') {
        throw new Error('Version may contain only letters, numbers, dots, underscores, and hyphens and must name one release directory');
    }
    return value;
}

function normalizeProduction(value: unknown): boolean {
    if (typeof value !== 'boolean') {throw new Error('Production must be a boolean');}
    return value;
}

function normalizeSiteUrl(value: unknown, production: boolean): string {
    if (typeof value !== 'string') {
        throw new Error('Site URL must be an absolute HTTP(S) URL; production builds require HTTPS');
    }
    let url: URL;
    try {url = new URL(value);} catch {throw new Error('Site URL must be an absolute HTTP(S) URL; production builds require HTTPS');}
    if (hasControlCharacters(value) || (url.protocol !== 'http:' && url.protocol !== 'https:') ||
        url.username || url.password || url.search || url.hash || (production && url.protocol !== 'https:')) {
        throw new Error('Site URL must be an absolute HTTP(S) URL without credentials, query, or fragment; production builds require HTTPS');
    }
    return url.toString().replace(/\/$/, '');
}

function normalizePublicPrefix(value: unknown, name: 'www' | 'cdn', production: boolean): string {
    if (typeof value !== 'string' || hasControlCharacters(value)) {
        throw new Error(`${name} must be a root-relative or absolute HTTP(S) URL prefix`);
    }
    if (relativePublicPrefix.test(value)) {return value.endsWith('/') ? value : `${value}/`;}
    let url: URL;
    try {url = new URL(value);} catch {throw new Error(`${name} must be a root-relative or absolute HTTP(S) URL prefix`);}
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password ||
        url.search || url.hash || (production && url.protocol !== 'https:')) {
        throw new Error(`${name} must be a root-relative or absolute HTTP(S) URL prefix${production ? ' using HTTPS in production' : ''}`);
    }
    const normalized = url.toString();
    return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function normalizeBuildConfig(config: BuildConfig): BuildConfig {
    const production = normalizeProduction(config.production);
    return {
        cdn: normalizePublicPrefix(config.cdn, 'cdn', production),
        production,
        siteUrl: normalizeSiteUrl(config.siteUrl, production),
        version: normalizeVersion(config.version),
        www: normalizePublicPrefix(config.www, 'www', production)
    };
}

/** Read deployment flags and reject unsafe or invalid deployment values. */
export function parseArguments(argumentsList: string[]): BuildConfig {
    const values = Object.fromEntries(argumentsList.map((argument) => {
        const [key, ...value] = argument.replace(/^--/, '').split('=');
        return [key, value.join('=')];
    }));
    const production = values.production === 'true';
    return normalizeBuildConfig({
        cdn: values.cdn || '/',
        production,
        siteUrl: values['site-url'] || 'http://localhost:8080',
        version: values.version || String(Math.floor(Date.now() / 1000)),
        www: values.www || '/'
    });
}

/** Return the local Tailwind executable name for the current platform. */
export function tailwindExecutable(platform: NodeJS.Platform = process.platform) {
    return platform === 'win32' ? 'tailwindcss.cmd' : 'tailwindcss';
}

/** Recursively collect files below a directory, propagating filesystem failures. */
async function filesUnder(directory: string): Promise<string[]> {
    const entries = await fs.readdir(directory, {withFileTypes: true});
    const files = await Promise.all(entries.map(async (entry) => {
        const location = path.join(directory, entry.name);
        return entry.isDirectory() ? filesUnder(location) : [location];
    }));
    return files.flat();
}

interface PageModule {
    default(data: Record<string, unknown>): {toString(): string} | string;
}

/** Render compiled TypeScript pages using global, page-specific, and deployment data. */
async function renderMarkup(config: BuildConfig, outputRoot: string, projectRoot: string) {
    const globalData = JSON.parse(await fs.readFile(
        path.join(projectRoot, 'app/assets/data/view/global.json'), 'utf8'
    )) as Record<string, unknown>;
    const appRoot = path.join(projectRoot, 'app');
    const pages = (await filesUnder(appRoot))
        .filter((file) => /\.ts$/.test(file) && !file.endsWith('.d.ts') && !file.includes(`${path.sep}assets${path.sep}`));

    await Promise.all(pages.map(async (page) => {
        const relative = path.relative(appRoot, page);
        const pageDataPath = path.join(projectRoot, 'app/assets/data/view', relative.replace(/\.ts$/, '.json'));
        let pageData: Record<string, unknown> = {};
        try {
            pageData = JSON.parse(await fs.readFile(pageDataPath, 'utf8')) as Record<string, unknown>;
        } catch (error) {
            if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
                throw error;
            }
        }
        const compiledPage = path.join(projectRoot, 'dist/app', relative.replace(/\.ts$/, '.js'));
        const module = await import(pathToFileURL(compiledPage).href) as PageModule;
        if (typeof module.default !== 'function') {
            throw new TypeError(`Page module ${relative} must export a default render function`);
        }
        const markup = module.default({...globalData, ...pageData, ...config});
        const destination = path.join(outputRoot, relative.replace(/\.ts$/, '.html'));
        await fs.mkdir(path.dirname(destination), {recursive: true});
        await fs.writeFile(destination, `<!DOCTYPE html>\n${String(markup)}\n`);
    }));
}

/** Compile Tailwind and project CSS into the deploy directory. */
async function compileStyles(outputAssets: string, production: boolean, projectRoot: string) {
    const styleRoot = path.join(projectRoot, 'app/assets/style');
    await fs.mkdir(path.join(outputAssets, 'style'), {recursive: true});
    const destination = path.join(outputAssets, 'style/global.css');
    const argumentsList = [
        '-i', path.join(styleRoot, 'global.css'),
        '-o', destination
    ];
    if (production) {argumentsList.push('--minify');}
    await execFileAsync(tailwindExecutable(), argumentsList, {cwd: projectRoot});
    await fs.copyFile(path.join(styleRoot, 'print.css'), path.join(outputAssets, 'style/print.css'));
}

/** Bundle plain TypeScript browser entry points, excluding declaration-only files. */
async function compileScripts(outputAssets: string, production: boolean, projectRoot: string) {
    const scriptRoot = path.join(projectRoot, 'app/assets/script');
    const entries = (await fs.readdir(scriptRoot, {withFileTypes: true}))
        .filter((entry) => entry.isFile() && !entry.name.endsWith('.d.ts') && entry.name.endsWith('.ts'))
        .map((entry) => path.join(scriptRoot, entry.name));
    await fs.mkdir(path.join(outputAssets, 'script'), {recursive: true});
    await buildJavaScript({
        bundle: true,
        entryNames: '[name].compiled',
        entryPoints: entries,
        format: 'iife',
        loader: {'.ts': 'ts'},
        minify: production,
        outdir: path.join(outputAssets, 'script'),
        sourcemap: !production,
        target: ['es2018']
    });
    await fs.writeFile(path.join(outputAssets, 'script/global.compiled.js'), '');
}

function escapeXml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

/** Replace the deployment directory with compiled pages, scripts, styles, and static assets. */
export async function build(config = parseArguments(process.argv.slice(2)), projectRoot = defaultProjectRoot) {
    const safeConfig = normalizeBuildConfig(config);
    const outputRoot = path.join(projectRoot, '_deploy');
    const outputAssets = path.join(outputRoot, 'release', safeConfig.version, 'assets');
    await fs.rm(outputRoot, {recursive: true, force: true});
    await fs.mkdir(outputAssets, {recursive: true});

    await fs.cp(path.join(projectRoot, 'app/assets/data'), path.join(outputAssets, 'data'), {recursive: true});
    await fs.writeFile(path.join(outputAssets, 'data/config.json'), JSON.stringify(safeConfig));
    await renderMarkup(safeConfig, outputRoot, projectRoot);
    await compileStyles(outputAssets, safeConfig.production, projectRoot);
    await compileScripts(outputAssets, safeConfig.production, projectRoot);
    const robots = `User-agent: *\nAllow: /\nSitemap: ${safeConfig.siteUrl}/sitemap.xml\n`;
    await fs.writeFile(path.join(outputRoot, 'robots.txt'), robots);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeXml(`${safeConfig.siteUrl}/`)}</loc></url></urlset>\n`;
    await fs.writeFile(path.join(outputRoot, 'sitemap.xml'), sitemap);
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
    await build();
}
