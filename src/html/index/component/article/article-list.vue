<template>
    <div class="article-list">
        <article-card 
            v-for="article in articles" 
            :key="article.id"
            :article="article">
        </article-card>
    </div>
</template>

<script>
import ArticleCard from './article-card.vue';

export default {
    components: {
        ArticleCard
    },
    data() {
        return {
            articles: [
                {
                    id: 1,
                    title: '第一篇文章',
                    summary: '这是第一篇文章的简介...',
                    date: '2023-10-20',
                    tags: ['JavaScript', 'Vue']
                },
                {
                    id: 2,
                    title: '第二篇文章',
                    summary: '这是第二篇文章的简介...',
                    date: '2023-10-21',
                    tags: ['Web开发', 'CSS']
                }
            ]
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