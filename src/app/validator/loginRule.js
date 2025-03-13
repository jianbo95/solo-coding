import Regular from './Regular.js'

/** 
 * 校验登录
*/
export default function(page) { 
    let field= {
        mobile: '手机号码',
        mobileVerify: '验证码',
        username: '用户账号',
        password: '密码',
    };
    return Regular.buildRquired(field);
}