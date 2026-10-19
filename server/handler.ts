import Mediator from 'white-label-mediator';
import {Model} from 'white-label-model';
import Router from 'white-label-router';
import View from 'white-label-view/server';
import {html} from 'white-label-view/html';

/**
 * Baseline response headers for the example's HTML. The policy allows same-origin resources only, which covers the
 * starter's root-relative assets and JSON-LD data block; widen it deliberately if pages load from a separate CDN.
 */
const securityHeaders = {
    'content-security-policy': "default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'",
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-content-type-options': 'nosniff'
} as const;

type ServerState = {
    status: number;
    title: string;
    message: string;
};

/**
 * Provider-neutral serverless example using the Web Request/Response contract.
 *
 * Keep mutable White Label instances request-scoped. Cloud adapters should only
 * translate their provider event into a Request and translate the Response back.
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
