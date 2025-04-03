<template>
    <div style="height:100%;" class="login-page" v-if="init">
        <div style="position: absolute; left:40px; top:30px;" v-if="showLogo">
            <img alt="image" class="img-circle-none"  src="../../assets/images/logo-l.png"/>
        </div>

        <div style="position: absolute; left:35%; top:15%;">
            <div style="float:left;">

                <div>
                    <h1 style="font-weight:100;">{{Conf.title}}</h1>
                </div>
                
                <h3>
                    欢迎使用 
                    <strong>{{Conf.title}}</strong>
                </h3>

                <div>
                    <el-button circle icon="el-icon-right" size="mini" ></el-button>
                </div>
            </div>

            <div style="float:left; margin:10px 0 0 20px; background:#fff; width:350px;color:#000;">
                <div style="text-align:center;">
                    <h2>{{loginTitle}}</h2>
                </div>

                <div style="text-align:center;font-size:14px;">
                    欢迎登录{{Conf.title}}
                </div>

                <div style="padding:20px;">
                 <!-- 用户登录__登陆 pwd-->
                <section v-if="loginTitle=='用户登录'">
                    <div style="margin-top:10px">
                        <el-input
                            v-model="username"
                            placeholder="请输入用户名"
                            suffix-icon="el-icon-user">
                        </el-input>
                    </div>
                    <div style="margin-top:10px">
                        <el-input
                            v-model="password"
                            type="password"
                            placeholder="请输入密码"
                            suffix-icon="el-icon-lock">
                        </el-input>
                    </div>
                    <div style="margin-top:10px">
                        <el-row>
                            <el-col :span="12">
                                <el-input style="width:100%"
                                    v-model="verify"
                                    placeholder="请输入验证码">
                                </el-input>
                            </el-col>
                            <el-col :span="12">
                                <img :src="img" @click="changeImg" style="border:1px solid #999; width:88%; float:right;cursor: pointer;">
                            </el-col>
                        </el-row>
                        
                    </div>
                    <!-- <el-row style="margin-top:10px;">
                        <el-col :span="24" style="text-align:right;" v-show="loginTitle=='拍卖商用户登录'">
                            <a href="javascript:;" style="font-size:12px;" @click="loginType='msg'">短信验证登陆</a>
                        </el-col>
                    </el-row> -->
                    <!-- <template v-if="loginTitle=='拍卖商用户登录'">
                        <el-form :model="ruleForm" ref="ruleForm" :rules="rules" label-position="left" >
                            <el-row style="margin-top:10px;">
                                <cc-query-input :pr20="false" :pl10="false" size="unset" :span="24" label-width="0px" v-model="ruleForm.mobile" prop="mobile" placeholder="请输入手机号码"></cc-query-input>
                            </el-row>
                            <el-row style="margin-top:10px;">
                                <el-col :span="12">
                                    <cc-query-input :pr20="false" :pl10="false" size="unset" :span="24" label-width="0px" v-model="ruleForm.mobileVerify" prop="mobileVerify" placeholder="请输入验证码"></cc-query-input>
                                </el-col>
                                <el-col :span="12" style="text-align:right;">
                                    <el-button @click="sendMobileCode" style="width:90%;" type="warning" plain>发送验证码</el-button>
                                </el-col>
                            </el-row>
                        </el-form>
                    </template> -->
                    <div style="margin-top:10px;">
                        <el-button @click="login()" type="primary" size="medium" style="width:100%;">登录</el-button>
                    </div>
                </section>
                <!-- 拍卖商用户登录__登陆  msg-->
                <section v-if="loginTitle=='拍卖商用户登录'">
                    <el-form :model="ruleForm" ref="ruleForm" :rules="rules" label-position="left" >
                        <el-input v-model="ruleForm.username" placeholder="请输入用户名" @input="inputUserName" suffix-icon="el-icon-user" >
                        </el-input>
                         <el-input style="margin-top:10px;" v-model="ruleForm.password" type="password" placeholder="请输入密码" @input="inputPassword" suffix-icon="el-icon-lock">
                        </el-input>
                        <el-row style="margin-top:10px;">
                            <cc-query-input disabled :pr20="false" :pl10="false" size="unset" :span="18" label-width="0px" v-model="ruleForm.mobile" prop="mobile" placeholder="请获取手机号码"></cc-query-input>

                            <el-col :span="6" style="text-align:right;">
                                <el-button type="warning" plain @click="queryMobile">获取</el-button>
                            </el-col>
                        </el-row>
                        <el-row style="margin-top:10px;">
                            <el-col :span="12">
                                <cc-query-input :pr20="false" :pl10="false" size="unset" :span="24" label-width="0px" v-model="ruleForm.mobileVerify" prop="mobileVerify" placeholder="请输入验证码"></cc-query-input>
                            </el-col>
                            <el-col :span="12" style="text-align:right;">
                                <el-button @click="sendMobileCode"  v-if="isSend" style="width:90%;" type="warning" plain>发送验证码</el-button>
                                <el-button style="width:90%;" v-if="!isSend" type="warning" plain> {{sendmsg}} </el-button>
                            </el-col>
                        </el-row>
                        <!-- <el-row style="margin-top:10px;">
                            <el-col :span="24" style="text-align:right;">
                                <a href="javascript:;" style="font-size:12px;" @click="loginType='pwd'">用户名密码登陆</a>
                            </el-col>
                        </el-row> -->
                        <div style="margin-top:10px;">
                            <el-button @click="loginMobile()" type="primary" size="medium" style="width:100%;">登录</el-button>
                        </div>
                    </el-form>
                </section>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import Api from '../../app/Api';
import loginRule from "../../app/validator/loginRule";
import Constants from '../../app/data/Constants';
import Core from '../../app/util/Core';
import Util from '../../app/util/Util';

export default {
    data: function() {
        return {       
            showLogo: false,
            Conf: Conf,
            username: '',
            password: '',
            verify: '',
            init: false,
            img: null,
            memorizeMe:false,
            loginType:'pwd',
            ruleForm:{
                mobile:'',
                mobileVerify:'',
            },
            rules: loginRule(this),
            count:'',
            timer:null,
            isSend:true,
            sendmsg:'发送验证码'

        }
    },
    created() {
        this.initData();
        setTimeout(() => {
            this.init = true;
            // 自动登录
            if(this.$route.query.autoLogin == '1') {
                this.autoLogin();
            }
        }, 100);
    },
    computed: {
        loginTitle() {
            if(window.UserType == 'auction') {
                return '其它用户登录';
            }
            return '用户登录';
        }
    },
    methods: {
        autoLogin() {
            let param = this.$route.query;
            this.username = param.user;
            this.password = param.password;

            UI.openLoading('正在自动登录。。。');
            setTimeout(() => {
                UI.closeLoading();
                this.login();
            }, 500);
        },
        inputUserName() {
            console.log('inputUserName');
            this.ruleForm.mobile = '';
        },
        inputPassword() {
            this.ruleForm.mobile = '';
        },
        second() {
            console.log(new Date().format('yyyyMMddHHmmss'));
            let num = new Date().getTime() / 1000;
            let numStr = num + '';
            numStr = numStr.split('.')[0];
            return Number(numStr);
        },
        initData() {
            this.img = Constants.root + "authUser/getVerify?" + new Date().getTime();
            let countdown =  Core.getObj('countdown')
            console.log('倒计时',countdown);
            if(Util.isBlank(countdown)) return;
            let lastSecond = countdown.second;
            let currentSecond = this.second();
            console.log('currentSecond', currentSecond);
            let diff = currentSecond - lastSecond;
            
            console.log('diff', diff);

            if(diff > 60) {
                return;
            }

            let timer = 60 - diff;

            if(timer > 0){
                this.isSend = false;
                this.sendmsg = timer + "s";

                let timerData = {
                    timer: timer,
                    second: this.second()
                };
                
                console.log(timerData);

                this.timeFun = setInterval(() => {
                    --timer;
                    this.sendmsg = timer + "s";
                    
                    if (timer <= 0) {
                        this.isSend = true;
                        this.sendmsg = "重新发送";
                        clearInterval(this.timeFun);
                    }
                }, 1000);
            }


        },
        changeImg(){
            // alert(1)
            this.img = Constants.root + "authUser/getVerify?" + new Date().getTime();
        },
        queryMobile(val){
            console.log('blur',this.ruleForm.username);
            if(Util.isBlank(this.ruleForm.username)) {
                UI.warning('请输入用户名');
                return;
            }

            if(Util.isBlank(this.ruleForm.password)) {
                UI.warning('请输入密码');
                return;
            }

            let url = Constants.root + '/authUser/queryMobile'
            let data = {
                userCode:this.ruleForm.username,
                password:this.ruleForm.password,
                userType:'auction'
            }
            Core.postEncrypt(url, data, res=>{
                console.log('获取的电话数据', res.data);
                this.ruleForm.mobile = res.data;
            })
            
        },
        login() {
            console.log('login');
            var param = {
                username: this.username,
                password: this.password,
                verify: this.verify
            };
            
            Api.postLogin(param, () => {
                
                // 登录成功跳转到主页
                this.$router.push("/");
                setTimeout(() => {
                    console.log('跳转到首页');
                    window.AppPlus.initPageData();
                }, 100);
                // window.AppPlus.initPageData();
                // window.location.reload(); // XXX 不需要 reload 吗？// TODO 登录成功手动跳转到主页，代替reload
            });    
        },
        loginMobile(){
            this.$refs['ruleForm'].validate((valid) => {
                if (valid) {
                    console.log('ruleForm',this.ruleForm);
                    let data = {
                        mobileVerify: this.ruleForm.mobileVerify,
                        password: this.ruleForm.password,
                        username: this.ruleForm.username,
                    }
                    Api.postLogin(data, () => {
                        // 登录成功跳转到主页
                        this.$router.push("/");
                        Core.put('countdown',null)
                        // window.AppPlus.initPageData();
                        window.location.reload();
                    });    
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        sendMobileCode(){
            let param = {}
            if(window.UserType == 'auction') {
                param.userType = 'auction';
            }
            let url = Constants.root + 'authUser/sendMobileCode';
            param.userCode = this.ruleForm.username;
            param.mobile = this.ruleForm.mobile;

            Core.post(url, param, (res)=>{
                
                if(res.status != 'success') {
                    return;
                }

                console.log(res);
                if(res.msg != null) {
                    alert(res.msg);
                }

                UI.success('发送成功')
                // 发送成功--倒计时
                this.isSend = false;
                let timer = 60;
                this.sendmsg = timer + "s";

                let timerData = {
                    timer: timer,
                    second: this.second()
                };
                
                console.log(timerData);
                Core.put('countdown',timerData);
                
                this.timeFun = setInterval(() => {
                    --timer;
                    this.sendmsg = timer + "s";
                    console.log('timer',timer);

                    if (timer == 0) {
                        this.isSend = true;
                        this.sendmsg = "重新发送";
                        clearInterval(this.timeFun);
                    }
                }, 1000);
                // 发送成功--倒计时
            })
        },
    }
}
</script>

<style lang="less">
    .login-page {
        h1{
            font-weight: 100;
        }
        h2 {
            font-weight: 500;
        }
    }
</style>