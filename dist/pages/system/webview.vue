<template>
    <div style="height:100%;" v-if="init">
        <!-- 显示多个 iframe -->
        <!-- <template v-for="(v, k) in webview">
            <div>{{k}} : {{v}}</div>
        </template> -->
        <template v-for="(v, k) in webview">
            <iframe v-show='queryBody == k' v-if='initIframe[k]' style="width:100%; height:100%;" :src="v" frameborder="0"></iframe>
        </template>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            init: false,
            initIframe: {},
            Store: Store,
            webview: webview,
            queryBody: Store.state.queryBody,
        }
    },
    created() {
        // var info = UrlParser.parseLocal();
        // var queryBody = info.queryBody;
        console.log('this.queryBody', this.queryBody);
        this.initIframe[this.queryBody] = true;
        this.init = true;
    },
    watch: {
        'Store.state.queryBody': function(value) {
            if(this.queryBody != value && value != null) {
                this.queryBody = value;
                console.log('change src', this.src);
                this.initIframe[this.queryBody] = true;
            }
        }
    }
}
</script>