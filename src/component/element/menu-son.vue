<template>
<div>

    <!-- <textarea :value="JSON.stringify(menus)"></textarea> -->

    <template v-if="type != 'item'" v-for="(menu, i) in menus">

        <span style="display:none" :id="'ms-'+menu.id"></span>

        <template v-if="menu.type != 'item'">
        
            <el-submenu :index="buildParent(i, menu)">

                <template slot="title">
                    <template v-if="root">
                        <template v-if="menu.icon != null">
                            <i :class="menu.icon"></i>
                        </template>
                        <template v-if="menu.icon == null">
                            <i class="el-icon-s-tools"></i>
                        </template>
                    </template>
                    <template v-if="!root">
                        <i :class="menu.icon"></i>
                    </template>
                    <span>{{menu.title}}</span>
                    <span style="display:block">{{menu.renderId}}</span>
                </template>

                <template v-if="menu.children != null">
                    <cc-menu-son 
                        :use-id="useId"
                        :menus="menu.children" 
                        :type="menu.sonType"
                        :parent="buildParent(i, menu)">
                    </cc-menu-son>
                </template>

            </el-submenu>

        </template>

        <template v-if="menu.type == 'item'">
            <el-menu-item :index="buildParent(i, menu)">

            <template slot="title">
                <i :class="menu.icon"></i>
                <span>{{menu.title}}</span>
            </template>

            </el-menu-item>

        </template>

    </template>

    <template v-if="type == 'item'" v-for="(menu, i) in menus">

        <span style="display:none" :id="'ms-'+menu.id"></span>
        
        <el-menu-item :index="buildParent(i, menu)">

            <template slot="title">
                <i :class="menu.icon"></i>
                <span>{{menu.title}}
                </span>
            </template>

        </el-menu-item>

    </template>

</div>
</template>

<script>
export default {
    data: function() {
        return {       
        }
    },
    props: {
        useId: false, // 使用对象id作为index，elementui 回调时通过index属性区分
        root: false,
        collapse: false,
        type: String,
        parent: String,
        menus: Array
    },
    created() {
        // console.log('menu-son.vue parent', this.parent);
        // console.log('menu-son.vue menus', this.menus);
        // console.log('this.type', this.type);
    },
    methods: {
        buildParent(index, menu) {
            if(this.useId == true) {
                return menu.id;
            }
            if(menu.index != null) {
                return menu.index;
            }
            let parentId = null;
            if(this.parent != null) {
                parentId = this.parent + '-' + index;
            } else {
                parentId = index;
            }
            return parentId + '';
        }
    }
}
</script>