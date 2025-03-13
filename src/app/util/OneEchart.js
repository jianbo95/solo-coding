
var color = [
    '#81C784', '#64B5F6', '#EF5350', 
    '#9575CD', '#FB8C00', '#7986CB',
    '#4DB6AC', '#AED581',
    '#BCAAA4', '#FBC02D', '#FFA000',
    '#78909C', '#deb887', '#ff7f50',
    '#5f9ea0', '#a52a2a', '#d2691e',
    '#008b8b', '#b8860b', '#8fbc8f',
    '#008000', '#ff69b4', '#4b0082'
];

var buildColorPicker = function() {
    var instance = {
        id: new Date().getTime(),
        colorMap: {},
        index: 0,
        // 颜色分配
        select: function(key) {
            if(this.index >= color.length) {
                this.index = 0;
            }
            var c = color[this.index];
            this.colorMap[key] = c;
            this.index ++;
            return c;
        },
        // 获取颜色
        get: function(key) {
            // 从已分配的颜色集合中读取颜色
            if(this.colorMap[key] != null) {
                return this.colorMap[key];
            } else {
                return this.select(key);
            }
        }
    };
    return instance;
};

// oneEchart 实例
var buildInstance = function(config) {
    var instance = {
        config: config,
        option: config.option,
        select: null,
        chart: null,
        dataIndex: null,
        // 自定义事件
        on: function(event, _call) {
            if(event == 'overX') {
                this.chart.on('updateAxisPointer', (event) => {
                    if(event.dataIndex != null) {
                        if(!this.overXFlag) {
                            _call(event.dataIndex);
                            this.dataIndex = event.dataIndex;
                        }
                        if(this.dataIndex != event.dataIndex) {
                            _call(event.dataIndex);
                            this.dataIndex = event.dataIndex;
                        }
                        this.overXFlag = true;
                    }
                });
            }
            if(event == 'outX') {
                this.chart.on('hideTip', (event) => {
                    if(this.overXFlag) {
                        this.overXFlag = false;
                        _call();
                    }
                });
            }
        },
        // 销毁echarts实例
        delete: function() {
            // 删除
            if(this.chart != null) {
                // window.echarts.init(dom);
                this.chart.dispose();
            }
        },
        // 初始化OneEchart实例
        init: function() {
            // console.log('init from config', config);
            this.select = config.select;

            window.addEventListener("resize", () => { 
                if(this.chart != null) {
                    this.chart.resize(); 
                }
            });
            // 绘制图表。
            // var dom = $(this.select)[0];
            var dom = Core.getDom(this.select);
            if(dom == null) {
                console.error("[获取dom失败]");
                return;
            } else {
                // console.log("[创建echart dom成功]");
            }
            var chart = window.echarts.init(dom);
            if(config.option.color == null) {
                config.option.color = color;
            }
            chart.setOption(config.option);
            this.chart = chart;
        },
        // 获取series
        getSeries: function() {
            return this.option.series;
        },
        // 获取series的一列数据
        getSeriesRow: function() {
            var series = this.getSeries();
            var list = [];
            for(var k in series) {
                var unit = series[k];
                for(var i in unit.data) {
                    var value = unit.data[i];
                }
            }
        },
        render: function() {

        },
        push: function(obj) {
            this.render();
        }
    };
    instance.init();
    instance.render();
    return instance;
};

var Echart = {
    colorPicker: buildColorPicker(), // 始终单例
    colorPickerMap: {},
    /**
     * 构建饼图
     * @param {String} select 
     * @param {Array} data 
     */
    build: function(config) {
        return buildInstance(config);
    },
    getColorPicker: function(group) {
        if(this.colorPickerMap[group] == null) {
            this.colorPickerMap[group] = buildColorPicker();
        }
        return this.colorPickerMap[group];
    },

    buildLineColor: function(line, group) {
        // console.log('line', line);
        return this.buildColor(line.name, group);
    },
    buildPieColor: function(pie, group) {
        // console.log('pie', pie);
        return this.buildColor(pie.name, group);
    },
    buildColor: function(name, group) {
        // console.log('group', group);
        var picker = this.getColorPicker(group);
        var color = picker.get(name);
        // console.log('color', color);
        return color;
    }
};

window.OneEchart = Echart;

export default Echart;
