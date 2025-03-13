<template>
    <div style="height:calc(100% - 2rem); padding:1rem;">
        <cc-menu-and-tag
            @tag-change="tagChange"
            :debug="true" 
            :width="340" 
            v-model="contents" 
            :collapse="false"
            :menus="menus"
            :tag-id-type="tagIdType"
            @input="onInput"
            >
            
            <template slot="home">
                <div style="padding:1rem;">
                    <div style="font-size:1.5rem;">主页</div>
                    <div><br></div>
                    <div>
                        欢迎使用ssh
                    </div>
                    <div style="margin-top:1rem;">
                        <cc-input-box-fix title="标签ID类型：">
                            <cc-select-single v-model="tagIdType" size="middle" :map="fieldMap.tagIdType"></cc-select-single>
                        </cc-input-box-fix>
                    </div>
                </div>
            </template>

            <template>
                <template v-for='(menu) in contents'>
                    <template v-if='menu.title != "主页" && menu.title != "调试"'>
                        <div v-show='menu.active' style="padding:1rem;height:calc(100% - 35px);">
                            <div style="background:#eee;width:100%; height:100%;">
                                <textarea :value="toJson(menu)" cols="60" rows="20"></textarea>
                            </div>
                        </div>
                    </template>
                </template>

            </template>

        </cc-menu-and-tag>
    </div>
</template>

<script>
import Tree from '@/app/util/Tree.js';
import TestMenu from '@/module/test/data/test-menu.js';

export default {
    
    data: function() {
        return {      
            loading: false,
            init: true,
            tagIdType: 'increment',
            menuList: TestMenu.menu ,
            contents: [],
            fieldMap: {
                tagIdType: {
                    'increment': '自增标签',
                    'unique': '唯一标签'
                }
            },
            menus: []
        }
    },
    created() {
        // console.log('this.menuList', this.menuList);
        for(let i in this.menuList) {
            let menu = this.menuList[i];
            if(menu.parent == null) {
                menu.icon = 'el-icon-s-tools';
            }
        }
        this.menus = Tree.convert(this.menuList, 'id', 'parent', null);
        console.log('testMenuAndTag2.vue this.menus', this.menus);
    },
    methods: {
        toJson(obj) {
            return Json.toString(obj);
        },
        onInput(value) {
            console.log('onInput', value);
        },
        tagChange() {
            console.log('tag change in ctrl');
        }
    }
}
</script>