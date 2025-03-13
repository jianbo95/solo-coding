<template>
    <div>
        <h1>ie-test</h1>
        <div v-if="useTime != 0">
            启动耗时：{{useTime}} 毫秒
        </div>
        <div>
            <el-button size="small" type="primary" @click="getCache">获取缓存</el-button>
        </div>
        <div>
            <ie-sub></ie-sub>
        </div>
    </div>
</template>

<script>
// 两句import都会被隐藏掉
import IeSub from './ie-sub.vue';
import IeJs from './ie-js.js';
var TestGlobalJs = {
    log() {
        console.log('TestGlobalJs');
    }
};
IeJs.log();
export default {
    components: {
        'ie-sub': IeSub
    },
    data: function() {
        return {
            useTime: 0
        }
    },
    created() {
        TestGlobalJs.log();
        var start = window.loadTime;
        var end = new Date();
        var ms = end.getTime() - start.getTime();
        console.log('use time', ms);
        this.useTime = ms;
        // 不编译：1600 毫秒
        // 编译：400 毫秒
        // 差距还挺大的
    },
    methods: {
        getCache() {
            // var cache = CoreUtil.requestMap;
            var cache = RequireCode;
            var json = JSON.stringify(cache);
            // console.log(json);
            // 把json下载下来
            let blob = new Blob([json], { type: "application/json" });
            // 创建新的URL并指向File对象或者Blob对象的地址
            const blobURL = window.URL.createObjectURL(blob)
            // 创建a标签，用于跳转至下载链接
            const tempLink = document.createElement('a')
            tempLink.style.display = 'none'
            tempLink.href = blobURL
            let filename = "merge.json";
            tempLink.setAttribute('download', filename);
            // 兼容：某些浏览器不支持HTML5的download属性
            if (typeof tempLink.download === 'undefined') {
                tempLink.setAttribute('target', '_blank')
            }
            // 挂载a标签
            document.body.appendChild(tempLink)
            tempLink.click()
            document.body.removeChild(tempLink)
            // 释放blob URL地址
            window.URL.revokeObjectURL(blobURL)
        }
    }
}
</script>