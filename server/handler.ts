import Mediator from 'white-label-mediator';
import {Model} from 'white-label-model';
import Router from 'white-label-router';
import View from 'white-label-view/server';

type ServerState = {
    status: number;
    title: string;
    message: string;
};

function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

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
            return `<main><h1>${escapeHtml(state.title)}</h1><p>${escapeHtml(state.message)}</p></main>`;
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
        router.initialize(`${url.pathname}${url.search}`);
        view.initialize();
        return new Response(`<!doctype html>${view.toString()}`, {
            status: model.get().status,
            headers: {'content-type': 'text/html; charset=utf-8'}
        });
    } finally {
        view.destroy();
        router.destroy();
        mediator.destroy();
        model.destroy();
    }
}
