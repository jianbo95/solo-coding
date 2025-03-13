// 上下文路径
var root = '/api/'; // 使用相对路径

if(location.href.indexOf('http://localhost') == -1
  && location.href.indexOf('http://10.20.88') == -1
  && location.href.indexOf('http://192.168') == -1) {
    // 不是本地环境
  // if(window.UserType == 'auction') {
  //   root = '/jianbo/api2.0/';
  // } else {
  //   root = '/residualcar/handle/api2.0/';
  // }
}

// 测试环境jianbo转发
// if(location.href.indexOf('jianbo.com') != -1) {
//   // https://jianbo.com/jianbo/jianbo/#/
//   root = '/jianbo/residualcar/handle/api2.0/';
// }

// 嵌入在容器时上下文为 /
if(location.href.indexOf(":9114") != -1) {
  root = '/';
}

  var Constants = {
    root: root,
    server: '../../',
    colorIndex: 0,
    colorList: [
      '#66CCCC',
      '#666699',
      '#FF99CC',
      '#99CC66',
      '#FF9900',
      '#FFCC00'
    ],
    getColor: function (index) {
      var i = Number(index) % this.colorList.length;
      return this.colorList[i];
    },
    getColorAuto: function () {
      var i = this.colorIndex % this.colorList.length;
      this.colorIndex ++;
      return this.colorList[i];
    }
  };
  window.Constants = Constants;

  window.ElementColor = {
    green: '#67C23A',
    blue: '#409EFF',
    orange: '#E6A23C',
    red: '#F56C6C',
    grey: '#909399'
  };
  

export default Constants;