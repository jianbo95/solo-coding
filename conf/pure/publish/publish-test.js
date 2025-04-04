var PublishFast = require('./publish-fast.js');

PublishFast.run({
    cleanCache: false,
    mergeJs: true,
    minifyJs: false,
    compileJs: true,
});