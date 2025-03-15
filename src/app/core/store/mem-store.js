export default {
    // 内存存储对象
    memStorage: new Map(),

    // 获取字符串值
    getStr(key) {
        return this.memStorage.get(key);
    },

    // 获取值
    get(key) {
        return this.memStorage.get(key);
    },

    // 存储值
    put(key, value) {
        this.memStorage.set(key, value);
    }
}