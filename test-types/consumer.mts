import {createProject} from '../dist/scaffold/index.js';
import {build, parseArguments, type BuildConfig} from '../dist/scripts/build.js';
const config: BuildConfig = parseArguments(['--version=example']);
void [createProject, build, config];
