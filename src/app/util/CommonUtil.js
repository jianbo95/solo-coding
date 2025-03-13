var shortUrl = (url) => {
    var shortUrlByI = function(urls, i, j) {
        // console.log('shortUrlByI', i, j);
        if(j == null) {
            urls.splice(i, 1);
            return urls;
        }
        if(i > j) {
            urls.splice(i, 1);
            urls.splice(j, 1);
        } else {
            urls.splice(j, 1);
            urls.splice(i, 1);
        }
        return urls;
    };
    var shortUrl = function(urls) {
        
        for(var i = 0; i < urls.length; i++) {
            var url = urls[i];
            if(url == '..') {
                if(i > 0) {
                    if(urls[i - 1] != '..') {
                        return shortUrl( shortUrlByI(urls, i, i-1) );
                        // return shortUrlByI(urls, i, i-1);
                    }
                }
            } else if(url == '') {
                return shortUrl( shortUrlByI(urls, i) );
            } else if(url == '.') {
                return shortUrl( shortUrlByI(urls, i) );
            }
        }
        return urls;
    };
    var protocal = null;

    var step1 = url.split('://');
    if(step1.length == 2) {
        protocal = step1[0];
        url = step1[1];
    }

    // console.log('step1', step1);
    var urls = url.split('/');
    urls = shortUrl(urls);
    // console.log(urls);
    url = urls.join('/');

    if(protocal != null) {
        return protocal + '://' + url;
    } else {
        return url;
    }
};

export default {

    rand: function(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    },

    generateImageFromPixelArray(pixels, width, height) {
        if(height == null) {
          height = pixels.length / width;
        }
        // const height = width;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
       
        // 创建一个ImageData对象并填充数据
        const imageData = ctx.createImageData(width, height);
        imageData.data.set(pixels);
       
        // 将ImageData绘制到canvas上
        ctx.putImageData(imageData, 0, 0);
       
        // 将canvas转换为DataURL格式的图片
        const dataURL = canvas.toDataURL('image/png');
        return dataURL;
    },

    base64ToByteArray(base64) {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    },
    buildSrc(base64, width, height) {
        if(base64 == null) {
            return null;
        }
        var byteArray = this.base64ToByteArray(base64);

        // 生成图片
        // console.log(byteArray); // 4096 
        // 1 x,x,x,x
        // 2 ....
        // 1024 x,x,x,x
        // 32 * 32
        const imageDataURL = CommonUtil.generateImageFromPixelArray(byteArray, width, height);
        return imageDataURL;
    },

    shortUrl(url) {
        return shortUrl(url);
    },

    downloadBinaryStringAsFile(binaryString, filename) {
        // Step 1: Convert binary string to Blob
        const blob = new Blob([binaryString], { type: 'application/octet-stream' });
    
        // Step 2: Create a URL for the Blob
        const url = URL.createObjectURL(blob);
    
        // Step 3: Create a hidden <a> element
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
    
        // Step 4: Append the <a> element to the DOM and trigger the click event
        document.body.appendChild(a);
        a.click();
    
        // Step 5: Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};