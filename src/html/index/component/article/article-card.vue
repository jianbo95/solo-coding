<template>
    <div class="article-card" @click="goToDetail">
        <h2 class="title">{{ article.name }}</h2>
        <div class="meta">
            <span class="time">
                <i class="el-icon-time"></i>
                {{ article.time }}
            </span>
            <span class="tags">
                <i class="el-icon-collection-tag"></i>
                <el-tag 
                    :size="size" 
                    v-for="tag in article.tags" 
                    :key="tag">
                    {{ $t('tag.' + tag) }}
                </el-tag>
            </span>
        </div>
        <p class="summary">{{ summary }}</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            size: window.size
        }
    },
    props: {
        article: {
            type: Object,
            required: true
        }
    },
    computed: {
        summary() {
            if(window.LocaleType === 'en') {
                return this.article['summary.en'];
            }
            return this.article.summary
        }
    },
    methods: {
        goToDetail() {
            this.$router.push({
                path: '/article',
                query: { id: this.article.id }
            });
        }
    }
}
</script>

<style lang="less" scoped>
.article-card {
    
    @media screen and (max-width: 768px) {
        padding: 10px;
    }
    @media screen and (min-width: 768.0001px) {
        padding: 20px;
    }
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px 0 rgba(0,0,0,0.15);
    }
    
    .title {
        font-size: 18px;
        margin-bottom: 15px;
    }
    
    .meta {
        display: flex;
        @media screen and (max-width: 768px) {
            gap: 10px;
        }
        @media screen and (min-width: 768.0001px) {
            gap: 10px;
        }
        
        margin-bottom: 15px;
        color: #666;
        align-items: center;  /* 添加垂直居中对齐 */
        
        .time {
            display: flex;
            align-items: center;  /* 时间图标垂直居中 */
            gap: 5px;  /* 图标和文字的间距 */
        }
        
        .tags {
            display: flex;
            gap: 10px;
            align-items: center;
            
            .el-tag {
                margin-left: 5px;
            }
        };
    }
    
    .summary {
        color: #666;
        line-height: 1.6;
    }
}
</style>