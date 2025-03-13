<template>
    <div class="right-panel">
        <article-list></article-list>
        <div class="widgets-container">
            <recent-articles></recent-articles>
            <color-tag :tags="[
                { name: 'JavaScript', count: 15 },
                { name: 'Vue', count: 12 },
                { name: 'CSS3', count: 8 }
            ]"></color-tag>
            <clock></clock>
            <site-calendar></site-calendar>
            <site-info></site-info>
        </div>
    </div>
</template>

<script>
import ColorTag from '../widgets/color-tag.vue';
import Clock from '../widgets/clock.vue';
import ArticleList from '../article/article-list.vue';
import RecentArticles from '../widgets/recent-articles.vue';
import SiteCalendar from '../widgets/site-calendar.vue';
import SiteInfo from '../widgets/site-info.vue';

export default {
    components: {
        ColorTag,
        Clock,
        ArticleList,
        RecentArticles,
        SiteCalendar,
        SiteInfo
    }
}
</script>

<style lang="less" scoped>
.right-panel {
    flex: 1;
    display: flex;
    gap: 20px;
    
    .widgets-container {
        width: 270px;
        
        > * {
            margin-bottom: 20px;
        }
    }
}

@media screen and (max-width: 768px) {
    .right-panel {
        flex-direction: column;
        
        .widgets-container {
            width: 100%;
        }
    }
}
</style>