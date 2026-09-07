import Generator from '../dist/generators/app/index.js';
import {build, parseArguments, type BuildConfig} from '../dist/scripts/build.js';
const config: BuildConfig = parseArguments(['--version=example']);
void [Generator, build, config];
