<template>
    <div class="right-panel">
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
import RecentArticles from '../widgets/recent-articles.vue';
import SiteCalendar from '../widgets/site-calendar.vue';
import SiteInfo from '../widgets/site-info.vue';

export default {
    components: {
        ColorTag,
        Clock,
        RecentArticles,
        SiteCalendar,
        SiteInfo
    }
}
</script>

<style lang="less" scoped>
.right-panel {
    width: 300px;
    flex-shrink: 0; // 防止被压缩
    display: flex;
    gap: 20px;
    
    .widgets-container {
        width: 100%; // 改为100%以充满父容器
        
        @media screen and (max-width: 768px) {
            > * {
                margin-bottom: 10px;
            }
        }
        @media screen and (min-width: 768.0001px) {
            > * {
                margin-bottom: 20px;
            }
        }
    }
}

@media screen and (max-width: 768px) {
    .right-panel {
        flex-direction: column;
        width: 100%; // 在移动端占满宽度
        
        .widgets-container {
            width: 100%;
        }
    }
}
</style>