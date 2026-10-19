/**
 * Static site build: renders `app/*.ts` pages to HTML, bundles browser scripts with esbuild, compiles Tailwind CSS,
 * and writes robots.txt and sitemap.xml into `_deploy/`.
 *
 * Run it after `tsc` (the `build` script does both). Flags use `--name=value`; see {@link parseArguments}.
 *
 * @module scripts/build
 */

/**
 * Deployment settings. They are passed to every page template (overriding page data with the same key) and written
 * to `_deploy/release/<version>/assets/data/config.json`.
 */
export interface BuildConfig {
    /** URL prefix for versioned assets: root-relative (`/`) or absolute HTTP(S). Always ends with `/`. */
    cdn: string;
    /** Minify output and require HTTPS for every URL. */
    production: boolean;
    /** Public origin (and optional path) used for canonical URLs, robots.txt, and sitemap.xml. No trailing slash. */
    siteUrl: string;
    /** Name of the asset directory, `_deploy/release/<version>/`. Not an npm version. */
    version: string;
    /** URL prefix for links back to the site's pages, such as the 404 page's home link. Always ends with `/`. */
    www: string;
}
import {execFile} from 'node:child_process';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {promisify} from 'node:util';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {build as buildJavaScript} from 'esbuild';

const execFileAsync = promisify(execFile);
const defaultProjectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const relativePublicPrefix = /^\/(?!\/)[A-Za-z0-9._~!$&'()*+,;=:@%/-]*$/;
const buildOptionNames = new Set(['cdn', 'production', 'site-url', 'version', 'www']);

// Validation helpers. Every value ends up inside generated HTML, XML, or a file path, so reject anything that could
// break out of those contexts instead of trying to escape it.

/** True when `value` contains an ASCII control character, such as a newline that could split robots.txt. */
function hasControlCharacters(value: string): boolean {
    return [...value].some(character => {
        const code = character.charCodeAt(0);
        return code <= 0x1f || code === 0x7f;
    });
}

/** Accept a single, safe directory name so the version cannot point outside `_deploy/release/`. */
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

/** Accept an absolute HTTP(S) URL without credentials, query, or fragment (HTTPS only in production). */
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

/**
 * Accept a root-relative path such as `/` or `/site/`, or an absolute HTTP(S) URL (HTTPS only in production), and
 * add a trailing slash so templates can append paths directly.
 */
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

/** Validate every field. Runs for programmatic `build()` calls too, not just command-line flags. */
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

/**
 * Parse build flags into a validated {@link BuildConfig}.
 *
 * Accepted flags, each as `--name=value`: `--version` (default: current Unix time in seconds), `--production`
 * (`true` or `false`, default `false`), `--site-url` (default `http://localhost:8080`), `--www` and `--cdn`
 * (default `/`).
 *
 * @throws For an unknown flag, a flag without `=value`, or a value that fails validation.
 */
export function parseArguments(argumentsList: string[]): BuildConfig {
    const values: Record<string, string> = {};
    for (const argument of argumentsList) {
        if (!argument.startsWith('--')) {throw new Error(`Unknown build option: ${argument}`);}
        const separator = argument.indexOf('=');
        const key = argument.slice(2, separator === -1 ? undefined : separator);
        if (!buildOptionNames.has(key)) {throw new Error(`Unknown build option: --${key}`);}
        if (separator === -1) {throw new Error(`Build option --${key} must use --${key}=value`);}
        values[key] = argument.slice(separator + 1);
    }

    let production = false;
    if (values.production !== undefined) {
        if (values.production !== 'true' && values.production !== 'false') {
            throw new Error('Production must be true or false');
        }
        production = values.production === 'true';
    }

    return normalizeBuildConfig({
        cdn: values.cdn || '/',
        production,
        siteUrl: values['site-url'] || 'http://localhost:8080',
        version: values.version || String(Math.floor(Date.now() / 1000)),
        www: values.www || '/'
    });
}

/**
 * Name of the Tailwind executable in `node_modules/.bin` for a platform. The build no longer uses it (it runs the
 * CLI's JavaScript entry directly, see `tailwindEntry`), but it remains exported.
 */
export function tailwindExecutable(platform: NodeJS.Platform = process.platform) {
    return platform === 'win32' ? 'tailwindcss.cmd' : 'tailwindcss';
}

/**
 * Find the JavaScript entry of the project's own `@tailwindcss/cli`.
 *
 * The build runs that file with the current Node executable. That avoids searching PATH and avoids the Windows
 * `.cmd` wrapper in `node_modules/.bin`, which `execFile` cannot start without a shell (it fails with EINVAL).
 *
 * @throws If the installed `@tailwindcss/cli` does not declare a `tailwindcss` bin.
 */
async function tailwindEntry(projectRoot: string) {
    const manifestPath = createRequire(path.join(projectRoot, 'package.json')).resolve('@tailwindcss/cli/package.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')) as {bin?: Record<string, string>};
    const entry = manifest.bin?.tailwindcss;
    if (!entry) {throw new Error('@tailwindcss/cli does not declare a tailwindcss executable');}
    return path.join(path.dirname(manifestPath), entry);
}

/** List every file below `directory`, recursively. File-system errors are thrown, not skipped. */
async function filesUnder(directory: string): Promise<string[]> {
    const entries = await fs.readdir(directory, {withFileTypes: true});
    const files = await Promise.all(entries.map(async (entry) => {
        const location = path.join(directory, entry.name);
        return entry.isDirectory() ? filesUnder(location) : [location];
    }));
    return files.flat();
}

/** What a compiled page module must export: a default function that returns the page's HTML. */
interface PageModule {
    default(data: Record<string, unknown>): {toString(): string} | string;
}

/**
 * Render every page to HTML.
 *
 * A page is any `.ts` file under `app/` outside an `assets` directory, for example `app/index.ts` or
 * `app/docs/intro.ts`. Its compiled module in `dist/app/` is imported and its default export is called with
 * `global.json`, then the page's own data file (`app/assets/data/view/<page>.json`, optional), then the build
 * config, merged in that order. The result is written to `_deploy/<page>.html`.
 */
async function renderMarkup(config: BuildConfig, outputRoot: string, projectRoot: string) {
    const globalData = JSON.parse(await fs.readFile(
        path.join(projectRoot, 'app/assets/data/view/global.json'), 'utf8'
    )) as Record<string, unknown>;
    const appRoot = path.join(projectRoot, 'app');
    const pages = (await filesUnder(appRoot))
        .map((file) => path.relative(appRoot, file))
        // Check for an assets/ segment only in the path below app/, so a project stored under a directory named
        // `assets` still finds its pages.
        .filter((relative) => /\.ts$/.test(relative) && !relative.endsWith('.d.ts') && !`${path.sep}${relative}`.includes(`${path.sep}assets${path.sep}`));

    await Promise.all(pages.map(async (relative) => {
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

/** Compile `global.css` with Tailwind (minified in production) and copy `print.css` unchanged. */
async function compileStyles(outputAssets: string, production: boolean, projectRoot: string) {
    const styleRoot = path.join(projectRoot, 'app/assets/style');
    await fs.mkdir(path.join(outputAssets, 'style'), {recursive: true});
    const destination = path.join(outputAssets, 'style/global.css');
    const argumentsList = [
        '-i', path.join(styleRoot, 'global.css'),
        '-o', destination
    ];
    if (production) {argumentsList.push('--minify');}
    await execFileAsync(process.execPath, [await tailwindEntry(projectRoot), ...argumentsList], {cwd: projectRoot});
    await fs.copyFile(path.join(styleRoot, 'print.css'), path.join(outputAssets, 'style/print.css'));
}

/**
 * Bundle each `.ts` file directly inside `app/assets/script/` (not subdirectories) into `<name>.compiled.js`.
 * Bundles are IIFEs targeting ES2018, minified in production and with source maps otherwise.
 */
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
    // Empty placeholder for the `scripts.global` path listed in the page data files.
    await fs.writeFile(path.join(outputAssets, 'script/global.compiled.js'), '');
}

/** Escape a value for XML text, used for the sitemap. */
function escapeXml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

/**
 * Delete `_deploy/` and rebuild it from the compiled project.
 *
 * Output: `<page>.html` for each page, `robots.txt`, a `sitemap.xml` listing the site root, and
 * `release/<version>/assets/` holding `data/` (a copy of `app/assets/data` plus `config.json`), `script/`, and
 * `style/`.
 *
 * @param config - Deployment settings; validated again even when passed directly. Defaults to the command-line flags.
 * @param projectRoot - Project directory. Defaults to the directory above `dist/`.
 * @throws If the config is invalid (before anything is deleted), or any build step fails.
 */
export async function build(config = parseArguments(process.argv.slice(2)), projectRoot = defaultProjectRoot) {
    const safeConfig = normalizeBuildConfig(config);
    const outputRoot = path.join(projectRoot, '_deploy');
    const outputAssets = path.join(outputRoot, 'release', safeConfig.version, 'assets');
    await fs.rm(outputRoot, {recursive: true, force: true});
    await fs.mkdir(outputAssets, {recursive: true});

    const robots = `User-agent: *\nAllow: /\nSitemap: ${safeConfig.siteUrl}/sitemap.xml\n`;
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeXml(`${safeConfig.siteUrl}/`)}</loc></url></urlset>\n`;
    // Each step writes a different part of _deploy/, so they run concurrently. Wait for every step to settle before
    // reporting a failure, so nothing is still writing when the caller retries or inspects the output.
    const steps = await Promise.allSettled([
        fs.cp(path.join(projectRoot, 'app/assets/data'), path.join(outputAssets, 'data'), {recursive: true})
            .then(() => fs.writeFile(path.join(outputAssets, 'data/config.json'), JSON.stringify(safeConfig))),
        renderMarkup(safeConfig, outputRoot, projectRoot),
        compileStyles(outputAssets, safeConfig.production, projectRoot),
        compileScripts(outputAssets, safeConfig.production, projectRoot),
        fs.writeFile(path.join(outputRoot, 'robots.txt'), robots),
        fs.writeFile(path.join(outputRoot, 'sitemap.xml'), sitemap)
    ]);
    const failure = steps.find((step): step is PromiseRejectedResult => step.status === 'rejected');
    if (failure) {throw failure.reason;}
}

// Build when run as `node dist/scripts/build.js`, but not when imported (for example by tests).
if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
    await build();
}
