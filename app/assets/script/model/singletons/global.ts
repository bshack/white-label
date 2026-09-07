/** @module app/assets/script/model/singletons/global */
import WLModel from 'white-label-model';
const data: Record<string, unknown> = {cdn: '/', www: '/', service: '/service-endpoint'};

export default new WLModel.Model(data);
