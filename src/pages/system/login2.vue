<template>
  <div id="login-page" class="login-page">
    <!-- <div style="text-align: center; margin-top: 10%">
      <img class="logo-l" src="../../assets/images/logo-l.png" />
    </div> -->
    <form>
    <dl class="admin_login" style="margin-top: 50px; " v-if="init">
      <dt>
        <strong>残值拍卖系统</strong>
        <em>Management System</em>
      </dt>
      <div class="form-item-login-error" style="color: #fff"></div>
      <dd class="user_icon">
        <input v-model="username" type="text" placeholder="请输入账号" class="login_txtbx" />
      </dd>
      <dd class="pwd_icon" style="margin-top: 10px">
        <input v-model="password" type="password" placeholder="请输入密码" class="login_txtbx"/>
      </dd>
      <dd class="pwd_icon" style="margin-top: 10px">

        <img :src="img">
        <input v-model="verify"  style="width:50%;"type="text" placeholder="请输入验证码" class="login_txtbx"/>
      </dd>
      <dd style="margin-top: 10px">
        <input type="button" value="立即登录" class="submit_btn" @click="login()"/>
      </dd>
      <dd style="margin-top: 20px">
        <p style="color: #aaf8e9">技术支持 &nbsp;中科软科技股份有限公司</p>
      </dd>
    </dl>
    </form>
  </div>
</template>

<script>

import '../../assets/style/login.less';
import Api from '../../app/Api';

export default {
  data: function () {
    return {
      particle: true,
      username: '',
      password: '',
      verify: '',
      init: false,
      img: null
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      this.img = Constants.root + "authUser/getVerify?" + new Date().getTime();
      this.init = true;
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
        // window.AppPlus.initPageData();
        window.location.reload();
      });
			
    }
  }
};
</script>
