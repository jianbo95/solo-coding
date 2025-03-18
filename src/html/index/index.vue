<template>
    <div class="app-container" v-if="init">
        <cc-header></cc-header>
        <div style="width:100%;">
            <div class="main-content">
                <keep-alive exclude="article">
                    <router-view></router-view>
                </keep-alive>
            </div>
        </div>
        <cc-footer></cc-footer>
    </div>
</template>

<script>
import footer from './component/layout/footer.vue';
import header from './component/layout/header.vue';
import api from './util/api.js';

export default {
    components: {
        'cc-footer': footer,
        'cc-header': header,
    },
    data() {
        return {
            init: false
        }
    },
    created() {
        if(window.CloseLoading != null) {
            this.initData(() => {
                this.init = true;
                window.CloseLoading();
            });
        }
    },
    methods: {
        initData(_call) {
            const store = StoreFactory.getStore('mem');
            api.getArticle((res) => {
                console.log('初始化文章列表', res);
                store.put('articles', res);
                var articles = res;
                // 记录id到文章的映射
                var idToArticle = {};
                for (var i = 0; i < articles.length; i++) {
                    var info = articles[i];
                    idToArticle[info.id] = info;
                }
                // 使用 StoreFactory 获取本地存储对象并保存数据
                store.put('idToArticle', idToArticle);
                _call();
            });
        }
    }
}
</script>

<style lang="less" scoped>
.app-container {
    width: calc(100% - 0px);
    overflow: hidden;
    .main-content {
        margin: 80px auto 0;  /* 分别设置上、左右、下边距 */
        width: 100%;
        padding: 0px;
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
  