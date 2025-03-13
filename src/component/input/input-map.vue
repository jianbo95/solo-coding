<template>
    <div style="background:#eee;">
        <!-- <cc-query :span="24">
            <cc-query-input label-width="100px" :span="14" name="编辑模式" @input="changeMode" v-model="currentRequestMode" :map="fieldMap.requestMode"></cc-query-input>
        </cc-query> -->
            
        <div style="padding:10px; position:relative;">

            <div v-if="currentShowMode">
                <div style="position: absolute; width:200px; right: 10px;">
                    <cc-select-single 
                        v-model="currentRequestMode" 
                        @input="changeMode" 
                        :map="requestModeMap" size="mini" >
                    </cc-select-single>
                </div>
                <div style="clear:both;"></div>
            </div>

            <div style="margint-top:20px;">&nbsp;{{currentRequestMode}}</div>

            <!-- param:参数枚举 -->
            <div v-if="currentRequestMode == 'form'">
                <cc-input-multi v-model="form" @input="inputForm" :param="fields">
                </cc-input-multi>
            </div>

            <!-- param:json格式 -->
            <div style="margin-top:15px;" v-if="currentRequestMode == 'json'">
                <el-input type="textarea" autosize v-model="json">
                </el-input>
            </div>

            <!-- param:postman格式 -->
            <div style="margin-top:15px;" v-if="currentRequestMode == 'postman'">
                <el-input type="textarea" autosize v-model="postman">
                </el-input>
            </div>

        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        let convert = {
            map2json(map) {
                return JSON.stringify(map, null, 2);
            },
            map2form(map) {
                let form = [];
                for(let key in map) {
                    let value = map[key];
                    if(Util.isBaseType(value)) {
                        form.push({
                            key: key,
                            value: value
                        })
                    } else {
                        form.push({
                            key: key,
                            value: JSON.stringify(value)
                        })
                    }
                }
                form.push({
                    key: '',
                    value: ''
                });
                return form;
            },
            map2postman(map) {
                let postman = '';
                for(let key in map) {
                    let value = map[key];
                    let str;
                    if(Util.isBaseType(value)) {
                        str = value;
                    } else {
                        str = JSON.stringify(value);
                    }
                    let line = key + ':' + str;
                    postman = postman + line + '\n';
                }
                return postman;
            },
            json2map(json) {
                return JSON.parse(json);
            },
            form2map(form) {
                return Util.pairToMap(form);
            },
            postman2map(postman) {
                let lines = postman.split('\n');
                let map = {};
                for(let i in lines) {
                    let line = lines[i];
                    if(line.trim() == '') {
                        continue;
                    }
                    let pos = line.indexOf(':');
                    let key = line.substring(0, pos);
                    let value = line.substring(pos + 1, line.length);
                    map[key] = value;
                }
                return map;
            }
        };
        return {     
            fieldMap : {
                requestMode: {
                    'form' : '表单模式',
                    'json' : 'JSON模式',
                    'postman' : '多行编辑'
                }
            },  
            currentRequestMode: null,
            
            form: [],
            json: '{\n}',
            postman: '',
            middle: {}, // 中间类型

            convert: convert
        }
    },
    computed: {
        requestModeMap() {
            var map = this.fieldMap.requestMode;
            var fieldMap = {};
            var types = this.enableType.split(',');
            console.log('types',types);
            for(var i in types) {
                var type = types[i];
                fieldMap[type] = map[type];
            }
            return fieldMap;
        },
        currentShowMode() {
            var types = this.enableType.split(',');
            if(types.length > 1 && this.showMode) {
                return true;
            }
            return false;
        }
    },
    props: {
        fields: {
            type: Array
        },
        showMode: {
            type: Boolean,
            default: true
        },
        /**
         * 不支持字符串格式
         */
        value: {
            type: Object,
            default: {}
        },
        mode: {
            type: String,
            default: 'json'
        },
        enableType: {
            type: String,
            default: 'json,form'
        }
    },
    created() {
        this.currentRequestMode = this.mode;
        if(this.value != null) {
            if(Util.isString(this.value)) {
                console.error('value必须为对象');
                return;
            }
            this.loadValue(this.value, {});
        }
    },
    watch: {
        value(value, oldValue) {
            this.loadValue(value, oldValue);
        },
        // 模式转换
        currentRequestMode(value, oldValue) {
            if(oldValue == null) {
                return;
            }
            let convert = this.convert;
            console.log(oldValue + ' format convert to ' + value);
            let middle;


            if(oldValue == 'form') {
                middle = convert.form2map(this.form);
                console.log('from form', middle);

            } else if(oldValue == 'json') {
                console.log('from json this.json', this.json);
                middle = convert.json2map(this.json);
                console.log('from json', middle);

            } else if(oldValue == 'postman') {
                middle = convert.postman2map(this.postman);
                console.log('from postman', middle);
            }

            // console.log('middle', middle);

            if(value == 'json') {
                // map 转 json
                this.json = convert.map2json(middle);
                console.log('to json', this.json);

            } else if(value == 'form') {
                // map 转 form
                this.form = convert.map2form(middle);
                console.log('to form', this.form);

            } else if(value == 'postman') {
                // map 转 postman
                this.postman = convert.map2postman(middle);
                console.log('to postman', this.postman);
            }
        },
        
        json(value) {
            try {
                let input = this.convert.json2map(value);
                this.emitInput(input);
            } catch (e) {

            }
        },
        postman(value) {
            // console.log('postman change', value);
            let input = this.convert.postman2map(value);
            // console.log('postman2map', input);
            this.emitInput(input);
        }
    },
    methods: {
        inputForm(value){
            // console.log('form change value', value);
            let input = this.convert.form2map(value);
            // console.log('form change form2map', input);
            this.emitInput(input);
        },
        loadValue(value, oldValue) {
            var mode = this.currentRequestMode;

            let valueStr = JSON.stringify(value);
            let oldValueStr = JSON.stringify(oldValue);
            if(valueStr == oldValueStr) {
                return;
            }
            // console.log('加载value', value);

            var middle = this.value;
            var convert = this.convert;
            if(mode == 'json') {
                // map 转 json
                this.json = convert.map2json(middle);
                // console.log('to json', this.json);

            } else if(mode == 'form') {
                // map 转 form
                this.form = convert.map2form(middle);
                // console.log('to form', this.form);

            } else if(mode == 'postman') {
                // map 转 postman
                this.postman = convert.map2postman(middle);
                // console.log('to postman', this.postman);
            }
        },
        emitInput(input) {
            this.$emit("input", input);
            // console.log('emit input', input);
        },
        changeMode() {
            // console.log('changeMode', this.currentRequestMode);
            this.$emit('update:mode', this.currentRequestMode);
        }
    }
}
</script>