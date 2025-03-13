<template>
<cc-page :loading="loading" :init="init">
    <div class='test-page'>
        这是测试页面
        <el-input size="small" v-model="test" placeholder="输入框"></el-input>

        <el-button type="primary" @click="loadingTest()">$loading测试</el-button>

        <el-button type="primary" @click="loadingTest2()">UI.loading测试</el-button>

        <el-button type="primary" @click="loadingPage()">page.loading测试</el-button>
        
        <el-button type="primary" @click="messageTest()">UI.message测试</el-button>

        <el-button type="primary" @click="loadingCloseTest()">UI.loading关闭测试</el-button>

        <el-button type="primary" @click="pressTest()">接口压力测试</el-button>

        <el-button type="primary" @click="imgPressTest()">图片压力测试</el-button>

        <el-button type="primary" @click="numberChinese()">数字大写</el-button>

        <el-button type="primary" @click="aesRequest()">Aes请求</el-button>

		<cc-comcode-dialog v-model="form" ref="comcodeDialog"></cc-comcode-dialog>

        <div style="margin-top:1rem;">
            <span>aes加密数据</span>
            {{Crypto.encrypt('hello')}}
        </div>

        <show-pic v-if="showPic"></show-pic>

        <test-input v-model="testInputValue"></test-input>
        
        <el-input v-model="testInputValue"></el-input>

		<!-- <div style="width:500px;">
			<p>
				{{showAuthUrl()}}
			</p>
		</div> -->

    </div>
</cc-page>
</template>

<script>

import Core from '../../app/util/Core.js'
import SessionUtil from '../../app/util/SessionUtil.js'
import NumberUtil from '../../app/util/NumberUtil.js' // 引入失败
import Crypto from '../../app/util/crypto.js'
import testInput from './testInput.vue';

export default {
    components: {
        'test-input': testInput
    },
    data() {
        return { 
            form: {},
            testInputValue: '',
            loading: true,
            init: false,
            showPic: false,
            Crypto: Crypto,
            src: null,
            initSrc: false,
            test: 100  
        }
    },
	computed: {
		authUrl() {
			let authUrl = this.$store.getters.authUrl;
			console.log('authUrl', authUrl);
			return authUrl['sysRole/delete'];
		}
	},
    created() {
        console.log('测试页面构建', this.Crypto, window.NumberUtil);
        this.src = 'test';
        this.initSrc = true;
        // this.img();
        this.loading = false;
        this.init = true;
    },
    methods: {
        numberChinese() {
            alert(NumberUtil.toChinesNum(this.test));
        },
		showAuthUrl() {
			return this.authUrl;
		},
        img() {
            var url = Constants.root + 'workOrderPic/printImg?picId=0b8bee77b9df4015a02882cad78b24e8';
            Core.getImage(url, (result) => {
                alert('获取图片成功');
                this.src = result;
            });
            
        },
        loadingTest() {
            this.$loading();
        },
        messageTest() {
            UI.message('test');
        },
        loadingTest2() {
            UI.openLoading();
            setTimeout(() => {
                UI.closeLoading();
            }, 1000);
        },
        loadingPage() {
            this.loading = true;
            setTimeout(() => {
                this.loading = false;
            }, 1000);
        },
        loadingCloseTest() {
            UI.closeLoading();
        },
        
        pressTest() {
            let url = Constants.root + '/workHelper/datagrid';
            var param = {
                page: 1, rows: 10, searchType: 1
            };
            for(var i = 0; i < this.test; i++) {
                Core.post(url, param, (result) => {
                    console.log('result', result);
                });
            }
        },
        imgPressTest() {
            var url = Constants.root + '/workOrderPic/printImg?picId=e23503cc0efa4070bb5eae8a2fa52810';

            url = Constants.root + '/workOrderPic/printImg?picId=3ff33cfb70034de09ed4fc38e9adf3f0';

            url = Constants.root + '/workOrderPic/printImg?picId=026dd2b348214e73aae9691b86f7bbcf';

            // url = 'http://10.13.1.235:9212/v2.0/workOrderPic/printImg?picId=026dd2b348214e73aae9691b86f7bbcf';
            
            for(var i = 0; i < this.test; i++) {
                $.get(url, () => {
                    console.log('img');
                });
            }
        },

        aesRequest() {
            let map = {
                "createTime":1615775697000,"imei":"11111","mobile":"13811889989","name":"克隆人","password":"123456","timestamp":"1661826128121","type":0
            };
            Core.postEncrypt('encrypt/aes', map, (result) => {
                UI.debug(result);
            });
        }
    },
}
</script>

<style lang="less">
    .test-page {
        button {    
            margin-top: 10px;
        }
    }
</style>