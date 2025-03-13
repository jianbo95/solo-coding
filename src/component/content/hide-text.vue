<template>
    <span :class="rootClass" :style="`${style}`">
        <template v-if="mode == 'split'">
            <!-- 已省略文本 -->
            {{show(value)}} 
            <!-- 已省略按钮 -->
            <template v-if="isHideValue(value)">
                <el-popover
                    :placement="placement"
                    title=""
                    width="200"
                    trigger="hover">
                    <span style="font-size:12px;color:#000;">{{showOther(value)}}</span>
                    <span slot="reference" class="el-icon-more"></span>
                </el-popover>
            </template>
        </template>
        <template v-else-if="mode == 'length'">
            <!-- 已省略文本 -->
            {{showByLength(value)}} 
            <!-- 已省略按钮 -->
            <template v-if="isHideValueByLength(value)">
                <el-popover
                    :placement="placement"
                    title=""
                    width="200"
                    trigger="hover">
                    <span style="font-size:12px;color:#000;">{{showOtherByLength(value)}}</span>
                    <span slot="reference" class="el-icon-more"></span>
                </el-popover>
            </template>
        </template>
        <template v-else-if="mode == 'overflow'">
            <span class="content" 
                @mouseover="mouseOver = true"
                @mouseout="mouseOver = false"
                 :style="`${overflowStyle};display:inline-block;overflow:hidden;`">
                {{value}}<slot></slot>
            </span>
            <!-- <span class="el-icon-more" style="display:inline-block;position:absolute;right:0px; top:3px;
                background:#fff;"></span> -->
        </template>
        <template v-else>
            <span style="color:red">
            参数mode不合法，值为{{mode}}
            </span>
        </template>
    </span>
</template>

<script>
export default {
    data: function() {
        return {       
            mouseOver: false
        }
    },
    computed: {
        rootClass() {
            if(this.mode == 'overflow') {
                return 'hide-text-overflow';
            }
            return '';
        },
        style() {
            var style = '';
            if(this.mode == 'overflow') {
                style += 'display:inline-block; width:100%; height:100%;';
            }
            return style;
        },
        overflowStyle() {
            var style = '';
            // var width = this.width || '100%';
            // style += `width:calc(${width} - 1.3em);`;

            if(this.width != null) {
                if(this.mouseOver) {
                    style += `width:${this.width};`;
                } else {

                }
            }
            if(this.height != null) {
                style += `height:${this.height};`;
            }
            console.log('style', style);
            return style;
        }
    },
    props: {
        width: {
            default: null,
            type: String
        },
        height: {
            default: null,
            type: String
        },
        mode: {
            default: 'split', // split/length/overflow
            type: String
        },
        split: {
            default: ',',
            type: String
        },
        placement: {
            default: 'bottom',
            type: String
        },
        maxLength: {
            default: 30,
            type: Number
        },
        value: {
            type: String
        }
    },
    methods: {
        isHideValue(value) {
            if(value == null) {
                return false;
            }
            var s = this.split;
            if(value.indexOf(s) != -1) {
                let values = value.split(s);
                let join = values[0];
                for (let i = 1; i < values.length; i++) {
                    join = join + s + values[i];
                    if(join.length > this.maxLength && i < values.length - 1) {
                        return true;
                    }
                }
            }
            return false;
        },
        showOther(value) {
            if(value == null) {
                return '';
            }
            var s = this.split;
            if(value.indexOf(s) != -1) {
                let values = value.split(s);
                let join = values[0];
                let breakIndex;
                for (let i = 1; i < values.length; i++) {
                    join = join + s + values[i];
                    if(join.length > this.maxLength) {
                        breakIndex = i;
                        break;
                    }
                }
                if(breakIndex != null) {
                    let arr = [];
                    for (let i = 1; i < values.length; i++) {
                        if(i > breakIndex) {
                            arr.push(values[i]);
                        }
                    }
                    return arr.join(s);
                }
                return '';
            }
            return '';
        },
        show(value) {
            if(value == null) {
                return null;
            }
            var s = this.split;
            if(value.indexOf(s) != -1) {
                let values = value.split(s);
                let join = values[0];
                for (let i = 1; i < values.length; i++) {
                    join = join + s + values[i];
                    if(join.length > this.maxLength) {
                        break;
                    }
                }
                return join;
            }
            return value;
        },
        isHideValueByLength(value) {
            if(value.length > this.maxLength) {
                return true;
            }
            return false;
        },
        showOtherByLength(value) {
            if(!this.isHideValueByLength(value)) {
                return '';
            }
            return value.substring(this.maxLength);
        },
        showByLength(value) {
            if(!this.isHideValueByLength(value)) {
                return value;
            }
            return value.substring(0, this.maxLength);
        },
    }
}
</script>

<style lang="less">
.hide-text-overflow {
    overflow:hidden;
    position:relative;
}
.hide-text-overflow:hover {
    overflow: unset;
}
.hide-text-overflow .content {
    width:calc(100% - 1.3em);
}
.hide-text-overflow:hover .content {
    border:1px solid #ddd;
    background: #fff;
    position:absolute;
    padding:10px;
    z-index: 5000;
}
</style>