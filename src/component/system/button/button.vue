<template>
    <div class="cc-button-div" :style="styleInfo">
        <button :class="classInfo" class="cc-button pure-button" @click="_click"><slot></slot></button>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            init: false,
            classInfo : {
                'full': this.full != null,
                'blue' : this.blue != null,
                'green': this.green != null,
                'red ' : this.red != null,
                'orange' : this.orange != null,
                'xsmall' : this.xsmall != null,
                'small' : this.small != null,
                'large' : this.large != null,
                'xlarge' : this.xlarge != null
            }
        }
    }, 
    created() {
        ModuleDefine.load('purecss', () => {
            this.init = true;
        });
    },
    computed: {
        styleInfo() {
            var getWidth = function(data) {
                if(data.full != null) {
                    return "100%";
                }
            };
            return {
                'width': getWidth(this.classInfo)
            }
        }
    },
    props: {
        full: '', // 传递的参数会覆盖此值
        green: '',
        red: '',
        orange: '',
        blue: '',
        xsmall: '',
        small: '',
        large: '',
        xlarge: ''
    },
    methods: {    
        _click: function() {
            this.$emit('click', function() { 
                alert('inner');
            });
        }
    } 
}
</script>

