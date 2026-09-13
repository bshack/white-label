import { jsx as _jsx, jsxs as _jsxs } from "white-label-view/jsx-runtime";
/** @module app/assets/script/index */
import Mediator from 'white-label-mediator';
import { Model } from 'white-label-model';
import Router from 'white-label-router';
import View from 'white-label-view';
const features = new Set(['all', 'core', 'runtime', 'tooling']);
/** Return a supported feature group, falling back to the complete showcase. */
export function normalizeFeature(value) {
    return value && features.has(value) ? value : 'all';
}
/** Initialize the JSX, model, view, mediator, and router integration. */
export function initializeWhiteLabelPage(documentRoot) {
    const windowRoot = documentRoot.defaultView;
    if (!windowRoot) {
        throw new TypeError('White Label requires a browser document');
    }
    const progress = documentRoot.querySelector('[data-reading-progress]');
    const links = [...documentRoot.querySelectorAll('[data-feature-filter]')];
    const cards = [...documentRoot.querySelectorAll('[data-feature]')];
    const status = documentRoot.querySelector('[data-filter-status]');
    const mediator = new Mediator().initialize();
    const featureIndex = new Model(cards.map(card => card.dataset.feature)).initialize();
    const model = new Model({ selected: 'all', visible: cards.length });
    if (status) {
        status.replaceChildren();
    }
    const view = new View({
        parentElement: status ?? undefined,
        model,
        template(data) {
            const state = data;
            return (_jsxs("dl", { children: [_jsxs("div", { children: [_jsx("dt", { children: "Router" }), _jsxs("dd", { children: ["/?feature=", state.selected] })] }), _jsxs("div", { children: [_jsx("dt", { children: "Mediator" }), _jsxs("dd", { children: ["feature:selected \u2192 ", state.selected] })] }), _jsxs("div", { children: [_jsx("dt", { children: "Model" }), _jsxs("dd", { children: ["selected: ", state.selected] })] }), _jsxs("div", { children: [_jsx("dt", { children: "View" }), _jsxs("dd", { children: [state.visible, " ", state.visible === 1 ? 'feature' : 'features', " rendered"] })] })] }));
        }
    }).initialize();
    let progressFrame;
    const updateProgress = () => {
        progressFrame = undefined;
        if (!progress) {
            return;
        }
        const available = documentRoot.documentElement.scrollHeight - windowRoot.innerHeight;
        const ratio = available > 0 ? Math.min(1, Math.max(0, windowRoot.scrollY / available)) : 0;
        progress.style.transform = `scaleX(${ratio})`;
    };
    const scheduleProgress = () => {
        if (progressFrame === undefined) {
            progressFrame = windowRoot.requestAnimationFrame(updateProgress);
        }
    };
    windowRoot.addEventListener('scroll', scheduleProgress, { passive: true });
    windowRoot.addEventListener('resize', scheduleProgress);
    updateProgress();
    const selectFeature = (selectedValue) => {
        const selected = normalizeFeature(selectedValue);
        let visible = 0;
        for (const link of links) {
            if (link.dataset.featureFilter === selected) {
                link.setAttribute('aria-current', 'page');
            }
            else {
                link.removeAttribute('aria-current');
            }
        }
        for (const card of cards) {
            const show = selected === 'all' || card.dataset.feature === selected;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        }
        model.set({ selected, visible });
        scheduleProgress();
    };
    mediator.on('feature:selected', selectFeature);
    const router = new Router();
    router.scope = documentRoot.querySelector('main');
    router.mediator = mediator;
    const route = (_scope, location) => {
        mediator.emit('feature:selected', location.data.query.feature);
    };
    router.routes = { '/': route, defaultRoute: route };
    router.initialize();
    return {
        featureIndex,
        mediator,
        model,
        router,
        view,
        destroy() {
            windowRoot.removeEventListener('scroll', scheduleProgress);
            windowRoot.removeEventListener('resize', scheduleProgress);
            if (progressFrame !== undefined) {
                windowRoot.cancelAnimationFrame(progressFrame);
            }
            router.destroy();
            view.destroy();
            featureIndex.destroy();
            model.destroy();
            mediator.destroy();
        }
    };
}
initializeWhiteLabelPage(document);
//# sourceMappingURL=index.js.map