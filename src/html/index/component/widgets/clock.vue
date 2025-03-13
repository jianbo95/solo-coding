<template>
    <div class="clock-widget">
        <div class="widget-title">当前时间</div>
        <canvas ref="clock" width="280" height="280"></canvas>
    </div>
</template>

<script>
export default {
    data() {
        return {
            timer: null,
            romanNumerals: ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']
        }
    },
    mounted() {
        this.initClock();
        this.timer = setInterval(this.drawClock, 1000);
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    },
    methods: {
        initClock() {
            this.ctx = this.$refs.clock.getContext('2d');
            this.drawClock();
        },
        drawClock() {
            const ctx = this.ctx;
            const radius = 130;
            const centerX = 140;
            const centerY = 140;

            // 清空画布
            ctx.clearRect(0, 0, 280, 280);

            // 绘制外圈渐变
            const gradient = ctx.createRadialGradient(centerX, centerY, radius - 5, centerX, centerY, radius);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#f5f7fa');
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = '#dcdfe6';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制罗马数字
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = '#303133';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            this.romanNumerals.forEach((numeral, index) => {
                const angle = (index * Math.PI) / 6 - Math.PI / 2;
                const x = centerX + (radius - 30) * Math.cos(angle);
                const y = centerY + (radius - 30) * Math.sin(angle);
                ctx.fillText(numeral, x, y);
            });

            // 绘制小刻度
            for (let i = 0; i < 60; i++) {
                const angle = (i * Math.PI) / 30;
                const isHour = i % 5 === 0;
                const x1 = centerX + (radius - (isHour ? 15 : 10)) * Math.cos(angle);
                const y1 = centerY + (radius - (isHour ? 15 : 10)) * Math.sin(angle);
                const x2 = centerX + (radius - 5) * Math.cos(angle);
                const y2 = centerY + (radius - 5) * Math.sin(angle);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = isHour ? '#303133' : '#909399';
                ctx.lineWidth = isHour ? 2 : 1;
                ctx.stroke();
            }

            // 获取当前时间
            const now = new Date();
            const hours = now.getHours() % 12;
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            // 绘制时针
            this.drawHand(ctx, centerX, centerY, radius * 0.5, 
                (hours + minutes / 60) * 30 * Math.PI / 180, 4, '#303133');

            // 绘制分针
            this.drawHand(ctx, centerX, centerY, radius * 0.7, 
                minutes * 6 * Math.PI / 180, 3, '#606266');

            // 绘制秒针
            this.drawHand(ctx, centerX, centerY, radius * 0.8, 
                seconds * 6 * Math.PI / 180, 1, '#409EFF');

            // 绘制中心点
            ctx.beginPath();
            ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#409EFF';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();
        },
        drawHand(ctx, x, y, length, angle, width, color) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + length * Math.sin(angle),
                y - length * Math.cos(angle)
            );
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
        }
    }
}
</script>

<style lang="less" scoped>
.clock-widget {
    background: #fff;
    border-radius: 4px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    
    .widget-title {
        font-size: 18px;
        margin-bottom: 15px;
        font-weight: bold;
    }
}
</style>