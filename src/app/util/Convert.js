export default {
    listToMap: function(list) {    
        return this.valueMap(list);
    },
    pairListToMap (list, key, value) {
        var map = {};
        for (let index = 0; index < list.length; index++) {
            const item = list[index];
            map[item[key]] = item[value];
        }
        return map;
    },
    listFields(list, field) {
        var values = [];
        for(var i in list) {
            var value = list[i];
            var fieldValue = value[field];
            values.push(fieldValue);
        }
        return values;       
    },
    valueMap(values) {
        var map = {};
        for(var i in values) {
            var value = values[i];
            map[value] = value;
        }
        return map;
    },
}