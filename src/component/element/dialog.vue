<template>
    <div>
        <el-dialog append-to-body :title="currentTitle" :top="currentTop" 
            style="color:red;"
            :visible.sync="currentVisible" :width="calcMaxWidth()" 
            @close="onClose" ref="dialog" v-dialog-drag 
            :fullscreen="fullScreen" :close-on-click-modal="false" 
            :custom-class="dialogBg">

            <!-- :modal="false"  -->
            <template v-slot:title>
                <el-row  type="flex" justify="end">
                    <el-col :span="12" :style="titleStyle"> 
                        {{currentTitle}}
                    </el-col>
                    <el-col :span="12">
                        <div class="dialog-setwin">
                            <a href="javascript:;" class="dialog-ico dialog-min" v-show="fullScreen" @click="fullScreen=!fullScreen"></a>
                            <a href="javascript:;" class="dialog-ico dialog-max dialog-maxmin" v-show="!fullScreen" @click="fullScreen=!fullScreen"></a>
                        </div>
                    </el-col>
                </el-row>
            </template>

            <!-- 最大高度限制 -->
            <div :style="fullScreen?style.fullScreen:style.scroll" class="scroll-y">
                <slot></slot>
            </div>
            
            <template v-slot:footer v-if="showFooter">

                <span style="float:left;">
                    <slot name="footer-left">
                    </slot>
                </span>
                <span class="dialog-footer">
                    <slot name="footer-right">
                    </slot>
                </span>
                <div style="text-align:center">
                    <slot name="footer-middle">
                    </slot>
                </div>

                <span class="dialog-footer" v-if="showConfirm">
                    <el-button size="mini" type="default" @click="onCancel">{{cancelText}}</el-button>
                    <el-button size="mini" type="success" @click="onConfirm">{{confirmText}}</el-button>
                </span>

                <span class="dialog-footer" v-if="showClose">
                    <el-button size="mini" type="success" @click="onClose">关 闭</el-button>
                </span>
            </template>

        </el-dialog>        
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            currentVisible: false,
            currentTitle: '',
            form: {},
            currentTop: '',
            fullScreen:false
        }
    },
    props: {
        confirmText: {
            default: '确 定',
            type: String
        },
        confirmAuto: {
            default: true,
            type: Boolean
        },
        cancelText: {
            default: '取 消',
            type: String
        },
        width: {
            default: '400px',
            type: String
        },
        /**
         * 实际上是maxHeight，表示最大高度
         */
        height: { 
            type: String
        },
        minHeight: {
            type: String
        },
        top: {
            default: '40px',
            type: String
        },
        showFooter: {
            default: true,
            type: Boolean
        },
        title: String,
        showConfirm: Boolean,
        showClose: Boolean,
        visible: Boolean,
        dialogBg:String,
        titleStyle: String
    },
    computed: {
        style() {
            var scroll = ''; 
            var fullScreen = 'height:calc(' + Core.calcMaxHeight('100%')  + ' - 50px)';
            if(this.height != null) {
                scroll = 'max-height:' + this.calcMaxHeight();
            } else if(this.minHeight != null) {
                scroll = 'height:calc(' + this.calcMinHeight() + ' - 0px)';
            }
            var style = {
                scroll: scroll,
                fullScreen: fullScreen
            };
            // console.log('style', style);
            return style;
        }
    },
    created: function() {
        this.currentTitle = this.title;
        // console.log('showConfirm', this.showConfirm);
        this.currentVisible = this.visible;
        if(this.top.indexOf('%') != -1) {
            this.currentTop = Core.calcMaxHeight(this.top);
        } else {
            this.currentTop = this.top;
        }
    },
    watch: {
        visible: function() {
            this.currentVisible = this.visible;
        },
        title:function(value){
            this.currentTitle = value;
        }
    },
    methods: {
        setVisible: function(bool) {
            this.currentVisible = bool;
            this.$emit('update:visible', bool);
        },
        open: function(title) {
            if(title != null) {
                this.currentTitle = title;
            }
            this.setVisible(true);
        },
        onConfirm: function() {
            // console.log('on dialog confirm');
            if(this.confirmAuto) {
                this.setVisible(false);
            }
            this.$emit('on-confirm', this.currentTitle);
        },
        onCancel: function() {
            this.setVisible(false);
            this.$emit('on-cancel');
            this.$emit('on-close');
        },
        onClose: function() {
            this.setVisible(false);
            this.$emit('on-close')
        },
        calcMaxWidth: function() {
            return Core.calcMaxWidth(this.width);
        },
        calcMaxHeight: function() {
            return Core.calcMaxHeight(this.height);
        },
        calcMinHeight: function() {
            return Core.calcMaxHeight(this.minHeight);
        }
    }
}
</script>
<style lang="less" scoped>
// .dialog-setwin{
//     position: absolute;
//     right: 30px;
//     top: 5px;
//     font-size: 0;
//     line-height: initial;
//     a{
//         position: relative;
//         width: 16px;
//         height: 16px;
//         margin-left: 10px;
//         font-size: 12px;
//         vertical-align:top;
//         cursor: pointer;
//         color: #337ab7;
//         text-decoration: none;
//         display: inline-block;
//     }
//     .dialog-ico{
//         background: url('../../assets/images/icon.png') no-repeat;
//     }
//     .dialog-min{
//         background-position: -65px -40px
//     }
//     .dialog-max{
//         background-position: -32px -40px;
//     }
// }
</style>