var treeToList = (tree, idField, parentField) => {
        
    idField = idField ? idField : "id";
    parentField = parentField ? parentField : "parentId";
    
    let parseTree = (tree, list, level, parent) => {
        for(let i in tree) {
            let item = tree[i];
            item.level = level;
            if(parent == null) {
                item[parentField] = '0';
            } else {
                item[parentField] = parent[idField];
            }

            if(item.children != null) {
                parseTree(item.children, list, level + 1, item);
            }

            list.push(item);
        }
    };

    let list = [];
    parseTree(tree, list, 0);
    // console.log('parseTree', list);
    return list;
};

let TreeWrap = function(tree, idField, parentField) {
    let self = {
        tree: tree,
        list: null,
        loadTree() {
            this.list = treeToList(this.tree, idField, parentField);
        },
        loop(_call) {
            for (let i = 0; i < this.list.length; i++) {
                let item = this.list[i];
                _call(item);
            }
        },
        findNode(nodeId) {
            for(var i in this.list) {
                var item = this.list[i];
                if(item.id == nodeId) {
                    return item;
                }
            }
            return null;
        },
        findParent(node, parentNodes, flag, loopSize) {
            if(loopSize == null) {
                loopSize = 0;
            } else {
                loopSize ++;
            }
            if(loopSize > 10) {
                console.error('循环次数达到10');
                return;
            }
            // console.log('find parent by ' + flag, node);
            if(node == null) {
                console.error('find parent by null');
            }
            if(parentNodes == null) {
                parentNodes = [];
            }
            var pid = node.parentId;
            if(pid == null) {
                return parentNodes;
            }
            var parent = this.findNode(pid);
            if(parent == null || pid == 0) { // 这里应该用 || 吧
                return parentNodes;
            } else {
                if(parent == null) {
                    console.error('node.parentId', parentNodes);
                }
            }
            parentNodes.push(parent);
            return this.findParent(parent, parentNodes, flag, loopSize);
        },
        addSon(outNode, children) {
            var node = this.findNode(outNode.id);
            node.children = children;
            this.loadTree();
        },
        newChildren(items) {
            var arr = [];
            for(var i in items) {
                var item = items[i];
                if(item.children != null) {
                    item.children = this.newChildren(item.children);
                }
                arr.push(item);
            }
            return arr;
        },
        rootMenu() {
            var newTree = [];
            for(var i in this.tree) {
                var item = this.tree[i];
                if(item.children != null) {
                    item.children = this.newChildren(item.children);
                }
                newTree[i] = item;
            }
            this.tree = newTree;
            return newTree;
        }
    };

    self.loadTree(tree);
    return self;
};

export default TreeWrap;