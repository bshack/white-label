import WLModel from 'white-label-model';
import data from '../../../data/config.json';

(() => {
    module.exports = new WLModel.Model(data);
})();
