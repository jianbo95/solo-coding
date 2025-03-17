<template>
    <div class="catchball-container">
        <div ref="scene"></div>
    </div>
</template>

<script>
export default {
    name: 'Catchball',
    data() {
        return {
            engine: null,
            render: null,
            ball: null
        }
    },
    mounted() {
        this.initPhysics()
    },
    beforeDestroy() {
        // 清理物理引擎资源
        if (this.render) {
            Matter.Render.stop(this.render)
        }
        if (this.engine) {
            Matter.Engine.clear(this.engine)
        }
    },
    methods: {
        initPhysics() {
            // 创建物理引擎
            this.engine = Matter.Engine.create()

            // 创建渲染器
            this.render = Matter.Render.create({
                element: this.$refs.scene,
                engine: this.engine,
                options: {
                    width: 800,
                    height: 600,
                    wireframes: false,
                    background: '#f0f0f0'
                }
            })

            // 创建小球
            this.ball = Matter.Bodies.circle(400, 50, 20, {
                restitution: 0.8,  // 弹性
                render: {
                    fillStyle: '#4CAF50'  // 小球颜色
                }
            })

            // 创建地面
            const ground = Matter.Bodies.rectangle(400, 590, 800, 20, {
                isStatic: true,  // 静态物体
                render: {
                    fillStyle: '#795548'
                }
            })

            // 添加物体到世界
            Matter.World.add(this.engine.world, [this.ball, ground])

            // 执行渲染操作
            Matter.Render.run(this.render)
            
            // 创建运行方法
            const runner = Matter.Runner.create()
            // 运行渲染器
            Matter.Runner.run(runner, this.engine)
        }
    }
}
</script>

<style scoped>
.catchball-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>