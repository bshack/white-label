/** @module app/assets/script/model/singletons/countries */
import WLModel from 'white-label-model';
import data from '../../../data/coutries.json' with {type: 'json'};

export default new WLModel.Collection(data);
