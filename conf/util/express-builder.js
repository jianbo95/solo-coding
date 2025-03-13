const express = require('express');

module.exports = () => {
    var app = {
        configs: [],
        httpServer: null,
        use(var1, var2) {
            var path;
            var proxy;
            if(var2 == null) {
                proxy = var1;
            } else {
                path = var1;
                proxy = var2;
            }
            var config = {
                path: path,
                proxy: proxy
            };
            this.configs.push(config);
        },
        delete(path) {
            var configs = [];
            for (let i = 0; i < this.configs.length; i++) {
                const config = this.configs[i];
                if(config.path != path) {
                    configs.push(config);
                }
            }
            this.configs = configs;
        },
        close(call) {
            this.httpServer.close(call);
        },
        listen(port, call) {
            if(port != null) {
                this.port = port;
            } else {
                port = this.port;
            }
            var server = express();
            for (let i = 0; i < this.configs.length; i++) {
                const config = this.configs[i];
                if(config.path == null) {
                    server.use(config.proxy);
                } else {
                    server.use(config.path, config.proxy);
                }
            }
            this.httpServer = server.listen(port, () => {
                console.log('App listening on ' + port + ' !')
            });
        }
    }
    return app;
    
};