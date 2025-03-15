<template>
    <div class="header-container">
        <div class="header-content">
            <div class="logo">Solo Coding</div>
            <nav class="nav-menu">
                <router-link to="/" :class="{ active: $route.path === '/' }">首页</router-link>
                <router-link to="/game" :class="{ active: $route.path === '/game' }">游戏</router-link>
            </nav>
            <div class="search-box">
                <el-input 
                    placeholder="文章..." 
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
    background: #eee;
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;

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
        
        .nav-menu {
            display: flex;
            gap: 20px;
            
            a {
                padding: 0 20px;
                line-height: 60px;
                color: #333;
                text-decoration: none;
                position: relative;
                
                &:hover {
                    color: #409EFF;
                }
                
                &.active {
                    color: #409EFF;
                    
                    &:after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        height: 2px;
                        background: #409EFF;
                    }
                }
            }
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