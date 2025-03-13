<template>
    <ul class="pure-menu-children" :style="`width:${width}px`">
        <template v-for="item in data">
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
                    <cc-sub-pure-menu :width="width" :data="item.children" @on-select="onSubSelect">
                    </cc-sub-pure-menu>
                </li>
            </template>
        </template>
    </ul>
</template>

<script>
import SubMenu from './right-sub-menu.vue';
export default {
    components: {
        'cc-sub-pure-menu': SubMenu
    },
    data: function() {
        return {       
        }
    },
    props: {
        width: {
            default: '100',
            type: String,
        },
        data: {
            type: Array,
            default: []
        }
    },
    methods: {
        onSelect(item) {
            this.$emit('on-select', item);
        },
        onSubSelect(item) {
            this.$emit('on-select', item);
        }
    }
}
</script>