import {createSite, createSiteManifest, type CreateSiteOptions, type ScaffoldFileSystem} from 'generator-white-label/scaffold';

const fileSystem: ScaffoldFileSystem = {
    copy() {},
    writeJSON() {}
};

const options: CreateSiteOptions = {
    destination: '/tmp/white-label-site',
    fileSystem
};

await createSite(options);
const manifest = createSiteManifest();
manifest.name satisfies string;
