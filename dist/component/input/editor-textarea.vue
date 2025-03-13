<template>
    <div :style="style">
        <iframe :src="src" frameborder="0" style="height:100%;width:100%;"></iframe>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
            id: null,
            src: null
        }
    },
    computed: {
        style() {
            var style = '';
            if(this.width != null) {
                style += 'width:calc(' + this.width + ' + 10px);';
            }
            if(this.height != null) {
                style += 'height:calc(' + this.height + ' + 10px)';
            }
            return style;
        }
    },
    props: {
        width: {
            type: String
        },
        height: {
            type: String
        },
        value: {
            default: '',
            type: String
        }
    },
    created() {
        var id = Math.random();
        this.id = id;
        var src = "./textarea.html?id=" + id ;
        if(this.width != null) {
            src += '&width=' + this.width;
        }
        if(this.height != null) {
            src += '&height=' + this.height;
        }
        this.src = src;

        GlobalEvent.addEventListener(id, (data) => {
            // 根据id监听事件
            this.input(data);
        });

        // 监听初始化
        GlobalEvent.addEventListener('load' + id, (data) => {
            // 通知 iframe
            var iframe = GlobalIframe.get(this.id);
            iframe.setText(this.value);
        });


    },
    methods: {    
        input: function(inputValue) {
            // 实现双向绑定
            // console.log('input event', inputValue);
            this.$emit('input', inputValue);
        },
    },
    watch: {
        value() {
            // 通知 iframe
            var iframe = GlobalIframe.get(this.id);
            iframe.setText(this.value);
        }
    }
}
</script>