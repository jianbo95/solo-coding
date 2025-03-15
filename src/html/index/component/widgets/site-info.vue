<template>
    <div class="widget site-info">
        <div class="widget-title">站点信息</div>
        <ul class="info-list">
            <li>
                <i class="el-icon-document"></i>
                文章数：{{ articleCount }}
            </li>
            <li>
                <i class="el-icon-view"></i>
                访问量：{{ visitCount }}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'SiteInfo',
    data() {
        return {
            articleCount: '开发中...',
            visitCount: '开发中...'
        }
    }
}
</script>

<style lang="less" scoped>
.widget {
    background: #fff;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    
    .widget-title {
        font-size: 18px;
        margin-bottom: 15px;
        font-weight: bold;
    }
    
    .info-list {
        list-style: none;
        padding: 0;
        
        li {
            display: flex;
            align-items: center;
            padding: 10px 0;
            
            i {
                margin-right: 10px;
                color: #409EFF;
            }
        }
    }
}
</style>