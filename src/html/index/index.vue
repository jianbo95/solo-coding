<template>
    <div class="app-container">
        <cc-header></cc-header>
        <div class="main-content">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import header from './component/layout/header.vue';
export default {
    data() {
        return {}
    },
    created() {
        if(window.CloseLoading != null) {
            setTimeout(() => {
                window.CloseLoading();
            }, 100);
        }
    },
    components: {
      'cc-header': header
    }
}
</script>

<style lang="less" scoped>
.app-container {
    width: 100%;
    min-height: 100vh;
    
    .main-content {
        width: 1300px;
        margin: 0 auto;
        padding: 20px;
    }
}

@media screen and (max-width: 1300px) {
    .app-container {
        .main-content {
            width: 100%;
        }
    }
}
</style>
  