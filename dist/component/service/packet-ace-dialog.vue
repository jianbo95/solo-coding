<template>
    <cc-dialog ref="packetDialog" show-close :title="title" :width="width">
		<div style="padding:10px;" v-if="init">
            <template v-for="(item, i) in packetData">
                <div :key="i">
                    <div>
			        {{item.name}} {{item.type}}
                    </div>
                    <!-- editor 高度 -->
                    <div :style="aceStyle(item)">
                        <cc-input-ace :value="item.data" :mode="item.type" :use-wrap="true"></cc-input-ace>
                    </div>
                </div>
            </template>
			<!-- <el-input type="textarea" v-model="packetData" :autosize="{maxRows: maxRows}" readonly></el-input>
            -->

		</div>
		<template v-slot:footer-left>
			<div>
				<el-button size="mini" type="success" @click="onFormat">格式化</el-button>
                <!-- <el-button size="mini" type="success" @click="onDecode">解码</el-button> -->
                <el-button size="mini" type="warning" @click="onNotFormat">还原</el-button>

                <el-button size="mini" type="warning" @click="logData">日志</el-button>
			</div>
		</template>
	</cc-dialog>
</template>

<script>
export default {
    data: function() {
        return {
            packetData: '',
            init: false,
            currentRow: {}
        }
    },
    props: {
        maxRows: {
            default: 15,
            type: Number
        },
        width: {
            default: '600px',
            type: String
        },
        title: {
            default: '报文查看',
            type: String
        },
        requestType: {
            type: String
        },
        responseType: {
            type: String
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
        customData: {
            default: function() {
                return [];
            },
            type: Array
        },
        customDataPos: {
            default: 'after', // before 在前 / after 在后
            type: String 
        }
    },
    methods: {
        open: function(item) {
            this.init = false;
            if(item == null) {
                UI.warning("请选择一条记录");
            }
            this.currentRow = item;
            this.buildAllData(false);
            this.$refs.packetDialog.open();
            this.init = true;
        },
        buildData: function(str, isFormat, isDecode) {
            if(str == null) {
                return '';
            }
            var trueFormat = 'text';
            if(isFormat) {
                var format = Util.guessTextFormat(str);
                // console.log('guess format',format)
                if(format == 'json') {
                    var strJson = Util.formatJson2(str);
                    if(strJson != null) {
                        trueFormat = 'json';
                        str = strJson;
                    }
                } else if(format == 'xml') {
                    var strXml = Util.formatXml(str);
                    if(strXml != null) {
                        trueFormat = 'xml';
                        str = strXml;
                    }
                }
            }

            if(isDecode) {
                str = decodeURIComponent(str);
            }
            return {
                format: trueFormat,
                data: str
            };
        },
        buildAllData: function(isFormat, isDecode) {
            var cdata = this.buildCustomData(isFormat, isDecode);
            var pdata = this.buildPacketData(isFormat, isDecode);
            // this.packetData = cdata + pdata;
            let mergedArray = cdata.concat(pdata);
            // console.log('buildAllData', mergedArray);
            this.packetData = mergedArray;
        },
        buildCustomData: function(isFormat, isDecode) {
            var row = this.currentRow ;
            var result = [];
            for(var i = 0; i < this.customData.length; i++) {
                var data = this.customData[i];
                var field = data.field;
                var name = data.name;
                var result = this.buildData(row[field], isFormat, isDecode);
                output = result.output;

                var type = 'text';
                if(data.type != null) {
                    type = data.type;
                }
                if(type == 'text') {
                    if(result.format != null) {
                        type = result.format;
                    }
                }
                
                // result += (name + '\n' + output + '\n\n');
                result.push({
                    name: name, 
                    data: output,
                    type: type
                });
            }
            return result;
        },
        buildPacketData: function(isFormat, isDecode) {
            isFormat = isFormat || true;
            isDecode = isDecode || false;
            var row = this.currentRow ;

            if(this.requestField == null) {
                UI.warning("requestField 不能为空");
                return this.packetData;
            }

            var result = this.buildData(row[this.requestField], isFormat, isDecode);
            // console.log('buildData', result);
            var request = result.data;
            
            // 格式化校验
            if(isFormat) {
                if(request == null && response == null) {
                    UI.warning("格式化失败，报文不是常规的json或xml");
                    return this.packetData; 
                }
            }

            var packet = [];
            var requestPacket = {
                name: this.requestTitle,
                data: request,
                type: this.requestType
            };
            
            if(this.requestType == null) {
                if(result.format != null) {
                    requestPacket.type = result.format;
                } else {
                    requestPacket.type = 'text';
                }
            }
            packet.push(requestPacket);

            if(this.responseField != null) {
                var responseResult = this.buildData(row[this.responseField], isFormat, isDecode);
                // console.log('buildData', responseResult);
                var response = responseResult.data;
                var responsePacket = {
                    name: this.responseTitle,
                    data: response,
                    type: this.responseType
                };
                packet.push(responsePacket);

                if(this.responseType == null) {
                    if(responseResult.format != null) {
                        responsePacket.type = responseResult.format;
                    } else {
                        responsePacket.type = 'text';
                    }
                }
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
        aceStyle(item) {
            if(item.data.length < 5000) {
                // console.log('item', item);
                var strs = item.data.split('\n');
                var height = strs.length * 18;
                return 'height:'+height+'px; width:100%;';
            }
            return 'height:500px; width:100%;';
        },
        logData() {
            // console.log('this.packetData', this.packetData);
            for(var i in this.packetData) {
                var item = this.packetData[i];
                var data = item.data;
                var obj = JSON.parse(data);
                console.log(item.name, obj);
            }
        }
    },
}
</script>