import TemplateEditor from './TemplateEditor.js';

var CommonUtil = {};

	CommonUtil.rand = function(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    };

	CommonUtil.uid = function() {
		let date = new Date();
		let rand = this.rand(10000, 99999) + '';
		let time = date.getTime() + '';
		return time + rand;
	};
    
export default  {
    
    // 当包含 <template edit> 代码时有效
    wrap(code, url, name) {
        if(code.indexOf('<template edit>') == -1) {
            // TODO cc-input 强制 edit
            // if(name != 'cc-input') {
            //     return code;
            // }
            return code;
        }
        
        code = this.componentWrapV2(code, url);
        
        // if(url == './module/dev/component/cmpt-test.vue') {
        //     console.log('code', '\n'+ code);
        // }

        // 通过jquery增加ID
        code = this.addId(code, url); // 增加id会有问题？
        
        let start = '<template edit>';
        let content = code.substring(start.length);

        return '<template>' + content;
    },
    // 增加id
    addId(code, url) {
        let pos = code.lastIndexOf('</template>');
        let start = '<template edit>';
        let left = code.substring(start.length, pos);
        let right = code.substring(pos, code.length);
        // console.log('addId', left);
        // console.log('addId', right);
        let uid = CommonUtil.uid();
        $('#codeWrap').append('<div id="'+uid+'">'+left+'</div>');

        // 找到所有元素
        let root = $('#codeWrap #' + uid);
        let all = root.find("*");
        // console.log(all.length);
        for (let i = 0; i < all.length; i++) {
            const element = all[i];
            // console.log(element);
            let id = $(element).attr('id');
            // console.log('id', id);
            if(id == null) {
                // 生成id
                let eid = CommonUtil.uid();
                $(element).attr('id', 'D' + eid);
            }
        }
        // console.log('root', root.html());
        left = root.html();
        root.remove();

        return start + left + right;
    },
    // 组件替换
    componentWrapV2(code, url) {
        let editor = TemplateEditor(code, url);
        editor.wrapTemplate();
        code = editor.dump();
        return code;
    },
    // 组件替换
    componentWrap(code, url) {
        // console.log('allow edit', url);

        let changeEndCode = (code) => {

            let pos = code.lastIndexOf('</template>');
            let left = code.substring(0, pos);
            let right = code.substring(pos, code.length);

            left = left.substring(0, left.lastIndexOf('</div>') - '</div>'.length) 
                + '\n    </cc-edit>\n';
            left = left.replace('<div', '<cc-edit');

            // console.log('left', left);
            // console.log('right', right);
            return left + right;
        };

        code = changeEndCode(code);

        let changeDivCode = (code) => {
            var reg = new RegExp('div', "gm");
            code = code.replace(reg, 'div-edit'); 
            return code;
        };

        // code = changeDivCode(code);
        
        return code;
    }

};