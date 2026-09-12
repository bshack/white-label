import Mediator from 'white-label-mediator';
import { Model } from 'white-label-model';
import Router from 'white-label-router';
import View from 'white-label-view';
/** Public handles used to verify and release every integrated white-label package. */
export interface GoldRushApplication {
    mediator: Mediator;
    eraIndex: Model<Array<string | undefined>>;
    model: Model;
    router: Router;
    view: View;
    destroy(): void;
}
/** Return a supported era, falling back to the complete chronology. */
export declare function normalizeEra(value: string | undefined): string;
/** Initialize the Eta, model, view, mediator, and router integration. */
export declare function initializeGoldRushPage(documentRoot: Document): GoldRushApplication;
