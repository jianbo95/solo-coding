<template>
    <div>
        sub vue
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
        }
    },
    created() {
        if(window.TestGlobalJs == null) {
            console.log('TestGlobalJs 仅在 ie-test.vue 生效');
        }
    }
}
</script>