<script>
// 导入组件
import SideMenu from '../../component/layout/side-menu.vue';
import RightPanel from '../../component/layout/right-panel.vue';
import ArticleList from '../../component/article/article-list.vue';

var compiled = 
    {
        render: `with(this){return [_c('div',{staticClass:"home-page"},[_m(0),_v(" "),_c('div',{staticClass:"home-container"},[_c('div',{staticClass:"home-main",staticStyle:{"width":"1300px","margin":"0 auto"}},[_c('side-menu'),_v(" "),_c('article-list'),_v(" "),_c('right-panel')],1)])])]}`,
        staticRenderFns: [
            `with(this){return _c('div',{staticStyle:{"height":"200px"}},[_c('div',{staticClass:"banner"},[_c('div',{staticStyle:{"font-size":"30px"}},[_v("\\r\\n                    This is Place of\\r\\n                ")]),_v(" "),_c('div',{staticStyle:{"margin-top":"10px"}},[_c('span',{staticStyle:{"font-size":"40px","color":"#fff","background-color":"orange","padding":"0px 10px"}},[_v("\\r\\n                        Secure. & Peace.\\r\\n                    ")])]),_v(" "),_c('div',{staticStyle:{"font-size":"20px","margin-top":"15px"}},[_c('span',{staticClass:"outlined-text"},[_v("\\r\\n                        Let you experience happiness And Take Your Mind In Peace???\\r\\n                    ")])])])])}`
        ],
    }

var createFunction = Vue.stringToFunction;
 // 在 Vue 的编译过程中，模板（template）会被编译成字符串形式的渲染函数代码。为了让这些代码能够在运行时被执行，需要将它们转换为 JavaScript 函数。这段代码就是完成这个转换过程的关键部分。
 var res = {};
 var fnGenErrors = [];
 res.render = createFunction(compiled.render, fnGenErrors);
 res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
   return createFunction(code, fnGenErrors)
 });

export default {
    // 注册组件
    components: {
        ArticleList,
        SideMenu,
        RightPanel
    },
    data() {
        return {
            'test': 'jianbo1011'
        }
    },
    render: res.render,
    staticRenderFns: res.staticRenderFns,
}
</script>

<style lang="less">
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