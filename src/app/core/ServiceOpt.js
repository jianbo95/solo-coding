export default {
    
    /**
     * // 获取地址
     * @param {String} type datagrid/add/edit/delete
     * @param {Object} opt: {
     *      url: {
     *          datagrid: String,
     *          add: String,
     *          edit: String,
     *          delete: String
     *      }
     * }
     * @returns 
     */
    url(type, opt) {
        if(opt == null) return null;
        if(opt.url == null) return null;
        if(opt.url[type] == null) {
            return null
        } else {
            return Constants.root + opt.url[type];
        }

    }
}