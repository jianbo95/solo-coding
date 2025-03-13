<template>
    <div class="home-page">
        <side-menu></side-menu>
        <right-panel></right-panel>
    </div>
</template>

<script>
import SideMenu from '../../component/layout/side-menu.vue';
import RightPanel from '../../component/layout/right-panel.vue';

export default {
    components: {
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
    display: flex;
    gap: 20px;
}

@media screen and (max-width: 768px) {
    .home-page {
        flex-direction: column;
    }
}
</style>