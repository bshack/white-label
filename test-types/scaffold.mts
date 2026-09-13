import {
    createProject,
    createSiteManifest,
    type CreateProjectOptions,
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

await createProject(options);
const manifest = createSiteManifest();
manifest.name satisfies string;
