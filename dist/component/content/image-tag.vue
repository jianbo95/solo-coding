<template>
    <!-- <span class="custom-tag" :style="style">内容呢</span> -->
    <span class="custom-tag" :style="style">
        <div ref="img-box" class="img-box">
            <img ref="img-left" :style="leftImgStyle" src="./static/images/image-tag/img1.png" alt="">
            <img ref="img-middle" v-if="showImgMiddle" :style="middleImgStyle" src="./static/images/image-tag/img2.png" alt="">
            <img ref="img-right" :style="rightImgStyle" src="./static/images/image-tag/img3.png" alt="">

            <div style="clear:both;"></div>
        </div>
        
        <div ref="tag-content" :style="contentStyle"> &nbsp;
            <slot></slot>
        </div>

        <div style="clear:both;"></div>
    </span>
</template>

<script>

export default {
    data: function() {
        return {       
            colorMap : {
                'blue': '#4C9DF2'
            },
            sizeMap: {
                'mini': '14px'
            },
            filterMap: {
                'blue': 'hue-rotate(-0deg)',
                'orange': 'hue-rotate(-180deg)',
                'green': 'hue-rotate(-51deg)',
            },
            init: false,
            showImgMiddle: false,
            left: '40px',
            imgWidth: '100px',
            mainWidth: '40px',
            rootWidth: '50px'
        }
    },
    computed: {
        filter() {
            return this.filterMap[this.color];
        },
        tcolor() {
            var color = this.colorMap[this.color];
            if(color == null) {
                color = this.color;
            }
            return color;
        },
        tsize() {
            var size = this.sizeMap[this.size];
            if(size == null) {
                size = this.size;
            }
            return size;
        },
        leftImgStyle() {
            return `filter: ${this.filter};height:${this.height};padding:0px;margin:0px;_float:left;`;
        },
        middleImgStyle() {
            return `filter: ${this.filter};height:${this.height};padding:0px;margin:0px;_float:left; min-width:${this.imgWidth}; width:${this.imgWidth};
                border:0px solid red;`;
        },
        rightImgStyle() {
            return `filter: ${this.filter};height:${this.height};padding:0px;margin:0px;_float:left;`;
        },
        contentStyle() {
            return `position:absolute;left:${this.left}; top:0px; z-index:5000; color: #fff; 
            line-height:${this.height}; display:inline-block; white-space:nowrap;`;
        },
        style() {
            var style = '';
            var color = this.tcolor;
            var size = this.tsize;

            if(this.type == 'outline') {
                style += 'color:'+ color + '; border:0px solid ' + color + ';';
            } else if(this.type == 'dot') {
                style += 'color:'+ color + '; border:0px solid #ddd;';
            } else {
                style += 'background:'+ color + '; color:#fff; border:0px solid ' + color + ';';
            }
            style += 'padding:' + this.padding + ';';
            style += 'margin:' + this.margin + ';';
            style += 'font-size:' + size + ';';
            style += ";line-height:" + this.height + ";";

            style += `;display:inline-block;position:relative;min-width:${this.mainWidth};${this.mockShow};`;

            return style;
        },
        mockShow() {
            if(this.init == false) {
                // 未准备好前通过透明度隐藏，通过overflow限制高度
                return `opacity:0;overflow:hidden;height:${this.height};`;
            } else {
                // 展示元素
                return 'opacity:1;';
            }
        }
    },
    props: {
        size: {
            type: String,
            default: '1rem'
        },
        color: {
            type: String,
            default: 'blue'
        },
        padding: {
            type: String,
            default: '0px'
        },
        margin: {
            type: String,
            default: '0px'
        },
        height: {
            type: String,
            default: '30px'
        },
        type: {
            type: String,
            default: 'outline' // fill/dot
        }
    },
    methods: {
        waitRef: function(refs, name, _call, _error, _key) {
            var i = 0;
            var time = 1000; // 1000毫秒
            var checkTime = 100; // 检查频率
            var checkSize = time / checkTime;
            var timer = setInterval(() => {
                i ++;
                if(i > checkSize) {
                    console.error('waitRef 超过' + time + '毫秒' + name);
                    UI.warning('waitRef 超过' + time + '毫秒' + name);
                    clearInterval(timer);
                    
                    if(_error != null) { _error(); }
                    
                    return;
                }
                var ref = refs[name];
                if(ref != null) {
                    // console.log('检查次数'+name, i);
                    try {
                        _call(ref);
                    } catch (e) {
                        console.error(e);
                    }
                    clearInterval(timer);
                }
            }, 10);
        },
        waitForRef(type, _call) {
            if(type == 'vue') {
                this.$nextTick(() => {
                    _call();
                });
            } else {
                this.$nextTick(() => {
                    this.waitRef(this.$refs, 'tag-content', (ref) => {
                        this.waitRef(this.$refs, 'img-left', (iref) => {
                            _call();
                        });
                    });
                });
            }
        },
    },
    created() {
        // setTimeout(() => {
        //     var ref = this.$refs['tag-content'];
        //     console.log('timeout');
        //     console.log(ref);
        // }, 3000);
        this.waitForRef('custom', () => {

            var ref = this.$refs['tag-content'];
            var iref = this.$refs['img-left'];

            var width = ref.offsetWidth;
            this.imgWidth = (width + 10) + 'px';
            this.showImgMiddle = true;

            this.mainWidth = 'unset';
            this.waitRef(this.$refs, 'img-middle', (mref) => {
                this.waitRef(this.$refs, 'img-right', (rref) => {
                    var lwidth = iref.offsetWidth
                    var mwidth = mref.offsetWidth;
                    var rwidth = rref.offsetWidth;
                    this.mainWidth = (lwidth + mwidth + rwidth) + 'px';
                });
            });

            this.left = iref.offsetWidth + 'px';
            this.init = true;
            // console.log('left', {iref});
            // console.log('left width', this.left);
        });
            
    }
}
</script>

<style scope>
.custom-tag {
    border-radius: 5px;
}
.img-box {
    display: flex;
}
</style>