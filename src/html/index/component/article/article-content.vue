<template>
    <div class="article-content">
        <h1 class="title">{{ title || '加载中...' }}</h1>
        <div class="meta">
            <span class="time">
                <i class="el-icon-time"></i>
                {{ time }}
            </span>
            <span class="tags">
                <i class="el-icon-collection-tag"></i>
                <el-tag 
                    :size="window.size" 
                    v-for="tag in tags" 
                    :key="tag">
                    {{ tag }}
                </el-tag>
            </span>
        </div>
        <div class="content" v-if="init">
            <cc-super-markdown style="height:100%;" 
            relative='out'
            :tab-right="20"
            :tab-top="0"
            :code="content"
            >
            </cc-super-markdown>
        </div>
    </div>
</template>

<script>
import http from '@/html/index/util/http.js';
export default {
    data() {
        return {
            init: false,
            title: '',
            time: '',
            tags: [],
            content: ''
        }
    },
    watch: {
        '$route.query.id': {
            immediate: true,
            handler(newId) {
                if (newId) {
                    this.init = false;
                    this.loadArticle(newId, (articleData) => {
                        this.title = articleData.title;
                        this.time = articleData.time;
                        this.tags = articleData.tags;
                        this.content = articleData.content;
                        this.init = true;
                    });
                }
            }
        }
    },
    methods: {
        loadArticle(id, _call) {
            const store = StoreFactory.getStore('mem');
            const map = store.get('idToArticle');
            const articleInfo = map[id];
            const articleData = {
                title: articleInfo.name,
                time: articleInfo.time,
                tags: articleInfo.tags
            };
            const path = articleInfo.path;
            http.getStr(path, (text) => {
                text = text.substring(text.indexOf('\n') + 1);
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