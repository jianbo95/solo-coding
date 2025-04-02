<template>
    <div class="app-container" v-if="init">
        <cc-header></cc-header>
        <div class="app-main">
            <div class="main-content">
                <keep-alive exclude="article">
                    <router-view></router-view>
                </keep-alive>
            </div>
        </div>
    </div>
</template>

<script>
import header from './component/layout/header.vue';
import api from './util/api.js';

export default {
    components: {
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

<style lang="less">

.app-container {
    height: 100%;
    width: calc(100% - 0px);
    overflow: hidden;
    .app-main{
        width:100%;
        height:calc(100% - 50px);
        margin-top:60px;
        overflow-y: auto;
    }
    .main-content {
        height: 100%;
        width: 100%;
        padding: 0px;
        
        // @media screen and (max-width: 768px) {
        //     margin: 40px auto 0;
        // }
        // @media screen and (min-width: 768.00001px) {
        //     margin: 60px auto 0;
        // }
        @media screen and (max-width: 1300px) {
            width: 100%;
        }
    }
    
}

</style>
  