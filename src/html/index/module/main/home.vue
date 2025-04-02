<template>
    <div class="home-page">
        <div style="height:200px;">
            <div class="banner" >
                <div style="font-size: 30px;">
                    This is Place of
                </div>
                <div style="margin-top:10px;">
                    <span style="font-size: 40px; color:#fff; background-color: orange; padding: 0px 10px;">
                        Secure. & Peace.
                    </span>
                </div>
                <div style="font-size: 20px; margin-top:15px;">
                    <span class="outlined-text">
                        Let you experience happiness And Take Your Mind In Peace!!!
                    </span>
                </div>
            </div>
        </div>
        <div class="home-container">
            <!-- 主页容器 -->
            <div class="home-main" style="width:1300px;margin:0 auto;">
                <!-- 左侧菜单栏 -->
                <side-menu></side-menu>
                <!-- 中间文章列表区域 -->
                <article-list></article-list>
                <!-- 右侧边栏（包含小组件） -->
                <right-panel></right-panel>
            </div>
        </div>
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

    .home-main {
        display: flex;  // 使用flex布局
        gap: 20px;      // 组件之间的间距
    }

    .banner {
        padding-top:20px; 
        text-align: center;
    }

    @media screen and (min-width: 768.0001px) {
        .home-container{ 
            width: 100%; background-color: #eee; padding-top:20px;
        }
    }
    // 响应式布局：在移动端将横向排列改为纵向排列
    @media screen and (max-width: 768px) {
        .home-container{ 
            width: 100%; background-color: #eee; padding-top:10px;
        } 

        .banner {
            padding-top: 10px; 
            text-align: center;
        }

        .home-main {
            flex-direction: column;
            width: calc(100% - 10px) !important;
            padding: 0 5px;

            .side-menu {
                display: none;
            }

            .right-panel {
                width: 100% !important;
                margin: 0;
            }
        }
    }

    .outlined-text {
        color: #000;
        font-weight: bold;
        text-shadow: 
            -1px -1px 0 #fff,
            1px -1px 0 #fff,
            -1px 1px 0 #fff,
            1px 1px 0 #fff,
            -2px -2px 0 #fff,
            2px -2px 0 #fff,
            -2px 2px 0 #fff,
            2px 2px 0 #fff,
            0 0 8px #fff;
    }
}
</style>