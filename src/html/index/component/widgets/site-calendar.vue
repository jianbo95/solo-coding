<template>
    <div class="widget calendar">
        <div class="widget-title">日历</div>
        <el-calendar :size="window.size"></el-calendar>
    </div>
</template>

<script>
export default {
    name: 'SiteCalendar'
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
    
    &.calendar {
        :deep(.el-calendar) {
            background: none;
            padding: 0;
        }
    }
    .el-calendar__header {
        display: block; 
    }
    .el-calendar__title {
        display: block; 
    }
    .el-calendar-table .el-calendar-day {
        height:25px;
    }
}
</style>