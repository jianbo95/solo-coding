<template>
    <div>
        <cc-input-map v-model="currentValue" 
            @input="input" 
            :size="size"
            :show-mode="showMode"
            :fields="fields"
            :request-mode="requestMode"
            :enable-type="enableType"
            >
        </cc-input-map>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            size: StyleConfig.buttonSize,
            currentValue: {}
        }
    },
    props: {
        value: {
            default: "{}",
            type: String
        },
        showMode: {
            type: Boolean,
            default: true
        },
        fields: {
            type: Array,
            default: []
        },
        requestMode: {
            type: String,
            default: 'form'
        },
        enableType: {
            type: String,
            default: 'json,form'
        }
    },
    created() {
        this.currentValue = JSON.parse(this.value);
    },
    methods: {
        input(inputValue) {
            var json = JSON.stringify(inputValue);
            // console.log('input-json.vue input', json);
            this.$emit('input', json);
        }
    },
    watch: {
        value() {
            var currentJson = JSON.stringify(this.currentValue);
            if(currentJson != this.value) {
                // console.log('input-json.vue this.currentJson = ' + currentJson);
                // console.log('input-json.vue this.value = ', this.value);
                var obj = JSON.parse(this.value);
                // console.log('input-json.vue obj = ', obj);
                this.currentValue = obj;
            }
        }
    }
}
</script>