<template>
    <div class="article-content">
        <h1 class="title">{{ articleData ? articleData.title : '加载中...' }}</h1>
        <div class="meta">
            <span class="time">
                <i class="el-icon-time"></i>
                {{ articleData ? articleData.time : '' }}
            </span>
            <span class="tags">
                <i class="el-icon-collection-tag"></i>
                <el-tag 
                    :size="window.size" 
                    v-for="tag in (articleData ? articleData.tags : [])" 
                    :key="tag">
                    {{ tag }}
                </el-tag>
            </span>
        </div>
        <div class="content" v-init="init">
            <cc-markdown style="height:100%;" 
            relative='out'
            :tab-right="20"
            :tab-top="0"
            >
            
            {{ articleData.content }}
            
            </cc-markdown>
        </div>
    </div>
</template>

<script>
import http from '@/html/index/util/http.js';
export default {
    data() {
        return {
            init: false,
            articleData: null
        }
    },
    created() {
        // 从 URL 查询参数中获取文章 id
        const articleId = this.$route.query.id;
        if (articleId) {
            this.loadArticle(articleId, (articleData) => {
                this.articleData = articleData;
                this.init = true;
            });
        }
    },
    methods: {
        loadArticle(id, _call) {
            const store = StoreFactory.getStore('mem');
            const map = store.get('idToArticle');
            const articleInfo = map[id];
            // 这里可以根据文章 id 从后端获取文章数据
            // 这里只是一个示例，你需要根据你的实际情况进行修改
            const articleData = {
                title: articleInfo.name,
                time: articleInfo.time,
                tags: articleInfo.tags
            };
            const path = articleInfo.path;
            http.getStr(path, (text) => {
                articleData.content = text;
                _call(articleData);
            });
        }
    }
}
</script>

<style lang="less" scoped>
.article-content {
    .title {
        font-size: 24px;
        margin-bottom: 20px;
    }
    
    .meta {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
        color: #666;
        align-items: center;  /* 添加垂直居中对齐 */
        
        .time {
            display: flex;
            align-items: center;  /* 时间图标和文字垂直居中 */
            gap: 5px;  /* 图标和文字的间距 */
            
            i {
                margin-right: 3px;  /* 图标右侧间距 */
            }
        }
        
        .tags {
            display: flex;
            gap: 10px;
            align-items: center;
            
            i {
                margin-right: 3px;  /* 图标右侧间距 */
            }
            
            .el-tag {
                margin-left: 5px;
            }
        }
    }
    
    .content {
        line-height: 1.8;
    }
}
</style>