/**
 * 加载js组件
 */
import UI from '../util/UI.js';
import DataInit from '../data/DataInit.js';
import Dict from '../data/Dict.js';
import Api from '../Api.js';
import StyleConfig from './style-config.js';
// 引入弹窗移动的JS
import  '../util/drag.js'
import RouterManager from '../config/router-manager.js';
import ApiPath from '../data/ApiPath.js';
import NumberUtil from '../util/NumberUtil.js' // 引入失败
import StringUtil from '../util/StringUtil.js';
import CommonUtil from '../util/CommonUtil.js';
import Crypto from '../util/crypto.js'
import loginRule from "../validator/loginRule.js";
import R from '../function/R.js';
import V from '../function/V.js';
import B from '../function/B.js';
import L from '../function/L.js';
import P from '../function/P.js';
import CrudService from '../service/CrudService.js';
import Crud from '../service/Crud.js';
import Counter from '../util/Counter.js';
import BinWrap from '../util/data/BinWrap.js';
import * as NodeModule from '../NodeModule.js';
import StoreFactory from '../core/store/store-factory.js';

window.StoreFactory = StoreFactory;
window.RouterManager = RouterManager;
window.ApiPath = ApiPath;
window.Api = Api;
window.Dict = Dict;
window.StyleConfig = StyleConfig;
window.DataInit = DataInit;
window.NumberUtil = NumberUtil;
window.StringUtil = StringUtil;
window.CommonUtil = CommonUtil;
window.Crypto = Crypto;
window.loginRule = loginRule;
window.R = R;
window.V = V;
window.B = B;
window.L = L;
window.P = P;
window.Crud = Crud;
window.CrudService = CrudService;
window.Counter = Counter;
window.BinWrap = BinWrap;
window.NodeModule = NodeModule;

window.Json = {
    toString(obj) {
        let json = JSON.stringify(obj);
        return Util.formatJson2(json);
    }
};

export default {
    log() {},
    init(vue) {
        // console.log(UI);
        UI.initVue(vue);
    }
}