<template>
    <div class="catchball-container">
        <div ref="scene"></div>
        <div class="score">
            <span>AI: {{ aiScore }}</span>
            <span>玩家: {{ playerScore }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Catchball',
    data() {
        return {
            engine: null,
            render: null,
            ball: null,
            playerPaddle: null,
            aiPaddle: null,
            walls: [],
            aiScore: 0,
            playerScore: 0,
            gameStarted: false
        }
    },
    mounted() {
        this.initPhysics()
        this.setupControls()
        this.startGameLoop()
    },
    beforeDestroy() {
        if (this.render) {
            Matter.Render.stop(this.render)
        }
        if (this.engine) {
            Matter.Engine.clear(this.engine)
        }
        window.removeEventListener('keydown', this.handleKeyDown)
    },
    methods: {
        initPhysics() {
            this.engine = Matter.Engine.create()
            this.engine.world.gravity.y = 0

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

            // 创建玩家挡板
            this.playerPaddle = Matter.Bodies.rectangle(400, 550, 100, 20, {
                isStatic: true,
                render: { fillStyle: '#2196F3' }
            })

            // 创建AI挡板
            this.aiPaddle = Matter.Bodies.rectangle(400, 50, 100, 20, {
                isStatic: true,
                render: { fillStyle: '#F44336' }
            })

            // 创建左右墙壁
            this.walls = [
                Matter.Bodies.rectangle(0, 300, 20, 600, { 
                    isStatic: true,
                    render: { fillStyle: '#795548' }
                }),
                Matter.Bodies.rectangle(800, 300, 20, 600, { 
                    isStatic: true,
                    render: { fillStyle: '#795548' }
                })
            ]

            Matter.World.add(this.engine.world, [...this.walls, this.playerPaddle, this.aiPaddle])

            Matter.Render.run(this.render)
            const runner = Matter.Runner.create()
            Matter.Runner.run(runner, this.engine)

            // 碰撞检测
            Matter.Events.on(this.engine, 'collisionStart', (event) => {
                this.handleCollision(event)
            })
        },

        setupControls() {
            window.addEventListener('keydown', this.handleKeyDown)
        },

        handleKeyDown(e) {
            const moveSpeed = 20
            if (e.key === 'ArrowLeft') {
                if (this.playerPaddle.position.x > 60) {
                    Matter.Body.setPosition(this.playerPaddle, {
                        x: this.playerPaddle.position.x - moveSpeed,
                        y: this.playerPaddle.position.y
                    })
                }
            } else if (e.key === 'ArrowRight') {
                if (this.playerPaddle.position.x < 740) {
                    Matter.Body.setPosition(this.playerPaddle, {
                        x: this.playerPaddle.position.x + moveSpeed,
                        y: this.playerPaddle.position.y
                    })
                }
            } else if (e.key === 'ArrowUp' && !this.ball) {
                this.launchBall()
            }
        },

        launchBall() {
            this.ball = Matter.Bodies.circle(
                this.playerPaddle.position.x,
                this.playerPaddle.position.y - 30,
                10,
                {
                    restitution: 1,
                    friction: 0,
                    render: { fillStyle: '#4CAF50' }
                }
            )
            Matter.Body.setVelocity(this.ball, { x: 0, y: -10 })
            Matter.World.add(this.engine.world, this.ball)
        },

        startGameLoop() {
            setInterval(() => {
                if (this.ball && this.aiPaddle) {
                    // AI逻辑
                    const targetX = this.ball.position.x
                    const currentX = this.aiPaddle.position.x
                    const moveSpeed = 5

                    if (targetX < currentX - 10) {
                        Matter.Body.setPosition(this.aiPaddle, {
                            x: Math.max(60, currentX - moveSpeed),
                            y: this.aiPaddle.position.y
                        })
                    } else if (targetX > currentX + 10) {
                        Matter.Body.setPosition(this.aiPaddle, {
                            x: Math.min(740, currentX + moveSpeed),
                            y: this.aiPaddle.position.y
                        })
                    }
                }

                // 检查是否得分
                if (this.ball) {
                    if (this.ball.position.y > 600) {
                        this.aiScore++
                        this.resetBall()
                    } else if (this.ball.position.y < 0) {
                        this.playerScore++
                        this.resetBall()
                    }
                }
            }, 16)
        },

        resetBall() {
            Matter.World.remove(this.engine.world, this.ball)
            this.ball = null
        },

        handleCollision(event) {
            event.pairs.forEach((pair) => {
                if (this.ball) {
                    // 检查是否与挡板碰撞
                    const paddle = pair.bodyA === this.ball ? pair.bodyB : pair.bodyA
                    if (paddle === this.playerPaddle || paddle === this.aiPaddle) {
                        // 计算碰撞点相对挡板中心的位置
                        const relativePosition = this.ball.position.x - paddle.position.x
                        const maxAngle = Math.PI / 3 // 最大反弹角度（60度）
                        const angle = (relativePosition / 50) * maxAngle // 50是挡板半宽
                        
                        const targetSpeed = 10
                        const velocityX = targetSpeed * Math.sin(angle)
                        const velocityY = targetSpeed * Math.cos(angle) * (this.ball.velocity.y > 0 ? -1 : 1)

                        Matter.Body.setVelocity(this.ball, {
                            x: velocityX,
                            y: velocityY
                        })
                    } else {
                        // 与墙壁碰撞时保持速度不变
                        const velocity = this.ball.velocity
                        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
                        const targetSpeed = 10
                        const scale = targetSpeed / speed
                        
                        Matter.Body.setVelocity(this.ball, {
                            x: velocity.x * scale,
                            y: velocity.y * scale
                        })
                    }
                }
            })
        }
    }
}
</script>

<style scoped>
.catchball-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.score {
    margin-top: 20px;
    font-size: 24px;
}
.score span {
    margin: 0 20px;
}
</style>