export default {
    getStr(key) {
        return localStorage.getItem(key);
    },
    get(key){
		let strValue = localStorage.getItem(key);
        if(strValue == null) {
            return strValue;
        }
        if(strValue.startsWith('[') || strValue.startsWith('{')) {
            return JSON.parse(strValue);
		} else {
			return strValue;
		}
    },
    put(key, value) {
        if(Util.isObject(value) || Util.isArray(value)){
           return  localStorage.setItem(key, JSON.stringify(value));
        }else{
            return localStorage.setItem(key, value)
        }
    },
}