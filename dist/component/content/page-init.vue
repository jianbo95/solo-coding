<template>
    <!-- 当页面 this.service.onQuery 的时候加载 -->
	<div class="cc-page-init" v-loading="currentLoading" 
        element-loading-text="页面加载中..."
        element-loading-background="rgba(255, 255, 255, 0.9)"
        :style="style">
		<!-- 页面内容 默认不展示 display:inline-block 是为了避免外边距折叠 -->
        <div style="width:100%;height:100%;display:inline-block;" v-if="init"> <!-- 即使槽中内容不展示，仍然会被初始化！ -->
            <slot></slot>
        </div>
	</div>
</template>

<script>
export default {
    data: function() {
        return {
            debug: Core.debug('page-init'),
            currentLoading: true,
            loadingTime: 0,
            firstLoad: true
        }
    },
    computed: {
        style: function() {
            var width;
            if(Util.isIE()) {
                // var width = (Core.getPageWidth() - 80) + "px"; 
                var width = (Core.getPageWidth() - 286) + "px";
            } else {
                var width = "calc(100% - 20px)";
            }
            var style = "height:calc(100% - 20px); width:" + width + "; background:none;"
            if(this.debug) {
                style += "border:10px solid yellow;";
            } else {
                style += "padding:10px;";
            }
            return style;
        }
    },
    created: function() {
        if(this.init == null || this.init == 'init') {
            console.warn('错误：<cc-page>组件init参数未绑定');
            UI.error('错误：<cc-page>组件init参数未绑定');
        }
        this.currentLoading = this.loading;
        this.loadingTime = new Date().getTime();
    },
    props: {
        init: {
            default: true,
            type: Boolean
        },
        loading: {
            default: false,
            type: Boolean
        }
    },
    watch: {
        loading: function(value) {
            if(this.firstLoad) {
                // console.log('first load, fast load');
                this.firstLoad = false;
                this.currentLoading = this.loading;
                return ;
            }
            // 优化，避免加载框闪烁
            var _this = this;
            // console.log('page init loading ' + value);
            if(value == false) {
                var closeLoadingTime = new Date().getTime();
                var useTime = closeLoadingTime - this.loadingTime;
                // console.log('经过时间：' + useTime + '毫秒');
                var delayTime = 500 - useTime;
                if(delayTime < 0) {
                    _this.currentLoading = value;
                } else {
                    setTimeout(function() {
                        _this.currentLoading = value;
                    }, delayTime);
                }
            } else {
                _this.currentLoading = value;
                _this.loadingTime = new Date().getTime();
            }
        }
    }
}
</script>

<style>
</style>