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