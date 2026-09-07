/** @module app/assets/script/index */
import {Eta} from 'eta/core';
import Mediator from 'white-label-mediator';
import {Collection, Model} from 'white-label-model';
import Router from 'white-label-router';
import View from 'white-label-view';

const eras = new Set(['all', 'southeast', 'gateway', 'far-north']);
interface EraState {selected: string; visible: number}

/** Public handles used to verify and release every integrated white-label package. */
export interface GoldRushApplication {
    mediator: Mediator;
    collection: Collection;
    model: Model;
    router: Router;
    view: View;
    destroy(): void;
}

/** Return a supported era, falling back to the complete chronology. */
export function normalizeEra(value: string | undefined): string {
    return value && eras.has(value) ? value : 'all';
}

/** Initialize the Eta, model, view, mediator, and router integration. */
export function initializeGoldRushPage(documentRoot: Document): GoldRushApplication {
    const windowRoot = documentRoot.defaultView;
    if (!windowRoot) throw new TypeError('Gold North requires a browser document');

    const progress = documentRoot.querySelector<HTMLElement>('[data-reading-progress]');
    const links = [...documentRoot.querySelectorAll<HTMLAnchorElement>('[data-era-filter]')];
    const cards = [...documentRoot.querySelectorAll<HTMLElement>('[data-era]')];
    const status = documentRoot.querySelector<HTMLElement>('[data-filter-status]');
    const eta = new Eta({autoEscape: true});
    const mediator = new Mediator().initialize();
    const collection = new Collection(cards.map(card => card.dataset.era)).initialize();
    const model = new Model({selected: 'all', visible: cards.length});
    if (status) status.replaceChildren();
    const view = new View({
        parentElement: status ?? undefined,
        model,
        template(data) {
            const state = data as EraState;
            return eta.renderString('<p>Showing <%= it.visible %> <%= it.visible === 1 ? "era" : "eras" %>.</p>', state);
        }
    }).initialize();

    /** Apply route state to visible content and its crawlable filter links. */
    const selectEra = (selectedValue?: string): void => {
        const selected = normalizeEra(selectedValue);
        let visible = 0;
        for (const link of links) {
            if (link.dataset.eraFilter === selected) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        }
        for (const card of cards) {
            const show = selected === 'all' || card.dataset.era === selected;
            card.hidden = !show;
            if (show) visible += 1;
        }
        model.set({selected, visible});
    };

    mediator.on('era:selected', selectEra);
    const router = new Router();
    router.scope = documentRoot.querySelector('main');
    router.mediator = mediator;
    const route = (_scope: Element | null, location: {data: {query: Record<string, string>}}): void => {
        mediator.emit('era:selected', location.data.query.era);
    };
    router.routes = {'/': route, defaultRoute: route};
    router.initialize();

    /** Recalculate the percentage of the document already read. */
    const updateProgress = (): void => {
        if (!progress) return;
        const available = documentRoot.documentElement.scrollHeight - windowRoot.innerHeight;
        const percentage = available > 0 ? Math.min(100, Math.max(0, windowRoot.scrollY / available * 100)) : 0;
        progress.style.width = `${percentage}%`;
    };
    windowRoot.addEventListener('scroll', updateProgress, {passive: true});
    updateProgress();

    return {
        collection,
        mediator,
        model,
        router,
        view,
        destroy() {
            windowRoot.removeEventListener('scroll', updateProgress);
            router.destroy();
            view.destroy();
            collection.destroy();
            mediator.destroy();
        }
    };
}

initializeGoldRushPage(document);
