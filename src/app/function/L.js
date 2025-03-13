import DataBind from '../core/data-bind.js';
import HashStore from '../core/store/hash-store.js';

export default function(page, propName, value, key) {
    return DataBind(page, propName, value, key, HashStore);
};
