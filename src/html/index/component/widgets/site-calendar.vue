<template>
    <div class="widget calendar">
        <div class="widget-title">{{ $t('main.calendar') }}</div>
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
    padding: 10px 0;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    
    .widget-title {
        padding: 20px 0 0 20px;
        font-size: 18px;
        margin-bottom: 0px;
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
        text-align: center;
        .el-calendar__title {
            padding-bottom: 5px;
        }
    }
    .el-calendar__title {
        display: block; 
    }
    .el-calendar-table .el-calendar-day {
        height:25px;
    }
}
</style>