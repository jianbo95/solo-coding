const WebpackIconfontPluginNodejs  = require('webpack-iconfont-plugin-nodejs');
const path = require('path');

const dir = 'static/';

new WebpackIconfontPluginNodejs({
    fontName: 'iconfont',
    cssPrefix: 'cc-icon',
    svgs: path.join('src/assets/', 'svg/*.svg'),
    // template: path.join(dir, 'css.njk'),
    fontsOutput: path.join(dir, 'fonts/'),
    cssOutput: path.join(dir, 'fonts/font.css'),
    htmlOutput: path.join(dir, 'fonts/_font-preview.html'),
    // jsOutput: path.join(dir, 'fonts/fonts.js'),
    formats: ['ttf', 'woff'],
}).build();

