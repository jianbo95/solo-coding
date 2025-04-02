<template>
    <div class="login-page" style="height:100%;">
    <cc-page :loading="loading" :init="init">
        <div style="position: absolute; left:40px; top:30px;">
            <img alt="image" class="img-circle-none"  src="../../assets/images/logo-l.png"/>
        </div>

        <div style="position: absolute; left:25%; top:15%;">
            <div style="float:left;">

                <div>
                    <h1 style="font-weight:100;">众诚整车残值询报价系统</h1>
                </div>
                
                <h3>
                    欢迎使用 
                    <strong>众诚整车残值询报价系统</strong>
                </h3>

                <div>
                    <el-button circle icon="el-icon-right" size="mini" ></el-button>
                </div>
            </div>

            <div style="float:left; margin:10px 0 0 20px; background:#fff; width:350px;color:#000;">
                <div style="text-align:center;">
                    <h2>{{loginTitle}}</h2>
                </div>

                <div style="text-align:center;font-size:10px;">
                    欢迎登录整车残值询报价公共平台
                </div>

                <div style="padding:20px;">
                 <!-- 用户登录__登陆 pwd-->
                <section v-if="loginTitle=='用户登录'">
                    <div style="margin-top:10px">
                        <el-input
                            v-model="ruleForm.username"
                            placeholder="请输入用户名"
                            suffix-icon="el-icon-user">
                        </el-input>
                    </div>
                    <div style="margin-top:10px">
                        <el-input
                            v-model="ruleForm.password"
                            type="password"
                            placeholder="请输入密码"
                            suffix-icon="el-icon-lock">
                        </el-input>
                    </div>
                    <div style="margin-top:10px;" v-if="loginMode == 'qw'">
                        <el-row>
                            <el-col :span="12">
                                <cc-input size="unset" v-model="ruleForm.mobileVerify" prop="mobileVerify" placeholder="请输入验证码"></cc-input>
                            </el-col>
                            <el-col :span="12" style="text-align:right;">
                                <el-button @click="sendMobileCode"  v-if="isSend" style="width:90%;" type="warning" plain>发送企微验证码</el-button>
                                <el-button style="width:90%;" v-if="!isSend" type="warning" plain> {{sendmsg}} </el-button>
                            </el-col>
                        </el-row>
                    </div>
                    <div style="margin-top:10px" v-if="loginMode == 'pic'">
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
                            <cc-query-input disabled :pr20="false" :pl10="false" size="unset" :span="18" labelWidth="0px" v-model="ruleForm.mobile" prop="mobile" placeholder="请获取手机号码"></cc-query-input>

                            <el-col :span="6" style="text-align:right;">
                                <el-button type="warning" plain @click="queryMobile">获取</el-button>
                            </el-col>
                        </el-row>
                        <el-row style="margin-top:10px;">
                            <el-col :span="12">
                                <cc-query-input :pr20="false" :pl10="false" size="unset" :span="24" labelWidth="0px" v-model="ruleForm.mobileVerify" prop="mobileVerify" placeholder="请输入验证码"></cc-query-input>
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
    </cc-page>
    </div>
</template>

