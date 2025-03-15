<template>
    <div class="article-list">
        <article-card 
            v-for="article in articles" 
            :key="article.id"
            :article="article">
        </article-card>
        <!-- 加一个分页 -->
    </div>
</template>

<script>
import ArticleCard from './article-card.vue';
import api from '../../util/api.js';

export default {
    components: {
        ArticleCard
    },
    data() {
        return {
            articles: [
                {
                    id: 1,
                    title: '我独自升级',
                    summary: '这是第一篇文章的简介...',
                    date: '2023-10-20',
                    tags: ['JavaScript', 'Vue']
                },
                {
                    id: 2,
                    title: '我独自打码',
                    summary: '这是第二篇文章的简介...',
                    date: '2023-10-21',
                    tags: ['Web开发', 'CSS']
                }
            ]
        }
    },
    created() {
        this.loadArticle();
    },
    methods: {
        loadArticle() {
            const store = StoreFactory.getStore('mem');
            var res = store.get('articles');
            this.articles = res;
        }
    }
}
</script>

<style lang="less" scoped>
.article-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>