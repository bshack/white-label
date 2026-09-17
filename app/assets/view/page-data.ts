/**
 * Build-time data available to every page template.
 *
 * Keeping this contract separate from the renderer keeps top-level tagged
 * HTML focused on application composition instead of deployment plumbing.
 */
export interface PageData {
    cdn: string;
    meta: {description: string};
    siteUrl: string;
    structuredData: unknown;
    title: string;
    version: string;
}
