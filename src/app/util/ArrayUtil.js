	var arrayUtil = {};

/**
 * 排列对象数组
 */
arrayUtil.sort = function(list, key) {

};

/**
 * 分割数组
 * split Array
 */
arrayUtil.split = function(data, size) {
    var result = [];
    var len = data.length;
    for(var i = 0; i < len; i += size){
        result.push(data.slice(i, i + size));
    }
    return result;
};

/**
 * 克隆数组
 */
arrayUtil.clone = function(arr) {
    var clone = new Array();
    for (var i = 0; i < arr.length; i++) {
        clone.push(arr[i]);
    }
    return clone;
};

/**
 * 合并数组
 * concatArray
 */
arrayUtil.concat = function(list1, list2) {
    return list1.concat(list2);
}

/**
 * 如果在数组里存在，则返回true
 * */
arrayUtil.inArray = function(object, arr){
    var flag = false;
    for (var i = 0; i < arr.length; i++) {
        var v = arr[i];
        if (v === object) {
            flag = true;
        }
    }
    return flag;
}

/**
 * 对象数组获取对象
 */
arrayUtil.getObject = function(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        var element = array[i];
        if(element[key] == value) {
            return element;
        }
    };
    return false;
}

export default arrayUtil;
