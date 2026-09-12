/** @module app/assets/script/index */
import Mediator from 'white-label-mediator';
import { Model } from 'white-label-model';
import Router from 'white-label-router';
import View from 'white-label-view';
/** Public handles used to verify and release every integrated White Label package. */
export interface WhiteLabelApplication {
    mediator: Mediator;
    featureIndex: Model<Array<string | undefined>>;
    model: Model;
    router: Router;
    view: View;
    destroy(): void;
}
/** Return a supported feature group, falling back to the complete showcase. */
export declare function normalizeFeature(value: string | undefined): string;
/** Initialize the JSX, model, view, mediator, and router integration. */
export declare function initializeWhiteLabelPage(documentRoot: Document): WhiteLabelApplication;
