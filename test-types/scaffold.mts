import {
    createProject,
    createSite,
    createSiteManifest,
    type CreateProjectOptions,
    type CreateSiteOptions,
    type ScaffoldFileSystem
} from 'generator-white-label';

const fileSystem: ScaffoldFileSystem = {
    copy() {},
    writeJSON() {}
};

const options: CreateProjectOptions = {
    destination: '/tmp/white-label-site',
    fileSystem
};

const compatibilityOptions: CreateSiteOptions = options;
await createProject(options);
await createSite(compatibilityOptions);
const manifest = createSiteManifest();
manifest.name satisfies string;
