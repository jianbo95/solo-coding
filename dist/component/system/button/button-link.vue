<template>
    <div class="cc-button-div">
        <a target="_blank" :class="classInfo" :href="href" class="cc-button pure-button" @click="_click"><slot></slot></a>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
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
    props: {
        full: '', // 传递的参数会覆盖此值
        green: '',
        red: '',
        orange: '',
        blue: '',
        xsmall: '',
        small: '',
        large: '',
        xlarge: '',
        href: ''
    },
    methods: {    
        _click: function() {
            console.log(this.full);
            this.$emit('click', function() { 
                alert('inner');
            });
        }
    } 
}
</script>

