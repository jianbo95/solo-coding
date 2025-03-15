module.exports = {
    // 文章排序函数：置顶文章优先，同时按照id降序排列
    sortArticle: function(data) {
        
        data.sort(function(a, b) {
            // 处理置顶文章的排序
            if(a.top != null || b.top != null) {
                // 如果两篇文章都有置顶值，按置顶值大小降序排列
                if(a.top!= null && b.top!= null) {
                    return a.top - b.top;
                } else if(a.top!= null) {
                    // 如果只有文章a有置顶值，a排在前面
                    return -1;
                } else {
                    // 如果只有文章b有置顶值，b排在前面
                    return 1;
                }
            }
            // 非置顶文章按id降序排列（新文章在前）
            return b.id - a.id;
        });
        return data;
    }
};