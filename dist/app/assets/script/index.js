/** @module app/assets/script/index */
import { Eta } from 'eta/core';
import Mediator from 'white-label-mediator';
import { Collection, Model } from 'white-label-model';
import Router from 'white-label-router';
import View from 'white-label-view';
const eras = new Set(['all', 'southeast', 'gateway', 'far-north']);
/** Return a supported era, falling back to the complete chronology. */
export function normalizeEra(value) {
    return value && eras.has(value) ? value : 'all';
}
/** Initialize the Eta, model, view, mediator, and router integration. */
export function initializeGoldRushPage(documentRoot) {
    const windowRoot = documentRoot.defaultView;
    if (!windowRoot)
        throw new TypeError('Gold North requires a browser document');
    const progress = documentRoot.querySelector('[data-reading-progress]');
    const links = [...documentRoot.querySelectorAll('[data-era-filter]')];
    const cards = [...documentRoot.querySelectorAll('[data-era]')];
    const status = documentRoot.querySelector('[data-filter-status]');
    const eta = new Eta({ autoEscape: true });
    const mediator = new Mediator().initialize();
    const collection = new Collection(cards.map(card => card.dataset.era)).initialize();
    const model = new Model({ selected: 'all', visible: cards.length });
    if (status)
        status.replaceChildren();
    const view = new View({
        parentElement: status ?? undefined,
        model,
        template(data) {
            const state = data;
            return eta.renderString('<p>Showing <%= it.visible %> <%= it.visible === 1 ? "era" : "eras" %>.</p>', state);
        }
    }).initialize();
    /** Apply route state to visible content and its crawlable filter links. */
    const selectEra = (selectedValue) => {
        const selected = normalizeEra(selectedValue);
        let visible = 0;
        for (const link of links) {
            if (link.dataset.eraFilter === selected)
                link.setAttribute('aria-current', 'page');
            else
                link.removeAttribute('aria-current');
        }
        for (const card of cards) {
            const show = selected === 'all' || card.dataset.era === selected;
            card.hidden = !show;
            if (show)
                visible += 1;
        }
        model.set({ selected, visible });
    };
    mediator.on('era:selected', selectEra);
    const router = new Router();
    router.scope = documentRoot.querySelector('main');
    router.mediator = mediator;
    const route = (_scope, location) => {
        mediator.emit('era:selected', location.data.query.era);
    };
    router.routes = { '/': route, defaultRoute: route };
    router.initialize();
    /** Recalculate the percentage of the document already read. */
    const updateProgress = () => {
        if (!progress)
            return;
        const available = documentRoot.documentElement.scrollHeight - windowRoot.innerHeight;
        const percentage = available > 0 ? Math.min(100, Math.max(0, windowRoot.scrollY / available * 100)) : 0;
        progress.style.width = `${percentage}%`;
    };
    windowRoot.addEventListener('scroll', updateProgress, { passive: true });
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
//# sourceMappingURL=index.js.map