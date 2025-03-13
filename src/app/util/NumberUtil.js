/**
 * 数字工具类
 */
let NumberUtil = {
    /**
     * 数字转成汉字
     * @params num === 要转换的数字
     * @return 汉字
     * */
    toChinesNum(num) {
        let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
        let unit = ['', '十', '百', '千', '万']
        num = parseInt(num)
        let getWan = (temp) => {
            let strArr = temp.toString().split('').reverse()
            let newNum = ''
            let newArr = []
            strArr.forEach((item, index) => {
                newArr.unshift(item === '0' ? changeNum[item] : changeNum[item] + unit[index])
            })
            let numArr = []
            newArr.forEach((m, n) => {
                if (m !== '零') numArr.push(n)
            })
            if (newArr.length > 1) {
                newArr.forEach((m, n) => {
                    if (newArr[newArr.length - 1] === '零') {
                        if (n <= numArr[numArr.length - 1]) {
                        newNum += m
                        }
                    } else {
                        newNum += m
                    }
                })
            } else {
                newNum = newArr[0]
            }
    
            return newNum
        }
        let overWan = Math.floor(num / 10000)
        let noWan = num % 10000
        if (noWan.toString().length < 4) {
            noWan = '0' + noWan
        }
        return overWan ? getWan(overWan) + '万' + getWan(noWan) : getWan(num)
    },

    /**
     * 四舍五入
     */
    round (number, precision) {
        if (isNaN(number)) {
            number = 0;
        }

        if (number > 0) {
            return (
                parseInt(number * Math.pow(10, precision) + 0.5) / Math.pow(10, precision)
            );
        } else if (number < 0) {
            return (
                parseInt(number * Math.pow(10, precision) - 0.5) / Math.pow(10, precision)
            );
        } else {
            return parseInt(number * Math.pow(10, precision)) / Math.pow(10, precision);
        }
    },

    /**
     * 截取N位小数（直接截取，不进行四舍五入）
     */
    fixed (number, precision) {
        if (isNaN(number) || number === "" || number == null) {
            number = 0;
        }
        let result = number.toString();
        if (result.indexOf(".") === -1) {
            result = result + ".";
        }
        let tempStr = "";
        for (let i = 0; i < precision; i++) {
            tempStr = tempStr + "0";
        }
        result = result + tempStr;
        result = result.substring(0, precision + result.indexOf(".") + 1);
        if (result.endsWith(".")) {
            result = result.substring(0, result.length - 1);
        }

        return result;
    },

    /**
     * 数字运算时，需要将空转换成默认的0
     * @param str
     * @returns {*}
     */
    brankToZero (str) {
        if (!str || (str && typeof str === "string" && str.trim() === "")) {
            str = "0";
        }
        return str;
    },

    /**
     * 取整
     * @param  {[type]} number [保费]
     * @param  {[type]} flag   [标志。-1表示向下取整；0表示四舍五入；1或者不含这参数表示向上取整]
     * @return {[type]}        [description]
     */
    adjustValue (number, flag) {
        let OldValue = parseFloat(number);
        let NewValue = 0;
        if (flag === -1) {
            NewValue = Math.floor(OldValue);
        } else if (flag === 0) {
            NewValue = Math.round(OldValue);
        } else if (flag === undefined || flag === 1) {
            NewValue = Math.ceil(OldValue);
        }
        return NewValue;
    },

    add (a, b) {
        var c, d, e;
        try {
            c = a.toString().split(".")[1].length;
        } catch (f) {
            c = 0;
        }
        try {
            d = b.toString().split(".")[1].length;
        } catch (f) {
            d = 0;
        }
        e = Math.pow(10, Math.max(c, d));
        return (this.mul(a, e) + this.mul(b, e)) / e;
    },

    mul (a, b) {
        var c = 0;
        var d, e;
        try {
            d = a.toString();
        } catch (f) {
            d = "0";
        }
        try {
            e = b.toString();
        } catch (f) {
            e = "0";
        }
        try {
            c += d.split(".")[1].length;
        } catch (f) {}
        try {
            c += e.split(".")[1].length;
        } catch (f) {}
        return (
            (Number(d.replace(".", "")) * Number(e.replace(".", ""))) / Math.pow(10, c)
        );
    },

    sub (a, b) {
        var c, d, e;
        try {
            c = a.toString().split(".")[1].length;
        } catch (f) {
            c = 0;
        }
        try {
            d = b.toString().split(".")[1].length;
        } catch (f) {
            d = 0;
        }
        e = Math.pow(10, Math.max(c, d));
        return (this.mul(a, e) - this.mul(b, e)) / e;
    },

    div (a, b) {
        var c, d;
        var e = 0;
        var f = 0;
        try {
            e = a.toString().split(".")[1].length;
        } catch (g) {}
        try {
            f = b.toString().split(".")[1].length;
        } catch (g) {}
        c = Number(a.toString().replace(".", ""));
        d = Number(b.toString().replace(".", ""));
        return this.mul(c / d, Math.pow(10, f - e));
    },

    /**
     * 校验输入浮点数整数位与小数位是否在规定范围内
     * @param  {[type]} num         [description]
     * @param  {[type]} intLength   [description]
     * @param  {[type]} floatLength [description]
     * @return {[type]}             [description]
     */
    checkFloat (num, intLength, floatLength) {
        if (num) {
            var strIntLength = 0;
            var strFloatLength = 0;
            var str = num.toString();
            try {
                strIntLength = str.split(".")[0].length;
                strFloatLength = str.split(".")[1].length;
            } catch (e) {}
            if (strIntLength > intLength || strFloatLength > floatLength) {
                return false;
            }
        }

        return true;
    },

    /**
     * 校验输入数字是否是整数
     * @param  {[type]} strValue    [description]
     * @return {[type]}             [description]
     */
    isInteger (strValue) {
        if (strValue) {
            let reg = /\d+/g;
            if (strValue == reg.exec(strValue)) {
                return true;
            }
        }
        return false;
    },
    /**
     * 校验a>b
     * @param  {[type]} a    [description]
     * @param  {[type]} b    [description]
     * @return {[type]}      [true：大于，false：小于等于]
     */
    greaterThan (a, b) {
        if (isNaN(a) || a === "" || a == null) {
            a = 0;
        }
        if (isNaN(b) || b === "" || b == null) {
            b = 0;
        }
        return a > b;
    },

    /**
     * 校验a<b
     * @param  {[type]} a    [description]
     * @param  {[type]} b    [description]
     * @return {[type]}      [true：小于，false：大于等于]
     */
    lessThan (a, b) {
        if (isNaN(a) || a === "" || a == null) {
            a = 0;
        }
        if (isNaN(b) || b === "" || b == null) {
            b = 0;
        }
        return a < b;
    },
};

export default NumberUtil;
