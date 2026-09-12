interface PageData {
    cdn: string;
    version: string;
    www: string;
}

export default function NotFoundPage(data: Record<string, unknown>) {
    const page = data as unknown as PageData;
    return (
        <html lang="en-US" dir="ltr">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="robots" content="noindex,follow" />
                <title>Page not found | Gold North</title>
                <link rel="stylesheet" href={`${page.cdn}release/${page.version}/assets/style/global.css`} />
            </head>
            <body>
                <a className="skip-link" href="#main">Skip to the message</a>
                <main id="main" tabindex="-1" className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
                    <h1 className="text-5xl font-extrabold tracking-tight">Page not found</h1>
                    <p className="mt-6 text-lg">The requested page does not exist.</p>
                    <p className="mt-6"><a className="font-bold underline" href={page.www}>Return to the Gold North history</a></p>
                </main>
            </body>
        </html>
    );
}
