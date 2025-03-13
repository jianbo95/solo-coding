const IdentifyNumberRegex = /(^\d{6}(18|19|20)\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[X])$)|(^\d{8}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}$)/

export default {
  PostCode: /^[1-9][0-9]{5}$/, // 邮编
  Email: /[\w-]+@{1}[\w-]+\.{1}\w{2,4}(\.{0,1}\w{2}){0,1}/ig, // 电子邮箱
  Hour: /^(0?[1-9]|1[0-9]|2[0-4])$/, // 小时
  PhoneNumber: /^1[3456789]\d{9}$/, // 电话
  TelNo: /(^1\d{10}$)|(^\d{3,4}-\d{7,8}$)/,
  // TelNo: /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/, // 座机号码
  Number: /^[0-9]*$/,
  Number_1_100: /^(0|\d{1,2}|100)$/,
  Number2: /^\d+(\.\d{1,2})?$/,
  Number3: /^\d+(\.\d{1,3})?$/,
  Number4: /^(0|-?[0-9]\d*)+(\.\d{1,2})?$/,
  Number5: /^[1-9][0-9]{0,3}$/, // 1-9999整数
  Number6: /^[+-]?(0|([1-9]\d*))(\.\d+)?$/,  //不限制⼩数位数
  NumberJudge: /^[0-9]+([.]{1}[0-9]{1,2})?$/,//判断非负数并且最多两位小数
  RunMiles: /^\d{1,7}(\.\d{1,2})?$/,
  NumberAndEnglish: /^[0-9a-zA-Z]*$/,
  EngineNo: /^[0-9a-zA-Z\-\s]*$/,
  orgCode:/^[0-9A-Z]{8}([0-9]{1}|[X])$/,
  NoChinese: /^[^\u4e00-\u9fa5]*$/,  // 非中文
  MobilePhone: /^[1-9][0-9]{10}$/,  // 手机
  AccountNo: /^[0-9a-zA-Z]*$/,    // 数字或字母
  Date: /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/,   // 日期
  Money: /^(-?(0|[1-9][0-9]{0,8})([.][0-9]{1,2})?)?$/,    // 货币类型
  PositiveMoney: /^((0|[1-9][0-9]{0,8})([.][0-9]{1,2})?)$/,    // 货币类型
  CarNo: /(^[\u4e00-\u9fa5]{1}[A-Z0-9]{5,10}[\u4e00-\u9fa5]?$)|(^[A-Z]{2}[A-Z0-9]{4,9}[\u4e00-\u9fa5]?$)/, // 车牌号,
  // CarNo: /(^[\u4e00-\u9fa5]{1}[A-Z0-9]{5,10}$)|(^WJ[0-9]{4,9}$)/, // 车牌号,
  CarNoL: /^[A-Z0-9]{5,10}\u9886$/, // 领馆车牌号,
  CarNoLM: /^[A-Z0-9]{1}\u9886[A-Z0-9]{4,9}$/, // 领馆摩托车牌号,
  // CarNoL: /([\u4e00-\u9fa5A-Z0-9]{4,9}\u9886$)/, // 领馆车牌号,
  // CarNoLM: /([\u4e00-\u9fa5A-Z0-9]{1}\u9886[\u4e00-\u9fa5A-Z0-9]{3,8})/, // 领馆摩托车牌号,
  CarNoS: /((^\u4f7f[A-Z0-9]{4,9}$)|(^[A-Z0-9]{4,9}\u4f7f$))/, // 使车牌号,
  CarNoJ: /^[\u4e00-\u9fa5]{1}[A-Z0-9]{5}\u5B66$/,//教练车牌号，
  Percentage: /^100$|^(\d|[1-9]\d)(\.\d+)*$/,   // 百分率
  IdentifyNumber: IdentifyNumberRegex,
  NoEmpty: /\S/,
  Money2:  /^([0-9]{1,9}|[0-9]{1,9}\.[0-9]{1,2})$/,
  Money3: /^\d{1,9}$|^\d{1,9}[.]\d{1,2}$/,// 小数点前最多9位小数点后最多只有两位而且不为负数
  MoneyLimit: function(limit) {
    return function (rule, value, callback) {
      if(value > limit) {
        callback(new Error('金额不能大于' + limit + '元'))
      } else {
        callback()
      }
    }
  },

  IdentifyNumberValidator: function (rule, value, callback) {
    let city = {
      11: '北京',
      12: '天津',
      13: '河北',
      14: '山西',
      15: '内蒙古',
      21: '辽宁',
      22: '吉林',
      23: '黑龙江 ',
      31: '上海',
      32: '江苏',
      33: '浙江',
      34: '安徽',
      35: '福建',
      36: '江西',
      37: '山东',
      41: '河南',
      42: '湖北 ',
      43: '湖南',
      44: '广东',
      45: '广西',
      46: '海南',
      50: '重庆',
      51: '四川',
      52: '贵州',
      53: '云南',
      54: '西藏 ',
      61: '陕西',
      62: '甘肃',
      63: '青海',
      64: '宁夏',
      65: '新疆',
      71: '台湾',
      81: '香港',
      82: '澳门',
      91: '国外 '
    }
    if (!value || !IdentifyNumberRegex.test(value)) {
      callback(new Error('请录入正确的身份证'))
    } else if (!city[value.substr(0, 2)]) {
      callback(new Error('请录入正确的身份证'))
    } else {
      if (value.length === 18) {
        value = value.split('')
        var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
        var parity = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
        var sum = 0
        for (let i = 0; i < 17; i++) {
          sum += value[i] * factor[i]
        }
        console.log(sum, parity[sum%11], value[17])
        if (parity[sum % 11] !== value[17].toUpperCase()) {
          callback(new Error('请录入正确的身份证'))
        }
      }
    }
    callback()
  },
  VinNo: /^((?![IOQ])([A-Z]|[0-9])){17}$/, // VIN码
  LessVInNo: /^((?![IOQ])([A-Z]|[0-9])){1,17}$/, // 小于 17
  MoreVinNo: /^((?![IOQ])([A-Z]|[0-9])){17,}$/, // 大于 17
  DriverLisenceNo: /^.{10}(.{5}(.{3})?)?$/, // 驾驶证号
  DriverIdentifyNumber:/^[0-9a-zA-Z]{1,18}$/,//定损出险驾驶员证件号码（不超过18）
  // DriverLisenceNo: /^([0-9A-Z]{10}$|[0-9A-Z]{15}$|[0-9A-Z]{18}$)/, // 驾驶证号
  Age: /^([1-9]|[1-9]\d|1\d{2}|200)$/, // 年龄是1-200之间有效
  Age2: /^([0-9]|[1-9]\d|1\d{2}|200)$/, // 年龄是0-200之间有效
  Age3: /^(1[89]|[2-6]\d|70)$/, // 年龄是18-70之间有效
  Month: /^(0?[[1-9]|1[0-2])$/, // 校验月份
  Month2: /^([0-9]|1[0-2])$/, // 校验月份,可以为0
  UnifiedSocialCreditCode: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/,  //统一社会信用代码
  Name: /^([\u4e00-\u9fa5]{1,20}|[a-zA-Z\.\s]{1,20})$/,  //姓名
  notnull:/\s*\S+?/,  // 验证非空白字符正则
  buildRquired(fieldMap) {
    let rules = [];
    for(let key in fieldMap) {
      let name = fieldMap[key];
      let rule = [{ required: true, message: name + '为必填项', trigger: 'blur' }];
      rules.push(rule);
    }
    return rules;
  }
}
