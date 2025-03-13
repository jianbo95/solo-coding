import Tree from "../../util/Tree.js";

export default {
    bind(page, data) {
        let rows = data.rows;
        let config = page.config.convertTree;
        let tree = Tree.convert(rows, config.id, config.parentId, config.rootId);
        console.log('bind Tree', tree);
        page.rows = tree;
    }
}