const styleLoader = {
    "css": [
        "vue-style-loader",
        "css-loader",
        "postcss-loader"
    ],
    "postcss": [
        "vue-style-loader",
        "css-loader",
        "postcss-loader"
        
    ],
    "less": [
        "vue-style-loader",
        "css-loader",
        "postcss-loader",
        "less-loader"
    ],
    "sass": [
        "vue-style-loader",
        "css-loader",
        "postcss-loader",
        "sass-loader"
    ],
    "scss": [
        "vue-style-loader",
        "css-loader",
        "postcss-loader",
        "sass-loader"
    ],
    "stylus": [
        "vue-style-loader",
        "css-loader",
        "postcss-loader",
        "stylus-loader"
    ],
    "styl": [
        "vue-style-loader",
        "css-loader",
        "postcss-loader",
        "stylus-loader"
    ]
}

module.exports = {
    loaders: styleLoader,
    cssSourceMap: false,
    cacheBusting: true,
    // transformToRequire: {
    //     video: ['src', 'poster'],
    //     source: 'src',
    //     img: 'src',
    //     image: 'xlink:href'
    // },
    hotReload: false
}
