/**
 * 全局风格配置
 */
let config = {

    debug: false, // 默认打开调试模式
    forceCloseDebug: false, // 强制关闭调试模式
    componentDebug: {
        'tag-group': false,
        'page-init': false
    },

    /**
     * 主题风格配置
     * light: 浅色
     * deep: 深色
     */
    mainStyle: 'deep', // light/deep

    /**
     * 消息警告样式
     * message: 消息提示样式
     * dialog: 提示样式
     */
    messageType: 'dialog', // message/dialog

    /**
     * 弹框样式
     * big: 大弹框 width: 620px;
     * small: 小弹框 witch: 310px;
     */
    messageBoxClass: 'big', // big/small

    /**
     * 按钮大小
     */
    buttonSize: 'mini', // mini/small/middle/big
	
	/**
	 * 页面内间距
	 */
    pagePadding: '15px 25px 25px 25px',
    
    /**
     * 菜单模式
     * auto: 自动
     * big: 保持最宽
     * small: 保持最窄
     */
    menuMode: 'big',

    /**
     * 表格模式
     * auto: 自适应
     * fix: 固定
     */
    tableMode: 'fix',

    /**
     * 获取主题样式
     */
    theme() {
        let theme;
        if(this.mainStyle == 'light') {
            theme = 'ds';
        } else {
            theme = 'ss';
        }
        return theme;
    }
}

if(config.mainStyle == 'default') {
    config.buttonSize = 'mini';
}

export default config;