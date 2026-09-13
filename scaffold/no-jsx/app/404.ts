interface PageData {cdn: string; siteUrl: string; title: string; version: string}

function escapeHtml(value: unknown): string {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export default function NotFoundPage(data: Record<string, unknown>): string {
    const page = data as unknown as PageData;
    return `<html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | ${escapeHtml(page.title)}</title><meta name="robots" content="noindex,follow"><link rel="stylesheet" href="${escapeHtml(page.cdn)}release/${escapeHtml(page.version)}/assets/style/global.css"></head><body><main id="main" tabindex="-1"><h1>Page not found</h1><p>The requested page could not be found.</p><p><a href="${escapeHtml(page.siteUrl)}/">Return home</a></p></main></body></html>`;
}
