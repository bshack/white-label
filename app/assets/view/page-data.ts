/**
 * The page data fields the home page reads: values from `global.json` and `index.json` plus the build config.
 * Pages receive more than this; see `scripts/build.ts`.
 */
export interface PageData {
    cdn: string;
    meta: {description: string};
    siteUrl: string;
    structuredData: unknown;
    title: string;
    version: string;
}
