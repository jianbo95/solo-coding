/**
 * 绑定属性到store
 * @returns 
 */
export default function(page, propName, value, key, store) {
    // console.log('pageOrWatch', pageOrWatch);
    // console.log('instance', instance);
    var watch = page.watch;

    if(key == null) {
        key = propName;
    }

    // 1. 构建监听函数
    var oldWatch;
    if(watch[propName] != null) {
        oldWatch = watch[propName];
    }
    

    if(Util.isBaseType(value)) {
        watch[propName] = function(newValue, oldValue) {
            store.put(key, newValue);
            if(oldWatch != null ) {
                oldWatch(newValue, oldValue)
            }
        };
    } else {
        // console.log('bind object ' + key);
        watch[propName] = {
            handler(newValue, oldValue) {
                var json = JSON.stringify(newValue);
                store.put(key, json);

                if(oldWatch != null) {
                    oldWatch(newValue, oldValue)
                }
            },
            immediate: true,
            deep: true
        }
    }

    // 2. 第一次取值解析
    if(store.get(key) != null) {
        var localValue = store.get(key);
        
        if(localValue.indexOf('{') != -1) {
            return JSON.parse(localValue);
        }
        
        return localValue;
    } else {
        return value;
    }
};