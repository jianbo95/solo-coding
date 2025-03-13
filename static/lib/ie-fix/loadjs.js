(function() {

    // Util.showDemo();

    function isIE() {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
        //判断是否IE<11浏览器  
        var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; 
        //判断是否IE的Edge浏览器  
        // var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; 
        var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
        if(isIE || isIE11) {
            return true;
        } else {
            return false;
        }
    };

    var loadJS = function( url, callback ){

        var script = document.createElement('script'),

        fn = callback || function(){};

        script.type = 'text/javascript';

        //IE

        if(script.readyState){

            script.onreadystatechange = function(){

                if( script.readyState == 'loaded' || script.readyState == 'complete' ){

                    script.onreadystatechange = null;

                    fn();

                }

            };

        }else{

            //其他浏览器

            script.onload = function(){

                fn();

            };

        }

        script.src = url;

        document.getElementsByTagName('head')[0].appendChild(script);


    };

    var loadCSS = function( url, callback ){

        var script = document.createElement('link'),

        fn = callback || function(){};

        script.rel = "stylesheet"

        //IE

        if(script.readyState){

            script.onreadystatechange = function(){

                if( script.readyState == 'loaded' || script.readyState == 'complete' ){

                    script.onreadystatechange = null;

                    fn();

                }

            };

        }else{

            //其他浏览器

            script.onload = function(){

                fn();

            };

        }

        script.href = url;

        document.getElementsByTagName('head')[0].appendChild(script);


    };

    if(isIE()) {
        // console.log('IE浏览器加载 polyfill');
        if(window.polyfill != null) {
            loadJS(window.polyfill, function(){});
        } else {
            loadJS("./static/lib/ie-fix/polyfill.min.js",function(){});
        }
    }

    // 并发优化，支持多次相同请求合并为单次请求
    if(window.ConcurrentLoad != null) {
        window.loadJS = ConcurrentLoad.load(loadJS);
        window.loadCSS = ConcurrentLoad.load(loadCSS);
    } else {
        window.loadJS = loadJS;
        window.loadCSS = loadCSS;
    }

}());