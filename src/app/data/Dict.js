/**
 * 字典获取
*/

import Util from '../util/Util.js';

var data = {
    status: '待获取', // 从接口获取
    bool: {
        '1': '是',
        '0': '否'
    },
    state: {
        'success': '成功',
        'failure': '失败',
        'exception': '异常',
    },
    project: {

    },
	cacheType: {
		'role_auth': '角色权限'
	},
    dict: {}
};




export default {
    /**
     * 获取步骤代码
     * @param {String} name 
     * @returns 
     */
    step(name) {
        let value = data.step[name];
        if(value == null) {
            alert('该步骤不存在：' + name);
        }
        return value;
    },

    /**
     * 获取字典
     * @param {String} type 
     */
    get(type) {
        return data[type];
    },

    /**
     * 获取dict值
     * @param {String} name 
     */
    dict(name) {
        return data.dict[name];
    },

    /**
     * 设置字典
     * @param {String} type 
     * @param {Object} info 字典详细
     */
    set(type, info) {
        data[type] = info;
    },

    /**
     * 获取字典，部分数据
     * @param {String} type 
     * @param {Array} arr 获取项
     */
    part(type, arr) {
        var map = this.get(type);
        var map2 = {};
        for(var key in map) {
            if(Util.inArray(key, arr)) {
                map2[key] = map[key];
            }
        }
        return map2;
    },

    /**
     * 获取字典列表格式
     * 例如： { aaa: 'AAA'} => [{value:'aaa',label:'AAA'}]
     * @param {Stirng} type 
     * @param {String} valueField 
     * @param {String} labelField 
     */
    getList(type, valueField, labelField) {
        valueField = valueField || 'value';
        labelField = labelField || 'label';
        var map = this.get(type);
        // TODO 增加map类型校验
        var list = [];
        
        for(var key in map) {
            var value = map[key];
            var obj = {};
            
            obj[valueField] = key;
            obj[labelField] = value;
            
            list.push(obj);
        }
        return list;
    }
};

// var typeMap = dict.get('checkAccountType');
// console.log(typeMap);

// var typeList = dict.getList('checkAccountType');
// console.log(typeList);