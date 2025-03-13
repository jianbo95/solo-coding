<template>
    <div class="widget color-tags">
        <div class="widget-title">标签云</div>
        <div class="tags-container">
            <span 
                v-for="(tag, index) in tagList" 
                :key="index"
                class="tag"
                :style="getTagStyle(tag, index)"
                @click="handleTagClick(tag)">
                {{ tag.name }}
                <span class="count">({{ tag.count }})</span>
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ColorTag',
    props: {
        tags: {
            type: Array,
            required: true,
            default: () => []
        }
    },
    data() {
        return {
            colors: [
                '#FF6B6B',  // 珊瑚红
                '#4ECDC4',  // 绿松石
                '#45B7D1',  // 天蓝
                '#96CEB4',  // 薄荷绿
                '#9B5DE5',  // 紫罗兰
                '#FFD93D',  // 明黄
                '#FF8066',  // 橙红
                '#6C5CE7',  // 靛蓝
                '#A8E6CF',  // 薄荷绿
                '#FF9A9E',  // 粉红
                '#81B214',  // 青柠绿
                '#D4A5A5'   // 玫瑰粉
            ]
        }
    },
    computed: {
        tagList() {
            return this.tags.map(tag => ({
                ...tag,
                count: tag.count || 0
            }));
        }
    },
    methods: {
        getTagStyle(tag, index) {
            const size = 12 + Math.min(tag.count / 2, 8);
            return {
                backgroundColor: this.colors[index % this.colors.length],
                color: '#ffffff',
                fontSize: `${size}px`
            }
        },
        handleTagClick(tag) {
            this.$router.push({
                path: '/tag',
                query: { name: tag.name }
            });
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
    
    .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        
        .tag {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            user-select: none;
            
            .count {
                opacity: 0.7;
                font-size: 0.9em;
            }
            
            &:hover {
                transform: scale(1.05);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
        }
    }
}
</style>