<template>
    <div v-if="init">
        file-editor 
        {{filePath}}
        <cc-input-ace width="100%" height="100px"></cc-input-ace>
    </div>
</template>

<script>
import Constants from '../../app/data/Constants';
export default {
    data: function() {
        return {       
            init: false,
            code: ''
        }
    },
    props: {
        filePath: {
            type: String,
            default: null
        }
    },
    created() {
        this.initData(() => {
            this.init = true;
        });
    },
    methods: {
        initData(_call) {
            var url = Constants.root + ApiPath.fileGet;
            Core.post(url, {filename:this.filePath}, (result) => {
                // console.log('result', result);
                this.code = result;
                _call();
            }, 'text');
        }
    }
}
</script>