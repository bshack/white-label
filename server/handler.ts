import Mediator from 'white-label-mediator';
import {Model} from 'white-label-model';
import Router from 'white-label-router';
import View from 'white-label-view/server';
import {html} from 'white-label-view/html';

/**
 * Security headers sent with every response from {@link handleRequest}.
 *
 * The Content-Security-Policy allows resources from the same origin only, and blocks plugins, framing, and form posts
 * to other origins. That fits the starter's root-relative assets. If pages load assets from a separate CDN (`--cdn`),
 * add that origin deliberately rather than loosening the whole policy. These headers apply only to this handler;
 * static hosting of `_deploy/` needs the same headers configured on the host.
 */
const securityHeaders = {
    'content-security-policy': "default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'",
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-content-type-options': 'nosniff'
} as const;

/** Data the handler's Model holds and its View renders. */
type ServerState = {
    status: number;
    title: string;
    message: string;
};

/**
 * Example server function built on the standard Web `Request` and `Response` types, with no cloud provider SDK.
 *
 * Routes: `/health` returns 200; `/hello?name=Ada` returns 200 with an escaped greeting; anything else returns 404.
 *
 * Every Model, View, Router, and Mediator is created inside the call and destroyed before it returns. A warm
 * serverless process handles many requests, so module-level mutable state could leak data or listeners between them.
 * A provider adapter should only convert its event to a `Request` and the returned `Response` back.
 *
 * @param request - The incoming request; only its URL is used.
 * @returns An HTML response with the route's status code and {@link securityHeaders}.
 */
export async function handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const mediator = new Mediator();
    const model = new Model({
        status: 404,
        title: 'Not found',
        message: `No route for ${url.pathname}.`
    });
    const router = new Router();
    const view = new View({
        model,
        template(data) {
            const state = data as ServerState;
            return html`<main><h1>${state.title}</h1><p>${state.message}</p></main>`;
        }
    });

    router.mediator = mediator;
    router.routes = {
        '/health': () => model.update({
            status: 200,
            title: 'Healthy',
            message: 'Serverless request handled.'
        }),
        '/hello': (_scope, location) => {
            const name = String(location.data.query.name ?? 'world');
            return model.update({
                status: 200,
                title: 'Hello',
                message: `Hello ${name}.`
            });
        },
        // Unmatched paths keep the Model's initial 404 state.
        defaultRoute: () => true
    };

    try {
        router.navigate(url.toString());
        view.initialize();
        return new Response(`<!doctype html>${view.toString()}`, {
            status: model.get().status,
            headers: {...securityHeaders, 'content-type': 'text/html; charset=utf-8'}
        });
    } finally {
        view.destroy();
        router.destroy();
        mediator.destroy();
        model.destroy();
    }
}
