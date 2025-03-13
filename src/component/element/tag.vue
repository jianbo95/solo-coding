<template>
    <div class="cc-tag">
        <el-tag @click="click" :color="bgColor" style="border:0px;">
            <!-- <div style="padding-top:10px;"> -->
            <div style="position: absolute; top:10px;">
                <span class="tag-dot" :style="'background-color: '+color">&nbsp;</span>
            </div>
            <div class="tag-text" style="margin-left: 18px;">
                <slot></slot>
            </div>
            <!-- <span style="display:inline-block;width:18px;">&nbsp;</span> -->
        </el-tag>
    </div>
</template>

<script>
export default {
    data: function() {
        return { 
            clickTime: null      
        }
    },
    props: {
        bgColor: {
            type: String,
            default: 'white'
        },
        color: String
    }, 
    methods: {
        onClose: function() {
            this.$emit('on-close');
        },
        click: function() {
            if(this.clickTime != null) {
                let now = new Date().getTime();
                if(now - this.clickTime < 500) {
                    this.$emit('dbclick');
                }
            }
            this.clickTime = new Date().getTime();
            this.$emit('click')
        }
    }
}
</script>

<style>
.tag-icon {
    font-size:25px; 
}
.tag-dot {
    border-radius: 50%; width:13px; height:13px; 
    display: block; 
}
.tag-text {
    color: #777;
    font-size: 14px;
}
.cc-tag {
    overflow:hidden; 
    display:inline-block; 
    height:32px; 
    line-height:32px; 
    position:relative; 
    background:white;
    /* margin:0 1px 0 1px; */
    margin:0 3px 0 0;
}
</style>