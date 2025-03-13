
export default {

    getUser: function () {
        if(window.UserType == 'auction') {
            return Core.getObj('auctionUser');
        }
		return Core.getObj('user');
    },
    getToken: function() {
        var user = this.getUser();
		if(user == null) {
			return null;
		}
        return user.token;
    },
    getItem : function (name) {
        let _value = sessionStorage.getItem(name);
        if (_value && _value !== 'undefined') {
          return _value;
        }
    },
    getCookie : function (name) {
        var reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
        var arr = document.cookie.match(reg);
        if (arr) {
            return unescape(arr[2]);
        } else {
            return null;
        }
    },
    setUser : function (_user) {
        console.log('login', _user);
        if(window.UserType == 'auction') {
            Core.put('auctionUser', _user);
        } else {
            Core.put('user', _user);
        }
    },
    setCookie : function (name, value, hour) {
        var exp = new Date()
        exp.setTime(exp.getTime() + hour * 60 * 60 * 1000)
        document.cookie = name + '=' + escape(value) + ';expires=' + exp.toGMTString()  + ";" + "path=/"
    }
};