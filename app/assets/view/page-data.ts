/**
 * Build-time data available to every page template.
 *
 * Keeping this contract separate from the page component makes the top-level
 * JSX read like application composition instead of deployment plumbing.
 */
export interface PageData {
    cdn: string;
    meta: {description: string};
    siteUrl: string;
    structuredData: unknown;
    title: string;
    version: string;
}
