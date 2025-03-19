<!-- 文章单独页 -->
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
        return {
        }
    }
}
</script>

<style lang="less" scoped>
.article-page {
    display: flex;
    margin:0 auto;
    
    @media screen and (min-width: 768.0001px) {
        width: 1300px; 
        padding-top:10px;
        gap: 20px;
    }

    @media screen and (max-width: 768px) {
        gap: 10px;
        flex-direction: column;
        width: calc(100% - 10px);
        padding: 10px 5px 0 5px;


        .right-panel {
            width: 100% !important;
            margin: 0;
        }
    }
 
    .article-container {
        flex: 1;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

        @media screen and (min-width: 768.0001px) {
            margin-bottom: 20px;
            padding: 20px;
        }
        @media screen and (max-width: 768px) {
            margin-bottom: 0px;
            padding: 0 10px;
        }
    }
}

</style>