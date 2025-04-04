var PublishFast = require('./publish-fast.js');

PublishFast.run({
    cleanCache: true,
    mergeJs: true,
    minifyJs: true,
    compileJs: true,
});