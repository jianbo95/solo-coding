<template>
    <div class="other-widgets">
        <div class="widget calendar">
            <div class="widget-title">日历</div>
            <el-calendar :size="window.size"></el-calendar>
        </div>
        
        <div class="widget recent-articles">
            <div class="widget-title">最近文章</div>
            <ul class="article-list">
                <li v-for="article in recentArticles" :key="article.id" @click="goToArticle(article.id)">
                    <span class="title">{{ article.title }}</span>
                    <span class="date">{{ article.date }}</span>
                </li>
            </ul>
        </div>
        
        <div class="widget site-info">
            <div class="widget-title">站点信息</div>
            <ul class="info-list">
                <li>
                    <i class="el-icon-document"></i>
                    文章数：{{ articleCount }}
                </li>
                <li>
                    <i class="el-icon-view"></i>
                    访问量：{{ visitCount }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            recentArticles: [
                { id: 1, title: '第一篇文章', date: '2023-10-20' },
                { id: 2, title: '第二篇文章', date: '2023-10-21' },
                { id: 3, title: '第三篇文章', date: '2023-10-22' }
            ],
            articleCount: 10,
            visitCount: 1000
        }
    },
    methods: {
        goToArticle(id) {
            this.$router.push({
                path: '/article',
                query: { id }
            });
        }
    }
}
</script>

<style lang="less" scoped>
.other-widgets {
    .widget {
        background: #fff;
        border-radius: 4px;
        padding: 20px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
        margin-bottom: 20px;
        
        .widget-title {
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: bold;
        }
        
        &.calendar {
            :deep(.el-calendar) {
                background: none;
                padding: 0;
            }
        }
        
        &.recent-articles {
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
        
        &.site-info {
            .info-list {
                list-style: none;
                padding: 0;
                
                li {
                    display: flex;
                    align-items: center;
                    padding: 10px 0;
                    
                    i {
                        margin-right: 10px;
                        color: #409EFF;
                    }
                }
            }
        }
    }
}
</style>