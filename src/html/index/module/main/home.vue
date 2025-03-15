<template>
    <!-- 主页容器 -->
    <div class="home-page">
        <!-- 左侧菜单栏 -->
        <side-menu></side-menu>
        <!-- 中间文章列表区域 -->
        <article-list></article-list>
        <!-- 右侧边栏（包含小组件） -->
        <right-panel></right-panel>
    </div>
</template>

<script>
// 导入组件
import SideMenu from '../../component/layout/side-menu.vue';
import RightPanel from '../../component/layout/right-panel.vue';
import ArticleList from '../../component/article/article-list.vue';

export default {
    // 注册组件
    components: {
        ArticleList,
        SideMenu,
        RightPanel
    },
    data() {
        return {}
    }
}
</script>

<style lang="less" scoped>
.home-page {
    display: flex;  // 使用flex布局
    gap: 20px;      // 组件之间的间距
}

// 响应式布局：在移动端将横向排列改为纵向排列
@media screen and (max-width: 768px) {
    .home-page {
        flex-direction: column;
    }
}
</style>