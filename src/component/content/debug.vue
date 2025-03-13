<!--
增加自启自关开关
-->
<template>
    <div style="border:1px solid #660000; background:#fff; padding: 10px; margin:10px;">
        <div>{{title}}</div>
        <div>
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
        }
    },
    props: {
        title: {
            type: String,
            default: '调试面板'
        }
    }
}
</script>