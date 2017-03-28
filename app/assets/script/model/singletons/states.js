import WLModel from 'white-label-model';
import data from '../../../data/states.json';

(() => {
    module.exports = new WLModel.Collection(data);
})();
