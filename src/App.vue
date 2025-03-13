<template>
  <div id="app" style="height:100%;">
    <!-- TODO 增加菜单，同时支持嵌入模式和非嵌入模式 -->
    <keep-alive>
      <router-view />
    </keep-alive>

  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
    }
  },
  created () {
    console.log('主页面构建');
    logTime();
  },
  methods: {
  }
 
}
</script>

<style lang="less">
#app {
  background: #fff;
}
</style>
