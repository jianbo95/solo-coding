/**
 * Tree.js [创建树形对象，用于无限级分类]
 */

/**
 * [convert 数组转换成树形对象]
 * @param  data           [线性数组]
 * @param  idField        [id名称]
 * @param  parentField    [父id名称]
 * @param  root           [唯一根节点，如果存在]
 * @return                [树形对象]
 *
 * data 格式
 * [{
 * 	  "id": 1,
 * 	  "name": "C",
 * 	  "size": "",
 * 	  "date": "02/19/2010",
 * 	  "parentId": null
 * },{},{}...]
 */
export default {
    checkId(list) {
        let map = {};
        for(let i in list) {
            let item = list[i];
            if(map[item.id] == true) {
                console.error('存在相同ID:' + item.id);
            }
            map[item.id] = true;
        }
    },
    convertByGroup(list) {
        this.checkId(list);
        let splitGroups = (groupsStr) => {
            let groups = groupsStr.split('>');
            let result = [];
            for(let i in groups) {
                let group = groups[i].trim();
                result.push(group);
            }
            return result;
        };
        let nodes = {};

        let demo = {
            '测试': {
                id: 'a',
                parent: null,
            },
            '移动组': {
                id: 'b',
                parent: 'a'
            },
            "mobitest@10.13.1.235": {
                parent: 'b',
                "id":1,
                "name":"mobitest@10.13.1.235",
                "ip":"10.13.1.235",
                "port":22,
                "username":"mobitest",
                "password":"7L#x5WZe1L",
                "groups":"测试 > 移动组 > 235"
            },
        };

        let id = 0;
        let buildId = () => {
            id ++;
            return 'auto' + id;
        };

        let parentId = (lastGroup) => {
            if(lastGroup == null) {
                return null;
            } else {
                return nodes[lastGroup].id;
            }
        };

        let buildIndex = (lastGroup, id) => {
            if(lastGroup == null) {
                return id;
            } else {
                return nodes[lastGroup].id + '-' + id;
            }
        };

        // demo 能转 tree 吗？ 答案：不太能

        // 返回最后一个group的ID
        let addGroup = (groups) => {
            let upGroups = [];
            let lastGroup = null;
            for(let i in groups) {
                let group = groups[i];
                if(nodes[group] == null) {
                    let id = buildId();
                    nodes[group] = {
                        id: id,
                        index: buildIndex(lastGroup, id),
                        title: group,
                        type: 'group',
                        parent: parentId(lastGroup)
                    };
                }
                lastGroup = group;
                upGroups.push(group);
            }
            console.log('lastGroupId', nodes[lastGroup]);
            return nodes[lastGroup];
        };

        let addItem = (item, group)  => {
            item.index = group.index + '-' + item.id;
            item.parent = group.id;
            item.title = item.name;
            item.type = 'item';
            let key = item.name;
            nodes[key] = item;
        };


        for(let i in list) {
            let item = list[i];
            let groupsStr = item.groups;
            // console.log('item.groups', groupsStr);
            
            let groups = splitGroups(groupsStr);
            // console.log('groups', groups);

            let group = addGroup(groups);
            addItem(item, group);
        }

        let nodeList = [];
        for(let key in nodes) {
            nodeList.push(nodes[key]);
        }
        return nodeList;
    },

    parse(tree, idField, parentField) {
        
        tree = JSON.parse(JSON.stringify(tree));

        idField = idField ? idField : "id";
        parentField = parentField ? parentField : "parentId";
        let deleteChildren = (item) => {
            let item2 = {};
            for(let key in item) {
                if(key != 'children') {
                    item2[key] = item[key];
                }
            }
            return item2;
        };
        let parseTree = (tree, list, level, parent) => {
            for(let i in tree) {
                let item = tree[i];
                item.level = level;
                if(parent == null) {
                    item.index = item[idField];
                    item[parentField] = '0';
                } else {
                    item.index = parent.index + '-' + item[idField];
                    item[parentField] = parent[idField];
                }

                if(item.children != null) {
                    parseTree(item.children, list, level + 1, item);
                }

                let pureItem = deleteChildren(item);
                list.push(pureItem);
            }
        };

        let list = [];
        parseTree(tree, list, 0);
        // console.log('parseTree', list);
        return list;
    },
    convert(data, idField, parentField, rootId) {
        var idf = idField ? idField : "id";
        var pf = parentField ? parentField : "parentId";
        // console.log('convertTree', idf, pf);
        // 所有id到节点的映射
        var nodeIdMap = {};
        // 创建一个树
        var rootNodes = new Array();
        var otherNodes = new Array();

        // 数据准备
        for (var i = 0; i < data.length; i++) {
            var node = data[i];
            var id = node[idf]; // 获取id
            nodeIdMap[id] = node; 
        }

        // 根节点判断
        for (var i = 0; i < data.length; i++) {
            var node = data[i];
            var id = node[idf];
            var parentId = node[pf];
            // 获取该节点的父节点
            var parentNode = nodeIdMap[parentId];

            if(id == rootId) {
                // 根节点
                rootNodes.push(node);
                continue;
            }

            if(parentNode == null) {
                // 根节点
                rootNodes.push(node);
            } else {
                if(id == parentId) {
                    rootNodes.push(node);
                } else {
                    // 子节点
                    otherNodes.push(node);
                }
            }
        }

        // console.log(rootNodes);
        // return rootNodes;

        // 子节点判断
        for (var i = 0; i < otherNodes.length; i++) {
            var node = otherNodes[i];
            var id = node[idf];
            var parentId = node[pf];
            // 获取该节点的父节点
            var parentNode = nodeIdMap[parentId];
            if(parentNode == null) {
                console.warn('怎么会没有父节点');
                rootNodes.push(node);
                continue;
            }
            if(parentNode == node) {
                console.warn('父节点怎么能是它自己');
                rootNodes.push(node);
                continue;
            }
            // 父节点添加数组节点
            if(parentNode.children == undefined) {
                parentNode.children = new Array();
            }
            // 父节点添加子节点
            parentNode.children.push(node);
        };

        return rootNodes;
    }
};
// console.log('load tree.js', window.Tree);