import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as buildJavaScript } from 'esbuild';
import { Eta } from 'eta';
import * as sass from 'sass';
const defaultProjectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
/**
 * Read deployment flags and reject version strings that contain path separators.
 * @param argumentsList - Command-line arguments excluding the Node executable and script.
 * @returns Deployment configuration with defaults for omitted flags.
 * @throws When input does not satisfy the documented contract.
 */
export function parseArguments(argumentsList) {
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
/**
 * Recursively collect files below a directory, propagating filesystem failures.
 * @param directory - Directory to traverse recursively.
 * @returns A promise resolving to all descendant file paths.
 */
async function filesUnder(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
        const location = path.join(directory, entry.name);
        return entry.isDirectory() ? filesUnder(location) : [location];
    }));
    return files.flat();
}
/**
 * Render Eta pages using global, page-specific, and deployment data.
 * @param config - Validated deployment or database configuration.
 * @param outputRoot - Destination for rendered pages.
 * @param projectRoot - Project containing app sources and installed dependencies.
 * @returns A promise resolving after all pages have been written.
 */
async function renderMarkup(config, outputRoot, projectRoot) {
    const eta = new Eta({ autoEscape: true, cache: config.production });
    const globalData = JSON.parse(await fs.readFile(path.join(projectRoot, 'app/assets/data/view/global.json'), 'utf8'));
    const pages = (await filesUnder(path.join(projectRoot, 'app')))
        .filter((file) => file.endsWith('.eta') && !file.includes(`${path.sep}assets${path.sep}`));
    await Promise.all(pages.map(async (page) => {
        const relative = path.relative(path.join(projectRoot, 'app'), page);
        const pageDataPath = path.join(projectRoot, 'app/assets/data/view', relative.replace(/\.eta$/, '.json'));
        let pageData = {};
        try {
            pageData = JSON.parse(await fs.readFile(pageDataPath, 'utf8'));
        }
        catch (error) {
            if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
                throw error;
            }
        }
        const template = await fs.readFile(page, 'utf8');
        const destination = path.join(outputRoot, relative.replace(/\.eta$/, '.html'));
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.writeFile(destination, eta.renderString(template, { ...globalData, ...pageData, ...config }));
    }));
}
/**
 * Compile project Sass and the explicitly selected Bootstrap components.
 * @param outputAssets - Destination for compiled asset directories.
 * @param production - Enable compressed output and omit development source maps.
 * @param projectRoot - Project containing app sources and installed dependencies.
 * @returns A promise resolving after all stylesheets have been written.
 */
async function compileStyles(outputAssets, production, projectRoot) {
    const styleRoot = path.join(projectRoot, 'app/assets/style');
    await Promise.all(['global', 'print'].map(async (name) => {
        const result = sass.compile(path.join(styleRoot, `${name}.scss`), {
            loadPaths: [path.join(projectRoot, 'node_modules')],
            style: production ? 'compressed' : 'expanded'
        });
        const destination = path.join(outputAssets, 'style', `${name}.css`);
        await fs.mkdir(path.dirname(destination), { recursive: true });
        // Compile the explicit site subset; dynamic utility classes are retained in bootstrap.scss.
        const bootstrapCss = name === 'global'
            ? sass.compile(path.join(styleRoot, 'bootstrap.scss'), {
                loadPaths: [path.join(projectRoot, 'node_modules')],
                style: production ? 'compressed' : 'expanded'
            }).css
            : '';
        await fs.writeFile(destination, `${bootstrapCss}${bootstrapCss ? '\n' : ''}${result.css}`);
    }));
}
/**
 * Bundle TypeScript entry points for browsers, excluding declaration-only files.
 * @param outputAssets - Destination for compiled asset directories.
 * @param production - Enable compressed output and omit development source maps.
 * @param projectRoot - Project containing app sources and installed dependencies.
 * @returns A promise resolving after all script bundles have been written.
 */
async function compileScripts(outputAssets, production, projectRoot) {
    const scriptRoot = path.join(projectRoot, 'app/assets/script');
    const entries = (await fs.readdir(scriptRoot, { withFileTypes: true }))
        .filter((entry) => entry.isFile() && !entry.name.endsWith('.d.ts') && /\.tsx?$/.test(entry.name))
        .map((entry) => path.join(scriptRoot, entry.name));
    await fs.mkdir(path.join(outputAssets, 'script'), { recursive: true });
    await buildJavaScript({
        bundle: true,
        entryNames: '[name].compiled',
        entryPoints: entries,
        format: 'iife',
        loader: { '.ts': 'ts', '.tsx': 'tsx' },
        minify: production,
        outdir: path.join(outputAssets, 'script'),
        sourcemap: !production,
        target: ['es2018']
    });
    await fs.writeFile(path.join(outputAssets, 'script/global.compiled.js'), '');
}
/**
 * Replace the project deployment directory with compiled pages, scripts, styles, and static assets.
 * @param config - Validated deployment or database configuration.
 * @param projectRoot - Project containing app sources and installed dependencies.
 * @returns A promise resolving after the deployment directory has been rebuilt.
 */
export async function build(config = parseArguments(process.argv.slice(2)), projectRoot = defaultProjectRoot) {
    const outputRoot = path.join(projectRoot, '_deploy');
    const outputAssets = path.join(outputRoot, 'release', config.version, 'assets');
    await fs.rm(outputRoot, { recursive: true, force: true });
    await fs.mkdir(outputAssets, { recursive: true });
    await fs.cp(path.join(projectRoot, 'app/assets/data'), path.join(outputAssets, 'data'), { recursive: true });
    await fs.writeFile(path.join(outputAssets, 'data/config.json'), JSON.stringify(config));
    await renderMarkup(config, outputRoot, projectRoot);
    await compileStyles(outputAssets, config.production, projectRoot);
    await compileScripts(outputAssets, config.production, projectRoot);
    const eta = new Eta({ autoEscape: true });
    const robots = eta.renderString(await fs.readFile(path.join(projectRoot, 'app/robots.txt'), 'utf8'), config);
    await fs.writeFile(path.join(outputRoot, 'robots.txt'), robots);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${config.siteUrl}/</loc></url></urlset>\n`;
    await fs.writeFile(path.join(outputRoot, 'sitemap.xml'), sitemap);
}
if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
    await build();
}
//# sourceMappingURL=build.js.map