<template>
    <div v-if="init && menuVisible" 
        class="right-menu"
        :style="{ top: menuStyle.top, left: menuStyle.left, width: menuStyle.width }">
        <div class="pure-menu custom-restricted-width" :style="`width:${width}px;`">
            <ul class="pure-menu-list">
                <template v-for="item in menuData">
                        
                    <template v-if="item.type == 'line'">
                        <li class="pure-menu-item pure-menu-selected" :key="item.label">
                            <hr style="margin:0px;">
                        </li>
                    </template>
                    <template v-else-if="item.children == null">
                        <li class="pure-menu-item pure-menu-selected" :key="item.label">
                            <span class="pure-menu-link" @click="onSelect(item)">
                                {{item.label}}
                            </span>
                        </li>
                    </template>
                    <template v-else>
                        <li class="pure-menu-item pure-menu-has-children pure-menu-allow-hover pure-menu-selected">
                            <span class="pure-menu-link">{{item.label}}</span>
                            <cc-sub-pure-menu :width="width" :data="item.children" @on-select="onSelect">
                            </cc-sub-pure-menu>
                        </li>
                    </template>
                </template>
            </ul>
        </div>
    </div>
</template>

<script>
import SubMenu from './right-sub-menu.vue';
export default {
    components: {
        'cc-sub-pure-menu': SubMenu
    },
    data: function() {
        return {       
            init: false,
            menuStyle: {
                top: "0px",
                left: "0px",
                width: "",
            },
            menuVisible: false
        }
    },
    props: {
        width: {
            default: '100',
            type: String,
        },
        menuData: {
            default: [],
            type: Array
        }
    },
    created() {
        ModuleDefine.load('purecss', () => {
            this.init = true;

            document.addEventListener('click', (event) => {
                this.hideMenu();
            });
        });
    },
    methods: {
        showMenu(event) {
            if(this.menuVisible == true){
                return;
            }
            // event.preventDefault(); // 阻止默认右键菜单
            this.menuStyle.top = `${event.clientY}px`;
            this.menuStyle.left = `${event.clientX}px`;
            this.menuVisible = true;
        },
        hideMenu() {
            this.menuVisible = false;
        },
        onSelect(item) {
            this.$emit('on-select', item);
        }
    },
}
</script>

<style lang="less">
.right-menu {
    position: absolute;
    background-color: white;
    border: 1px solid #ccc;
    z-index: 1000;
}
.pure-menu {
    .pure-menu-children {
        border: 1px solid #ccc;
    }
    span {
        cursor: pointer;
    }
}
</style>