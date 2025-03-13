<template>
    <div class="hello">测试组件：Hello {{who}}</div>
</template>

<script>
export default {
    data: function() {
        return {
            who: 'world'
        }
    }
}
</script>

<style>
.hello {
    background-color: #FDE1C3;
    padding: 10px;
    margin: 5px;
    float: left;
    border: 1px solid #F9B46B;
}
</style>