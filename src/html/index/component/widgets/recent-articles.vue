<template>
    <div class="widget recent-articles">
        <div class="widget-title">最近文章</div>
        <ul class="article-list">
            <li v-for="article in recentArticles" :key="article.id" @click="goToArticle(article.id)">
                <span class="title">{{ article.name }}</span>
                <!-- <span class="date">{{ article.time }}</span> -->
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'RecentArticles',
    data() {
        return {
            recentArticles: [
            ]
        }
    },
    created() {
        this.loadArticle();
    },
    methods: {
        loadArticle() {
            // 指定返回的数据是json格式
            $.ajax({
                url: '/html/index/article/article-recently.json?version=' + window.Version,
                method: 'GET',
                dataType: 'json',
                success: (res) => {
                    this.recentArticles = res;
                }
            });
        },
        goToArticle(id) {
            // 检查当前路由是否已经是文章页面且 id 相同
            if (this.$route.path === '/article' && this.$route.query.id === id) {
                return;
            }
            this.$router.push({
                path: '/article',
                query: { id }
            });
        }
    }
}
</script>

<style lang="less" scoped>
.widget {
    background: #fff;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    
    .widget-title {
        font-size: 18px;
        margin-bottom: 15px;
        font-weight: bold;
    }
    
    .article-list {
        list-style: none;
        padding: 0;
        
        li {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            
            &:last-child {
                border-bottom: none;
            }
            
            &:hover .title {
                color: #409EFF;
            }
            
            .title {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                transition: color 0.3s;
            }
            
            .date {
                color: #999;
                margin-left: 10px;
            }
        }
    }
}
</style>