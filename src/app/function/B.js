import DataBind from '../core/data-bind.js';
import LocalStore from '../core/store/local-store.js';

export default function(page, propName, value, key) {
    return DataBind(page, propName, value, key, LocalStore);
};
