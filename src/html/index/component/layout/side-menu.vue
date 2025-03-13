<template>
    <div class="side-menu">
        <el-menu :size="window.size" class="menu-list">
            <el-menu-item index="1">
                <i class="el-icon-house"></i>
                <span>首页</span>
            </el-menu-item>
            <el-menu-item index="2">
                <i class="el-icon-document"></i>
                <span>最新文章</span>
            </el-menu-item>
            <el-menu-item index="3">
                <i class="el-icon-star-on"></i>
                <span>热门文章</span>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script>
export default {
    data() {
        return {}
    }
}
</script>

<style lang="less" scoped>
.side-menu {
    width: 200px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    
    .menu-list {
        border-right: none;
    }
}
</style>