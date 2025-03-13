<template>
    <div style="padding:10px;">
        <div style="background: #eee; width: 600px;">

            <div id="testEchart" style="width: 100%;height:400px;"></div>
            <div>
                <el-button type="primary" @click="build">动态构建</el-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
            pieData: [],
            pipChart: null
        }
    },
    created: function() {
        this.pieData = [
            {name: 'POS支付', value: 1212},
            {name: '微信支付', value: 2323},
            {name: '支付宝支付', value: 1919}
        ];
    },
    mounted: function() {
        // Test.testEchart();
        // Test.testEchartByJquery();
        var option = {
            series: {
                type: 'pie',
                data: this.pieData
            }
        };
        option = this.options1();
        this.pipChart = OneEchart.build({ // 构建实例
            select: '#testEchart', 
            option: option
        });
    },
    methods: {
        options1: function() {
            option = {
                title: {
                    text: '南丁格尔玫瑰图',
                    subtext: '纯属虚构',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    left: 'center',
                    top: 'bottom',
                    data: ['rose1', 'rose2', 'rose3', 'rose4', 'rose5', 'rose6', 'rose7', 'rose8']
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {show: true},
                        dataView: {show: true, readOnly: false},
                        magicType: {
                            show: true,
                            type: ['pie', 'funnel']
                        },
                        restore: {show: true},
                        saveAsImage: {show: true}
                    }
                },
                series: [
                    {
                        name: '半径模式',
                        type: 'pie',
                        radius: [20, 110],
                        center: ['25%', '50%'],
                        roseType: 'radius',
                        label: {
                            show: false
                        },
                        emphasis: {
                            label: {
                                show: true
                            }
                        },
                        data: [
                            {value: 10, name: 'rose1'},
                            {value: 5, name: 'rose2'},
                            {value: 15, name: 'rose3'},
                            {value: 25, name: 'rose4'},
                            {value: 20, name: 'rose5'},
                            {value: 35, name: 'rose6'},
                            {value: 30, name: 'rose7'},
                            {value: 40, name: 'rose8'}
                        ]
                    },
                    {
                        name: '面积模式',
                        type: 'pie',
                        radius: [30, 110],
                        center: ['75%', '50%'],
                        roseType: 'area',
                        data: [
                            {value: 10, name: 'rose1'},
                            {value: 5, name: 'rose2'},
                            {value: 15, name: 'rose3'},
                            {value: 25, name: 'rose4'},
                            {value: 20, name: 'rose5'},
                            {value: 35, name: 'rose6'},
                            {value: 30, name: 'rose7'},
                            {value: 40, name: 'rose8'}
                        ]
                    }
                ]
            };
            return option;
        },
        build: function() {
            this.pipChart.push({
                name: '白色', value:500
            });
            
        }
    },
}
</script>