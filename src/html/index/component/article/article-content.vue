<template>
    <div class="article-content">
        <h1 class="title">文章标题</h1>
        <div class="meta">
            <span class="time">
                <i class="el-icon-time"></i>
                2023-10-20
            </span>
            <span class="tags">
                <i class="el-icon-collection-tag"></i>
                <el-tag :size="window.size" v-for="tag in tags" :key="tag">
                    {{ tag }}
                </el-tag>
            </span>
        </div>
        <div class="content">
            文章内容
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tags: ['JavaScript', 'Vue', 'Web开发']
        }
    }
}
</script>

<style lang="less" scoped>
.article-content {
    .title {
        font-size: 24px;
        margin-bottom: 20px;
    }
    
    .meta {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
        color: #666;
        
        .tags {
            display: flex;
            gap: 10px;
            align-items: center;
            
            .el-tag {
                margin-left: 5px;
            }
        }
    }
    
    .content {
        line-height: 1.8;
    }
}
</style>