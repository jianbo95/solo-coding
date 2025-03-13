<!--
事件：tagChange，tag-group 组件内部操作导致 tag 发生变化时发送该事件
-->

<template>
    <div :class="'page-tag ' + uuid " v-show="true">
        
        <div v-if="showToggle" class="tag-left" @click="toggleMenu()" style="width:50px;">
            <div class="tag-fold" style="height:30px; margin-top:5px; margin-left:6px;">
                <i class='el-icon-s-fold tag-icon' style="margin-top:0px;"></i>
            </div>
        </div>

        <div class="tag-left" @click="moveLeft()">
            <i class='el-icon-arrow-left tag-icon'></i>
        </div>

        <div class="tag-middle" :style="tagMiddle">
            <div ref="tagmiddle" class="move-div">
                <div v-for="(tag, i) in tags" class="tag-box" :key="i">
                    <cc-tag @click="clickTag(tag)" v-if="tag == '主页'" :color="getTagColor(tag)">
                        主页
                        <span v-if="title != null">（{{title}}）</span>
                    </cc-tag>
                    <cc-tag v-else :color="getTagColor(tag)" @click="clickTag(tag)" @dbclick="dbclickTag(tag)">
                        <template v-if="renameTag == tag">
                            <span>
                                <input size="mini" v-model="renameTagValue" />
                            </span>
                            <i class='el-icon-success' style="margin-left:5px;" @click="renameOk"></i>

                        </template>
                        <template v-if="renameTag != tag">
                        <!-- 存在别名则显示别名 -->
                        <span v-html="showTag(tag)"></span>
                        </template>
                        <i class='el-icon-close' @click="closeTag(tag)"></i>
                    </cc-tag>
                </div>
            <!-- <span style="width:5px;">&nbsp;</span> -->
            </div>
        </div>

        <div class="tag-right" :style="tagRight">
            <div class="tag-btn custom-tag" :style="tagCustom">
                <slot></slot>
            </div>
            
            <div class="tag-btn" @mouseover="overCloseTag()" @mouseout="outCloseTag()">
                <i class='el-icon-close tag-icon'></i>

                <div class="tag-close-menu" v-show="showCloseTagMenu" style="display: none; z-index:100;">
                    <div class="item" @click="closeTagAll()">关闭所有</div>
                    <div class="item" @click="closeTagOther()">关闭其它</div>
                </div>
                <div class="tag-close-area" v-show="showCloseTagMenu">
                    <!-- 增加鼠标悬停区域 -->
                </div>
            </div>

            <div class="tag-btn" @click="moveRight()">
                <i class='el-icon-arrow-right tag-icon'></i>
            </div>

            <div class="tag-btn tag-block">
            </div>
        </div>
        

        
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            debug: Core.debug('tag-group'),
            uuid: null,
            showCloseTagMenu: false,
            pos: 0,
            lastPos: 0,
            posSize: 150,
            renameTag: null,
            tagAlias: {},
            renameTagValue: null,
            tags: ['主页'],
            tag: '主页',
            tagDataMap: {}
        }
    },
    created: function() {
        Logger.info('showToggle', this.showToggle);
        this.uuid = Util.UUID();
        if(this.data != null && this.data.length > 0) {
            this.tags = this.data;
        }
    },
    props: {
        showToggle: {
            default: false,
            type: Boolean
        },
        title: { // 主页副标题
            default: null,
            type: String
        },
        data: Array, // 仅初始化时该参数有效
        value: String,
        tagFormat: {
            type: Function,
            default: null
        },
        customWidth: {
            default: 0,
            type: Number
        }
    },
    computed: {
        tagCustom() {
            return 'width:' + this.customWidth + 'px';
        },
        tagRight() {
            let widthPx = 66 + this.customWidth;
            return 'right: 0px; '
                + ' width: ' + widthPx + 'px'
                + '; z-index:1';
        },
        tagMiddle() {
            // width: calc( 100% - 148px );
            let style = ''
            if(this.showToggle) {
                style += 'left:86px;';
            } else {
                style += 'left:35px;';
            }

            let buttonSize;
            if(this.showToggle) {
                buttonSize = 148;
            } else {
                buttonSize = 102;
            }
            buttonSize += this.customWidth;
            style += 'width: calc( 100% - ' + buttonSize + 'px );';

            if(this.debug) {
                style += 'background:yellow;';
            }

            return style;
        }
    },
    methods: {
        openDebug() {
            var tag = '调试';
            this.tags.push(tag);
            this.$emit('update:data', this.tags);
            this.$emit('input', tag);

            // 不需要 tag-change 也可以？
            // this.$emit('tag-change', tag, this.tagDataMap[tag]);
        },

        /**
         * 添加一个tag
         * @param tag 标签id
         * @param alias 标签别名
         */
        addTag(tag, alias, tagData) {
            this.tagDataMap[tag] = tagData;
            this.tagAlias[tag] = alias;
            this.tags.push(tag);
            this.$emit('update:data', this.tags);
            this.$emit('input', tag);
            this.$emit('tag-change', tag, this.tagDataMap[tag]);
        },
        showTag: function(tag) {
            if(this.tagAlias[tag] != null) {
                return this.tagAlias[tag];
            }
            if(this.tagFormat == null) {
                return tag;
            } else {
                return this.tagFormat(tag);
            }
        },
        isExist: function(tag) {
            for(var i in this.tags) {
                if(this.tags[i] == tag) {
                    return true;
                }
            }
            return false;
        },
        pushTag: function(tag) {
            this.tags.push(tag);
            // this.tags = Util.clone(this.tags);
        },
        activeTag: function(tag, tagData) {
            // console.log('activeTag', tag, this.value);
            if(this.value != tag) {
                this.$emit('input', tag);
                if( !this.isExist(tag) ) {
                    this.pushTag(tag);
                }
                this.$nextTick(function(){
                    this.moveToTag(tag);
                });
                // console.log('activeTag', this.tags);
                this.$emit('update:data', this.tags);
                if(tagData.alias != null) {
                    this.tagAlias[tag] = tagData.alias;
                }
                this.tagDataMap[tag] = tagData;
            }
        },
        getTagColor: function (item) {
            if(item == this.value) {
                return '#62c0f9';
            } else {
                return '#ddd'; 
            }
        },
        overCloseTag: function() {
            this.showCloseTagMenu = true;
        },
        outCloseTag: function() {
            this.showCloseTagMenu = false;
        },
        closeTag: function(tag) {
            // console.log('close tag');
            var tags = [];
            for(var i in this.tags) {
                if(this.tags[i] != tag) {
                    tags.push(this.tags[i]);
                }
            }
            // console.log('tags', tags);
            var active = tags[tags.length - 1];
            // console.log('activeTag', active);
            this.$emit('input', active);
            this.tags = tags;
            // console.log("this.$emit('update:data', tags);", tags);
            this.$emit('update:data', tags);
            this.$emit('tag-change', active, this.tagDataMap[active]);
        },
        dbclickTag: function(tag) {
            this.renameTag = tag;
            var value = this.tagAlias[this.renameTag];
            if(value != null) {
                this.renameTagValue = value;
            } else {
                this.renameTagValue = tag;
            }
        },
        renameOk: function() {
            // 切换到 this.renameTagValue
            this.tagAlias[this.renameTag] = this.renameTagValue; // 重命名后的名字
            this.renameTag = null;
        },
        clickTag: function(tag) {
            if(this.value == tag) {
                // console.log('click tag ' + tag + ' v-model ' + this.value);
                return;
            }
            // console.log('click tag');
            // 尝试移动
            this.moveToTag(tag);

            this.$emit('input', tag);
            this.$emit('tag-change', tag, this.tagDataMap[tag]);
        },
        closeTagOther: function() {
            if(this.value == '主页') {
                this.tags = ['主页'];    
            } else {
                this.tags = ['主页', this.value];
            }
            this.move();
        },
        closeTagAll: function() {
            var active = '主页';
            this.tags = ['主页'];
            this.$emit('input', '主页');
            this.$emit('tag-change', '主页');
        },
        // 滚动相关
        getMoveDivWidth: function() {
            return this.$$(" .move-div").width();
        },
        getViewWidth: function() {
            return this.$$(".tag-middle").width();
        },
        $$(selector) {
            var s = '.' + this.uuid + ' ' + selector;
            // console.log('selecotr:' + s);
            return $(s);
        },
        move: function() {
            var _this = this;
            this.$nextTick(function() {
                _this._move();
            });
        },
        _move: function() {
            var leaveWidth = this.getViewWidth() - this.getMoveDivWidth();
            // console.log('this.getViewWidth()', this.getViewWidth());
            // console.log('this.getMoveDivWidth()', this.getMoveDivWidth());
            // console.log('leaveWidth', leaveWidth);
            // 实际标签小于滚动条，强制不可滚动
            if(leaveWidth > 0) {
                this.pos = 0;
                this.$$(".move-div").animate({left:this.pos+'px'}, "slow");
                return;
            }
            // 实际标签大于滚动条
            var moveWidth = leaveWidth;
            // console.log('this.pos', this.pos);
            if(this.pos < moveWidth) {
                this.pos = moveWidth; // 最大可移动
            }
            if(this.pos > 0) {
                this.pos = 0;
            }
            if(this.pos == this.lastPos) {
                return;
            }
            // console.log('this.pos', this.pos);
            this.$$(".move-div").animate({left:this.pos+'px'}, "slow");
            this.lastPos = this.pos;
        },
        moveRight: function () {
            // console.log('moveRight')
            // this.$$(".move-div").animate({left:'100px'}, "slow");
            this.pos -= this.posSize;
            this.move();
        },
        moveLeft: function () {
            this.pos += this.posSize;
            this.move();
        },
        toggleMenu: function() {
            this.$emit('toggle-menu');
        },
        moveToTag: function (tag) {
            // 移动到当前标签
            // 判断当前item是否可见
            // 计算item之前的 tagBox 长度
            // console.log('move to tag [' + tag + ']');
            var boxes = this.$$('.tag-box');
            // console.log(boxes);
            var totalWidth = 0;
            var itemWidth;
            for(var i in this.tags) {
                var box = boxes[i]; // 按照顺序获取
                if(this.tags[i] == tag) {
                    itemWidth = $(box).width();
                    break;
                } else {
                    totalWidth += $(box).width();
                }
            }
            // console.log('滚动对象长度', this.getMoveDivWidth()); // move-div
            // console.log('可视区域长度', this.getViewWidth()); // tag-middle
            // console.log('左侧总长度', totalWidth);
            // console.log('当前位置', this.pos);
            // console.log('所选组件长度', itemWidth);
            var movePos = totalWidth + itemWidth - this.getViewWidth();
            // var movePos = itemWidth  - this.getViewWidth();
            // var movePos = this.getMoveDivWidth() - this.getViewWidth();
            // console.log('move to tag', movePos);

            this.pos = - movePos;
            this.move();
        }
    }
}
</script>

<style lang="less">
.page-tag {
    position: relative;
    height: 39px;
    /* margin-top: 10px; */
    border-bottom: 1px #e8e8e8 solid;
    background-color: #e8e8e8;
    /* background-color: #61fa43; */

    .tag-icon {
        line-height:39px;
    }
    .tag-close-menu {
      position: absolute;
      right: 5px;
      border-radius: 5%;
      box-shadow:0px 0px 6px #ccc;
      background-color: #fff;
      top: 40px;
      padding: 5px;
    }
    .tag-close-area {
      z-index: 10;
      position: absolute;
      width:55px;
      height: 40px;
      right:0px;
      top:0px;
      opacity: 0;
      background-color: #4778c7;
    }
    .tag-close-menu .item {
      font-size: 0.8rem;
      width:80px;
      padding: 5px;
    }
    .tag-close-menu .item:hover {
      background-color: #eee;
      cursor: pointer;
    }
    .tag-right {
      position: absolute;
      right: 30px;
      top: 0px;
      text-align: center;
    //   width: 30px;
      width: 150px;
      background:#aaa; 
      height:39px;
      //   border: 1px solid #eee;
      
      .tag-btn {
        float: right;
        width: 30px;
        border-right: 1px solid #eee;
        background:#fff; 
        // border-left: 1px solid #eee;
      }

      .custom-tag {
        overflow:hidden; height:39px; line-height:39px;
      }
      .tag-block {
        width:2px;
        background: #e8e8e8;
        height:39px; line-height:39px;
      }
    }
    .tag-close {
      /*必须放在 tag-right 下面*/
      position: absolute;
      right: 0;
    }
    .move-div {
      position: absolute;
      /* left: 100px; */
    }
    .tag-middle {
      _background-color: #eee;
      _background-color: #eef1f6;
      position: absolute;
      white-space: nowrap;
      top:4px;
      /* margin-top:4px; */
      /* margin-left:4px; */
      height: 32px;
    //   width: calc( 100% - 148px );
    //   width: calc(100% - 128px);
      overflow-x:hidden;
      overflow-y:hidden;
    }
    .move-div {
      height: 32px;
      /* overflow-y: hidden; */
    }
    .tag-box {
      display: inline-block;
      height: 32px;
      cursor: pointer;
      /* overflow: hidden; */
      /* height: px; */
    }
    .tag-left {
      text-align: center;
      width: 30px;
      float:left; 
      background:#fff; 
      height:39px;
      /* border: 1px solid #eee; */
    }
    .ivu-tag {
      margin:0px;
    }
  
    .tag-fold{
      width: 35px;
      display: inline-block;
      margin-right: 0 8px;
      background-color: #1ab394;
      border-color: #1ab394;
      color: #ffffff; 
      border-radius: 4px; 
      margin: 0 8px; 
      text-align: center;
      i.el-icon-s-fold.tag-icon {
          height: 30px;
          line-height: 30px;
          font-size: 18px;
      }
  }
}
</style>