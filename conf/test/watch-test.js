var watcher = require('../util/watch-proxy');

watcher.watch((config) => {
    console.log('配置改变', config);
});