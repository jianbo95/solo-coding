// TODO 实现crud.js
let get = function(dao, table) {
    if(table == null) {
        table = dao;
        dao = 'dao';
    }
    if(dao == null) {
        console.error('参数dao不能为空');
    }
    if(table == null) {
        // console.error('参数table不能为空');
    }
    // console.log('table', table);
    // console.log('dao', dao);

    let util = {
        param(requestParam) {
            let base =  {
                dao: dao,
                table: table
            };
            if(requestParam != null) {
                for(var key in requestParam) {
                    base[key] = requestParam[key];
                }
            }
            return base;
        },
        request(url, param, _call) {
            param = this.param(param);
            console.log('请求参数', param);
            $.post(url, param, (result) => {
                console.log('crud request result', result);
                _call(result.data);
            }, 'json');
        },
    };

    let crud = {
        // 分页查询接口
        pagin(param, _call) {
            let url = Constants.root + 'crud_v2/datagrid';
            util.request(url, param, _call);
        },
        // 全部查询接口
        queryAll(_call) {
            let url = Constants.root + 'crud_v2/list';
            util.request(url, {}, _call);
        },
        // 列表查询接口
        list(param, _call) {
            let url = Constants.root + 'crud_v2/list';
            util.request(url, param, _call);
        },
        // 编辑接口
        edit(param, _call) {
            let url = Constants.root + 'crud_v2/edit';
            util.request(url, param, _call);
        },
        // 批量编辑接口
        editBatch(update, cnd, _call) {
            let url = Constants.root + 'crud_v2/editBatch';
            var param = {};
            param.update = JSON.stringify(update);
            param.cnd = JSON.stringify(cnd);
            util.request(url, param, _call);
        },
        // 删除接口
        delete(param, _call) {
            let url = Constants.root + 'crud_v2/delete';
            util.request(url, param, _call);
        },
        // 删除接口
        clear(param, _call) {
            let url = Constants.root + 'crud_v2/clear';
            util.request(url, param, _call);
        },
        // 新增接口
        add(param, _call) {
            let url = Constants.root + 'crud_v2/add';
            util.request(url, param, _call);
        },
        // 字段枚举接口
        enum(field, _call) {
            let url = Constants.root + 'crud_v2/fieldEnum';
            let param = {
                field: field
            };
            util.request(url, param, _call);
        },
        // 字段枚举接口
        fieldKeyMap(keyField, descriptionField, _call) {
            let url = Constants.root + 'crud_v2/fieldKeyMap';
            let param = {
                keyField: keyField,
                descriptionField: descriptionField
            };
            util.request(url, param, _call);
        },
        // 字段映射接口
        fieldMap(table, _call) {
            let url = Constants.root + 'crud_v2/fieldAllMap';
            let param = {
                table: table
            };
            util.request(url, param, _call);
        }
    }
    return crud;
}

export default {
    get: get,
    
    httpThird: get('dao', 'http_third'),
    httpUnit: get('dao', 'http_unit'),
    sysView: get('sys_view'),
    processEntity: get('h2mem-PUBLIC', 'process_entity')
}