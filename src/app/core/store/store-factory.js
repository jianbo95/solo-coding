import hashStore from "./hash-store.js";
import localStore from "./local-store.js";
import memStore from "./mem-store.js";

export default {
    // 根据不同的策略返回 hash-store 或者 local-store
    getStore(strategy) {
        if(strategy == 'hash') {
            return hashStore;
        } else if(strategy == 'local') {
            return localStore;
        } else if(strategy == 'mem') {
            return memStore;
        } else {
            return hashStore;
        }
    }
}