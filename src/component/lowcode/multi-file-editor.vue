<template>
    <div v-if="init">
        <cc-input-ace :value="debugData" height="300px" v-if="debug"></cc-input-ace>
        <template v-if="fileList.length > 1">
            <el-tabs v-model="activeName">
                <template v-for="(file, i) in fileList">
                    <el-tab-pane :label="file.filename" :name="file.filename" :key="i">
                        <div>
                            <el-button type="primary" size="mini" @click="save">保存</el-button>
                        </div>
                        <cc-input-ace v-model="file.code" height="auto" :use-wrap="false" :mode="file.langMode"></cc-input-ace>
                    </el-tab-pane>
                </template>
            </el-tabs>
        </template>
        <template v-else>
            <div>
                <el-button type="primary" size="mini" @click="save">保存</el-button>
            </div>
            <cc-input-ace v-model="file.code" height="auto" :use-wrap="false" :mode="file.langMode"></cc-input-ace>
        </template>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
            debug: false,
            init: false,
            originFileList: null,
            fileMap: {},
            activeName: null
        }
    },
    computed: {
        file() {
            return this.fileList[0];
        },
        debugData() {
            return JSON.stringify(this.originFileList, ' ', 4);
        }
    },
    props: {
        fileList: {
            type: Array,
            default: []
        }
    },
    created() {
        this.initData();
    },
    methods: {
        save() {
            var filename = this.activeName;
            var file = this.fileMap[filename];
            var param = {
                filename: file.fullPath,
                data: file.code
            };
            // 保存代码
            var url = Constants.root + ApiPath.fileSave;
            Core.post(url, param, (result) => {
                UI.success('保存成功');
            });
        },
        initData() {
            this.activeName = this.fileList[0].filename;
            this.originFileList = JSON.parse(JSON.stringify(this.fileList));
            var counter = Counter.auto();
            var fileList = this.fileList;
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                this.fileMap[file.filename] = file;
                var _call = counter.callAuto();
                $.get(file.path, (code) => {
                    file.code = code;
                    _call();
                }, 'text');
            }
            counter.finish(() => {
                this.init = true;
            });

            // document.addEventListener('keydown', (event) => {
            //     if (event.ctrlKey && event.key === 's') {
            //         // event.preventDefault();
            //         console.log('Ctrl+S 被监听并阻止了保存操作。');
            //         // 在这里添加您想要执行的代码
            //         console.log(this.$route);
            //     }
            // });
        }
    }
}
</script>