export default {
    get(key) {
        // parse from url
        var info = Util.urlParse(location.href, true);;
        // console.log(info);
        var strValue = info.hashQuery[key];
        if(strValue == null) {
            return null;
        }
        if(strValue.startsWith('[') || strValue.startsWith('{')) {
            return JSON.parse(strValue);
        } else {
            return strValue;
        }
    },
    put(key, value) {
        if(Util.isObject(value) || Util.isArray(value)){
            value = JSON.stringify(value);
        }
        Util.changeURLStatic(key, value);
    }
};