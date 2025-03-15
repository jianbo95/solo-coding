<template>
    <div class="header-container">
        <div class="header-content">
            <div class="logo">Solo Coding</div>
            <el-menu 
                mode="horizontal" 
                :size="window.size" 
                router
                :default-active="$route.path">
                <el-menu-item index="/">首页</el-menu-item>
                <el-menu-item index="/game">游戏</el-menu-item>
            </el-menu>
            <div class="search-box">
                <el-input 
                    placeholder="搜索文章..." 
                    :size="window.size"
                    prefix-icon="el-icon-search">
                </el-input>
            </div>
        </div>
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
.header-container {
    width: 100%;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
    
    .header-content {
        width: 1300px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            margin-right: 40px;
        }
        
        .search-box {
            margin-left: auto;
            width: 300px;
        }
    }
}

@media screen and (max-width: 1300px) {
    .header-container {
        .header-content {
            width: 100%;
            padding: 0 20px;
        }
    }
}
</style>