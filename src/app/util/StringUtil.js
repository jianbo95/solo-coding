export default {
	upFirst(str) {
		var newStr = str.slice(0,1).toUpperCase() + str.slice(1);
		return newStr;
	},
    notNull (str) {
        if(str == null) {
            return "";
        }
        return str;
    },
    // 替代全部
    replaceAll (data, str, target) {
        var exp = new RegExp(str, "gm")
        data = data.replace(exp, target);
        return data;
    },
    matchSize: function(s, target){
        //   var exp = eval("/"+ target +"/ig")
        var exp = new RegExp(target, "ig")
        return s.match(exp).length;
    },
    containerSize: function(str, target) {
        return str.split(target).length - 1;
    },
    //字符串的首字母大写
	toUpperCaseFirstChar: function (s) {
	    return s.substring(0, 1).toUpperCase() + s.substring(1, s.length);
	},
    toLowerCaseFirstChar: function (s) {
	    return s.substring(0, 1).toLowerCase() + s.substring(1, s.length);
	},
    /**
	 * 命名转换：下划线命名法转骆驼命名法
	 * UnderScoreCase2CamelCase
	 */
	U2CamelCase: function (naming) {
		var words = naming.split('_');
		var wordStr = "";
		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			// 所有字母小写
			word = word.toLowerCase();
			// 首字母大写
			word = this.toUpperCaseFirstChar(word);
			if (i == 0) {
				// 第一个字母小写
				word = this.toLowerCaseFirstChar(word);
			}
			wordStr += word;
		}
		return wordStr;
	}
}