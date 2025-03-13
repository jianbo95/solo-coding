<template>
    <div class="tag-cloud-widget">
        <div class="widget-title">标签云</div>
        <div class="tag-sphere" ref="tagContainer">
            <span 
                v-for="(tag, index) in tags" 
                :key="index"
                :style="getTagStyle(index)"
                class="tag"
                @mouseover="pause = true"
                @mouseout="pause = false">
                {{ tag.name }}
            </span>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tags: [
                { name: 'JavaScript', size: 16 },
                { name: 'Vue', size: 18 },
                { name: 'CSS3', size: 14 },
                { name: 'HTML5', size: 16 },
                { name: 'Node.js', size: 15 },
                { name: 'React', size: 17 },
                { name: 'TypeScript', size: 16 },
                { name: 'Webpack', size: 15 },
                { name: '前端开发', size: 18 },
                { name: '后端开发', size: 17 },
                { name: '微服务', size: 15 },
                { name: '设计模式', size: 16 }
            ],
            radius: 120,
            pause: false,
            angleX: 0,
            angleY: 0,
            requestId: null
        }
    },
    mounted() {
        this.initTagCloud();
    },
    beforeDestroy() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
    },
    methods: {
        initTagCloud() {
            this.animate();
        },
        animate() {
            if (!this.pause) {
                this.angleX += 0.01;
                this.angleY += 0.01;
            }
            this.requestId = requestAnimationFrame(this.animate);
        },
        getTagStyle(index) {
            const phi = Math.acos(-1 + (2 * index) / this.tags.length);
            const theta = Math.sqrt(this.tags.length * Math.PI) * phi;
            
            const x = this.radius * Math.cos(theta) * Math.sin(phi);
            const y = this.radius * Math.sin(theta) * Math.sin(phi);
            const z = this.radius * Math.cos(phi);
            
            const rx = x * Math.cos(this.angleY) + z * Math.sin(this.angleY);
            const rz = -x * Math.sin(this.angleY) + z * Math.cos(this.angleY);
            const ry = y * Math.cos(this.angleX) + rz * Math.sin(this.angleX);
            
            const per = 2 * (rz + this.radius) / (2 * this.radius);
            const size = this.tags[index].size * per;
            const alpha = per * per;
            
            return {
                transform: `translate3d(${rx}px, ${ry}px, ${rz}px)`,
                opacity: alpha,
                fontSize: `${size}px`,
                zIndex: Math.floor(alpha * 1000)
            }
        }
    }
}
</script>

<style lang="less" scoped>
.tag-cloud-widget {
    background: #fff;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    
    .widget-title {
        font-size: 18px;
        margin-bottom: 15px;
        font-weight: bold;
    }
    
    .tag-sphere {
        position: relative;
        width: 280px;
        height: 280px;
        display: flex;
        justify-content: center;
        align-items: center;
        perspective: 400px;
        
        .tag {
            position: absolute;
            padding: 5px 10px;
            color: #409EFF;
            cursor: pointer;
            user-select: none;
            transition: transform 0.1s ease-out;
            
            &:hover {
                color: #f56c6c;
                font-weight: bold;
            }
        }
    }
}
</style>