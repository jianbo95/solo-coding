<template>
    <div class="article-page">
        <div class="article-container">
            <article-content></article-content>
        </div>
        <right-panel></right-panel>
    </div>
</template>

<script>
import ArticleContent from '../../component/article/article-content.vue';
import RightPanel from '../../component/layout/right-panel.vue';

export default {
    components: {
        ArticleContent,
        RightPanel
    },
    data() {
        return {}
    }
}
</script>

<style lang="less" scoped>
.article-page {
    display: flex;
    gap: 20px;
    
    .article-container {
        flex: 1;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
        padding: 20px;
    }
}

@media screen and (max-width: 768px) {
    .article-page {
        flex-direction: column;
    }
}
</style>