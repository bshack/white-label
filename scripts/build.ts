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

/** Read deployment flags and reject unsafe or invalid deployment values. */
export function parseArguments(argumentsList: string[]): BuildConfig {
    const values = Object.fromEntries(argumentsList.map((argument) => {
        const [key, ...value] = argument.replace(/^--/, '').split('=');
        return [key, value.join('=')];
    }));
    const version = values.version || String(Math.floor(Date.now() / 1000));
    if (!/^[A-Za-z0-9._-]+$/.test(version)) {
        throw new Error('Version may contain only letters, numbers, dots, underscores, and hyphens');
    }
    const siteUrl = (values['site-url'] || 'http://localhost:8080').replace(/\/$/, '');
    if (!URL.canParse(siteUrl) || (values.production === 'true' && !siteUrl.startsWith('https://'))) {
        throw new Error('Production builds require an absolute HTTPS --site-url');
    }
    return {
        cdn: values.cdn || '/',
        production: values.production === 'true',
        siteUrl,
        version,
        www: values.www || '/'
    };
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

/** Render compiled TSX pages using global, page-specific, and deployment data. */
async function renderMarkup(config: BuildConfig, outputRoot: string, projectRoot: string) {
    const globalData = JSON.parse(await fs.readFile(
        path.join(projectRoot, 'app/assets/data/view/global.json'), 'utf8'
    )) as Record<string, unknown>;
    const appRoot = path.join(projectRoot, 'app');
    const pages = (await filesUnder(appRoot))
        .filter((file) => file.endsWith('.tsx') && !file.includes(`${path.sep}assets${path.sep}`));

    await Promise.all(pages.map(async (page) => {
        const relative = path.relative(appRoot, page);
        const pageDataPath = path.join(
            projectRoot, 'app/assets/data/view', relative.replace(/\.tsx$/, '.json')
        );
        let pageData: Record<string, unknown> = {};
        try {
            pageData = JSON.parse(await fs.readFile(pageDataPath, 'utf8')) as Record<string, unknown>;
        } catch (error) {
            if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
                throw error;
            }
        }
        const compiledPage = path.join(projectRoot, 'dist/app', relative.replace(/\.tsx$/, '.js'));
        const module = await import(pathToFileURL(compiledPage).href) as PageModule;
        if (typeof module.default !== 'function') {
            throw new TypeError(`Page module ${relative} must export a default render function`);
        }
        const markup = module.default({...globalData, ...pageData, ...config});
        const destination = path.join(outputRoot, relative.replace(/\.tsx$/, '.html'));
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
        '@tailwindcss/cli',
        '-i', path.join(styleRoot, 'global.css'),
        '-o', destination
    ];
    if (production) {argumentsList.push('--minify');}
    await execFileAsync('npx', argumentsList, {cwd: projectRoot});
    await fs.copyFile(path.join(styleRoot, 'print.css'), path.join(outputAssets, 'style/print.css'));
}

/** Bundle TypeScript entry points for browsers, excluding declaration-only files. */
async function compileScripts(outputAssets: string, production: boolean, projectRoot: string) {
    const scriptRoot = path.join(projectRoot, 'app/assets/script');
    const entries = (await fs.readdir(scriptRoot, {withFileTypes: true}))
        .filter((entry) => entry.isFile() && !entry.name.endsWith('.d.ts') && /\.tsx?$/.test(entry.name))
        .map((entry) => path.join(scriptRoot, entry.name));
    await fs.mkdir(path.join(outputAssets, 'script'), {recursive: true});
    await buildJavaScript({
        bundle: true,
        entryNames: '[name].compiled',
        entryPoints: entries,
        format: 'iife',
        loader: {'.ts': 'ts', '.tsx': 'tsx'},
        minify: production,
        outdir: path.join(outputAssets, 'script'),
        sourcemap: !production,
        target: ['es2018']
    });
    await fs.writeFile(path.join(outputAssets, 'script/global.compiled.js'), '');
}

/** Replace the deployment directory with compiled pages, scripts, styles, and static assets. */
export async function build(config = parseArguments(process.argv.slice(2)), projectRoot = defaultProjectRoot) {
    const outputRoot = path.join(projectRoot, '_deploy');
    const outputAssets = path.join(outputRoot, 'release', config.version, 'assets');
    await fs.rm(outputRoot, {recursive: true, force: true});
    await fs.mkdir(outputAssets, {recursive: true});

    await fs.cp(path.join(projectRoot, 'app/assets/data'), path.join(outputAssets, 'data'), {recursive: true});
    await fs.writeFile(path.join(outputAssets, 'data/config.json'), JSON.stringify(config));
    await renderMarkup(config, outputRoot, projectRoot);
    await compileStyles(outputAssets, config.production, projectRoot);
    await compileScripts(outputAssets, config.production, projectRoot);
    const robots = `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`;
    await fs.writeFile(path.join(outputRoot, 'robots.txt'), robots);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${config.siteUrl}/</loc></url></urlset>\n`;
    await fs.writeFile(path.join(outputRoot, 'sitemap.xml'), sitemap);
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
    await build();
}
