(function() {

    var Test = {
        testEchart: function() {

            console.log(echarts);
            // 绘制图表。
            echarts.init(document.getElementById('testEchart')).setOption({
                series: {
                    type: 'pie',
                    data: [
                        {name: '蓝色', value: 1212},
                        {name: '黑色', value: 2323},
                        {name: '红色', value: 1919}
                    ]
                }
            });
        },
        testEchartByJquery: function() {

            console.log(echarts);
            // 绘制图表。
            var element = $("#testEchart")[0];
            echarts.init(element).setOption({
                series: {
                    type: 'pie',
                    data: [
                        {name: '蓝色', value: 1212},
                        {name: '黑色', value: 2323},
                        {name: '红色', value: 1919}
                    ]
                }
            });
        }
    };

    window.Test = Test;
} ());