import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build as buildJavaScript} from 'esbuild';
import Handlebars from 'handlebars';
import * as sass from 'sass';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function parseArguments(argumentsList) {
    const values = Object.fromEntries(argumentsList.map((argument) => {
        const [key, ...value] = argument.replace(/^--/, '').split('=');
        return [key, value.join('=')];
    }));
    const version = values.version || String(Math.floor(Date.now() / 1000));
    if (!/^[A-Za-z0-9._-]+$/.test(version)) {
        throw new Error('Version may contain only letters, numbers, dots, underscores, and hyphens');
    }
    return {
        cdn: values.cdn || '/',
        production: values.production === 'true',
        service: values.service || '/service-endpoint',
        version,
        www: values.www || '/'
    };
}

async function filesUnder(directory) {
    const entries = await fs.readdir(directory, {withFileTypes: true});
    const files = await Promise.all(entries.map(async (entry) => {
        const location = path.join(directory, entry.name);
        return entry.isDirectory() ? filesUnder(location) : [location];
    }));
    return files.flat();
}

async function renderMarkup(config, outputRoot) {
    const markupRoot = path.join(projectRoot, 'app/assets/markup');
    for (const partialPath of await filesUnder(markupRoot)) {
        if (/\.(hbs|handlebars)$/.test(partialPath)) {
            const name = path.relative(markupRoot, partialPath).replace(/\\/g, '/').replace(/\.(hbs|handlebars)$/, '');
            Handlebars.registerPartial(name, await fs.readFile(partialPath, 'utf8'));
        }
    }

    const globalData = JSON.parse(await fs.readFile(
        path.join(projectRoot, 'app/assets/data/view/global.json'), 'utf8'
    ));
    const pages = (await filesUnder(path.join(projectRoot, 'app')))
        .filter((file) => file.endsWith('.hbs') && !file.includes(`${path.sep}assets${path.sep}`));

    await Promise.all(pages.map(async (page) => {
        const relative = path.relative(path.join(projectRoot, 'app'), page);
        const pageDataPath = path.join(
            projectRoot, 'app/assets/data/view', relative.replace(/\.hbs$/, '.json')
        );
        let pageData = {};
        try {
            pageData = JSON.parse(await fs.readFile(pageDataPath, 'utf8'));
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
        const template = Handlebars.compile(await fs.readFile(page, 'utf8'));
        const destination = path.join(outputRoot, relative.replace(/\.hbs$/, '.html'));
        await fs.mkdir(path.dirname(destination), {recursive: true});
        await fs.writeFile(destination, template({...globalData, ...pageData, ...config}));
    }));
}

async function compileStyles(outputAssets, production) {
    const styleRoot = path.join(projectRoot, 'app/assets/style');
    await Promise.all(['global', 'print', 'toolkit'].map(async (name) => {
        const result = sass.compile(path.join(styleRoot, `${name}.scss`), {
            loadPaths: [path.join(projectRoot, 'node_modules')],
            style: production ? 'compressed' : 'expanded'
        });
        const destination = path.join(outputAssets, 'style', `${name}.css`);
        await fs.mkdir(path.dirname(destination), {recursive: true});
        // Bootstrap publishes compiled CSS, so consuming it avoids recompiling third-party
        // Sass and keeps dependency deprecation warnings out of project builds.
        const bootstrapSource = name === 'global'
            ? (await fs.readFile(
                path.join(projectRoot, 'node_modules/bootstrap/dist/css/bootstrap.css'), 'utf8'
            )).replace(/\/\*# sourceMappingURL=bootstrap\.css\.map \*\//, '')
            : '';
        const bootstrapCss = production && bootstrapSource
            ? sass.compileString(bootstrapSource, {style: 'compressed', syntax: 'css'}).css
            : bootstrapSource;
        await fs.writeFile(destination, `${bootstrapCss}${bootstrapCss ? '\n' : ''}${result.css}`);
    }));
}

async function compileScripts(outputAssets, production) {
    const scriptRoot = path.join(projectRoot, 'app/assets/script');
    const entries = (await fs.readdir(scriptRoot, {withFileTypes: true}))
        .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
        .map((entry) => path.join(scriptRoot, entry.name));
    await fs.mkdir(path.join(outputAssets, 'script'), {recursive: true});
    await buildJavaScript({
        bundle: true,
        entryNames: '[name].compiled',
        entryPoints: entries,
        format: 'iife',
        loader: {'.js': 'jsx'},
        minify: production,
        outdir: path.join(outputAssets, 'script'),
        sourcemap: !production,
        target: ['es2018']
    });
    await fs.writeFile(path.join(outputAssets, 'script/global.compiled.js'), '');
}

export async function build(config = parseArguments(process.argv.slice(2))) {
    const outputRoot = path.join(projectRoot, '_deploy');
    const outputAssets = path.join(outputRoot, 'release', config.version, 'assets');
    await fs.rm(outputRoot, {recursive: true, force: true});
    await fs.mkdir(outputAssets, {recursive: true});

    await Promise.all([
        fs.cp(path.join(projectRoot, 'app/assets/data'), path.join(outputAssets, 'data'), {recursive: true}),
        fs.cp(path.join(projectRoot, 'app/assets/font'), path.join(outputAssets, 'font'), {recursive: true}),
        fs.cp(path.join(projectRoot, 'app/assets/image'), path.join(outputAssets, 'image'), {recursive: true})
    ]);
    await fs.writeFile(path.join(outputAssets, 'data/config.json'), JSON.stringify(config));
    await renderMarkup(config, outputRoot);
    await compileStyles(outputAssets, config.production);
    await compileScripts(outputAssets, config.production);
    await fs.copyFile(path.join(projectRoot, 'app/robots.txt'), path.join(outputRoot, 'robots.txt'));
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
    await build();
}
