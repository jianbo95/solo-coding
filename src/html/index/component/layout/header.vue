<template>
    <div class="header-container">
        <div class="header-content">
            <div class="logo">Solo Coding</div>
            <nav class="nav-menu">
                <router-link to="/" :class="{ active: $route.path === '/' }">{{ $t('menu.home') }}</router-link>
                <router-link to="/game" :class="{ active: $route.path === '/game' }">{{ $t('menu.game') }}</router-link>
            </nav>
            <div class="right-menu">
                <el-input 
                    :placeholder="$t('main.search') + '...'" 
                    :size="size"
                    prefix-icon="el-icon-search">
                </el-input>

                <el-select v-model="language" @change="handleLanguageChange" :size="size">
                    <el-option :label="$t('language.zh')" value="zh"></el-option>
                    <el-option :label="$t('language.en')" value="en"></el-option>
                </el-select>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            language: localStorage.getItem('language') || 'zh',
            size: window.size
        }
    },
    methods: {
        handleLanguageChange(val) {
            localStorage.setItem('language', val);
            window.location.reload();
        }
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
        
        .right-menu {
            margin-left: auto;
            width: 420px;
            display: flex;
            align-items: center;
            gap: 10px;
            
            .el-input {
                flex: 1;
            }
            
            .el-select {
                width: 100px;
                flex-shrink: 0;
            }
        }
        
        .nav-menu {
            display: flex;
            gap: 20px;
            
            a {
                padding: 0 20px;

                @media screen and (max-width: 768px) {
                    line-height: 40px;
                }
                @media screen and (min-width: 768.00001px) {
                    line-height: 60px;
                }
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

@media screen and (max-width: 768px) {
    .header-container {
        .header-content {
            width: 100%;
            .logo {
                display: none;
            }
        }
    }
}
</style>