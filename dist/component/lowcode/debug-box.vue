<template>
    <div class="debug-box" :style="`${style};width:calc(${width} - 12px); height:${height}; background:${color}`">
        <div ref="content" :style="`display:block; height:${height};`">
            <slot></slot> 
        </div>
        <div v-if="showSize" :style="`${debugInfoStyle};font-size:14px;margin-left:1rem;`">
            <span style="white-space:nowrap;display:inline-block;">
                <span @click="showDebug">
                {{width}} x {{height}}
                </span>
                <template v-if="boolDebugInfo">
                    <i class="el-icon-close" style="color:blue;cursor:pointer;" @click="hideDebug"></i>
                </template>
            </span>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
            color: null,
            boolDebugInfo: false
        }
    },
    created() {
        var LocalTool = {
            colorIndex: 0,
            colorList: [
                '#66CCCC', '#b6e7e7',
                '#b9b9ca', '#bebeea',
                '#FF99CC', '#ebbcd4',
                '#99CC66', '#d4f6b1',
                '#FF9900', '#f5c275',
                '#FFCC00', '#fceaa1'
            ],
            getColor: function (index) {
                var i = Number(index) % this.colorList.length;
                return this.colorList[i];
            },
            getColorAuto: function () {
                var rand = Math.ceil(Math.random()*10000);
                var i = rand % this.colorList.length;
                return this.colorList[i];
            }
        };
        this.color = LocalTool.getColorAuto();
    },
    props: {
        height: {
            type: String,
            default: '1rem'
        },
        width: {
            type: String,
            default: '30%'
        },
        showSize: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        debugInfoStyle() {
            var style = '';
            if(this.boolDebugInfo) {
                var left = this.$refs['content'].offsetWidth;
                style = 'background:#fff;position:absolute;padding:5px;border:1px solid #eee; z-index:5000; top:0px; left:' + left + 'px' ;
            }
            return style;
        },
        style() {
            var style = 'overflow:hidden;';
            if(this.boolDebugInfo) {
                style = 'background:#fff;';
            }
            return style;
        }
    },
    methods: {
        showDebug() {
            this.boolDebugInfo = true;
        },
        hideDebug() {
            this.boolDebugInfo = false;
            console.log('hide debug', this);
            console.log('hide debug', this['boolDebugInfo']);
        }
    }
}
</script>

<style lang="less">
.debug-box {
    display:flex;
    border:1px solid #eee;
    padding: 5px;
    position: relative;
}

</style>