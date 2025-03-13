<template>
    <div>
		<div style="padding:10px;">
            <textarea spellcheck="false" v-model="packetData" @input="onPacketInput" :style="style.textarea + ';width:calc(100% - 10px); outline: none; padding: 5px; border:1px #eee solid;'"></textarea>
		</div>
        <div style="padding: 10px;">
            <el-button size="mini" type="success" @click="onFormat">格式化</el-button>
            <!-- <el-button size="mini" type="success" @click="onDecode">解码</el-button> -->
            <el-button size="mini" type="warning" @click="onNotFormat">还原</el-button>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            packetData: '',
            currentRow: {}
        }
    },
    props: {
        value: {
            type: String
        },
        width: {
            default: '700px',
            type: String
        },
        height: {
            default: '70%',
            type: String
        },
        format: {
            default: true,
            type: Boolean
        },
        
        requestTitle: {
            default: '请求报文',
            type: String
        },
        responseTitle: {
            default: '响应报文',
            type: String
        },
        requestField: String,
        responseField: String,
        onlyCustom: {
            type: Boolean,
            default: false
        },
        /**
         * 自定义数据
         */
        customData: {
            default() {
                return [];
            },
            /**
             * 数据格式：[
             *     {
             *          name: '用户名',
             *          field: 'username'
             *     }
             * ]
             */
            type: Array
        },
        /**
         * 定义自定义数据位置
         */
        customDataPos: {
            default: 'after', // before 在前 / after 在后
            type: String 
        }
    },
    computed: {
        style() {
            var result = {
                textarea: 'height:' + Core.calcMaxHeight(this.height, 150)
            }
            return result;
        }
    },
    created() {
        this.currentRow = {
            requestPacket: this.value
        };
        this.buildAllData(this.format);
    },
    methods: {
        // open: function(item) {
        //     if(item == null) {
        //         UI.warning("请选择一条记录");
        //     }
        //     this.currentRow = item;
        //     this.buildAllData(this.format);
        // },
        buildData: function(str, isFormat, isDecode) {
            if(str == null) {
                return '';
            }
            if(isFormat) {
                str = Util.formatXmlOrJson(str);
            }
            if(isDecode) {
                str = decodeURIComponent(str);
            }
            return str;
        },
        buildAllData: function(isFormat, isDecode) {
            var cdata = this.buildCustomData(isFormat, isDecode);
            if(this.onlyCustom) {
                this.packetData = cdata;
                return;
            }
            var pdata = this.buildPacketData(isFormat, isDecode);
            // this.packetData = cdata + pdata;
            this.packetData = pdata + '\n' + cdata;
        },
        buildCustomData: function(isFormat, isDecode) {
            var row = this.currentRow ;
            var result = '';
            for(var i = 0; i < this.customData.length; i++) {
                var data = this.customData[i];
                var field = data.field;
                var name = data.name;
                var output = this.buildData(row[field], isFormat, isDecode);
                result += (name + '\n' + output + '\n\n');
            }
            return result + '\n';
        },
        buildPacketData: function(isFormat, isDecode) {
            isFormat = isFormat || false;
            isDecode = isDecode || false;
            var row = this.currentRow ;

            var request;
            var response;
            if(this.requestField != null) {
                request = this.buildData(row[this.requestField], isFormat, isDecode);
                response = this.buildData(row[this.responseField], isFormat, isDecode);
            } else {
                request = this.buildData(row.requestPacket, isFormat, isDecode);
                response = this.buildData(row.responsePacket, isFormat, isDecode);
            }
            
            // 格式化校验
            if(isFormat) {
                if(request == null && response == null) {
                    UI.warning("格式化失败，报文不是常规的json或xml");
                    return this.packetData; 
                }
            }
            
            if(this.value != null) {
                return request;
            }

            var packet = this.requestTitle + "：\n" +  request + '\n'
                ;

            if(this.responseTitle != '') {
                packet = packet + "\n" + this.responseTitle + "：\n" + response + '\n';
            }

            return packet;
        },
        onDecode: function() {
            this.packetData = this.buildPacketData(false, true);
        },
        onFormat: function() {
            // var row = this.currentRow ;
            this.buildAllData(true);
        },
        onNotFormat: function() {
            this.buildAllData(false);
        },
        onPacketInput: function() {
            this.$emit('input', this.packetData);
        }
    },
}
</script>