<template>
    <!-- 选项弹框 -->
    <div>
    <el-dialog
            title="AI模型选项"
            :visible.sync="optionsVisible"
            width="400px"
            center>
            <div class="options-content" style="padding:1rem;">
                <div>
                    <el-button :size="size" type="primary" @click="testModel">
                        训练模型
                    </el-button>
                </div>
                <div>
                    <el-button :size="size" type="primary" @click="loadModel">
                        加载当前模型
                    </el-button>
                </div>

                <div style="margin-top:1rem;">
                    <el-button :size="size" type="primary" @click="downloadModel" :loading="downloadLoading">
                        下载当前模型
                    </el-button>
                </div>
                
                <div class="upload-section" style="margin-top:1rem;">
                    <el-upload :size="size"
                        action=""
                        :auto-upload="false"
                        :on-change="handleFileChange"
                        :limit="2"
                        :file-list="fileList"
                        accept=".json,.bin">
                        <el-button :size="size" slot="trigger" type="primary">选择模型文件</el-button>
                        <div slot="tip" class="el-upload__tip">请选择model.json和weights.bin文件</div>
                    </el-upload>
                    <el-button :size="size" type="success" @click="uploadModel" :disabled="fileList.length === 0" :loading="uploadLoading">
                        上传模型
                    </el-button>
                </div>
            </div>
    </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            size: 'small',
            optionsVisible: false,
            fileList: [],
            downloadLoading: false,
            uploadLoading: false,
        };
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        superAiGame: {
            type: Object,
            default: null
        }
    },
    watch: {
        visible() {
            console.log('visible change', this.visible);
            if(this.visible != this.optionsVisible) {
                this.optionsVisible = this.visible;
            }
        },
        optionsVisible() {
            if(this.optionsVisible != this.visible) {
                this.$emit('update:visible', this.optionsVisible);
            }
        },
    },
    methods: {
        async loadModel() {
            console.log('this.superAiGame',this.superAiGame);
            await this.superAiGame.loadModel();
        },
        async testModel() {
            await this.superAiGame.trainAndSaveModel();
        },
        // 新增方法 - 下载模型
        async downloadModel() {
            if (!this.superAiGame) {
                this.$message.error('超级AI模型未初始化');
                return;
            }

            this.downloadLoading = true;
            try {
                const result = await this.superAiGame.downloadModel();
                if (result) {
                    this.$message.success('模型下载成功');
                } else {
                    this.$message.error('模型下载失败');
                }
            } catch (error) {
                console.error('下载模型出错:', error);
                this.$message.error('下载模型时发生错误');
            } finally {
                this.downloadLoading = false;
            }
        },

        // 新增方法 - 处理文件选择
        handleFileChange(file, fileList) {
            this.fileList = fileList;
        },

        // 新增方法 - 上传模型
        async uploadModel() {
            if (!this.superAiGame || this.fileList.length === 0) {
                this.$message.error('请先选择模型文件');
                return;
            }

            this.uploadLoading = true;
            try {
                // 获取文件对象
                const files = this.fileList.map(item => item.raw);
                
                // 调用上传方法
                const result = await this.superAiGame.uploadModel(files);
                
                if (result) {
                    this.$message.success('模型上传成功');
                    this.optionsVisible = false;
                } else {
                    this.$message.error('模型上传失败');
                }
            } catch (error) {
                console.error('上传模型出错:', error);
                this.$message.error('上传模型时发生错误');
            } finally {
                this.uploadLoading = false;
            }
        },
    }
}
</script>

