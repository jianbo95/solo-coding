<template>
	<div class="icon-page" style="padding:0px;" :style="style">
		<div class="box-menu-div" v-if="init">
			<div style="clear: both; height: 1px;">&nbsp;</div>
			<!-- <div id="page-content-wrapper" style="margin-left: 0px; background-color:#eef1f6;"> -->
			<div class="box-menu" v-for="(menu, i) in menus" v-if="menu.text != '独立页面'">
				<div class="title">{{menu.text}}</div>
				<template v-for="(child, i) in menu.children">
					<div class="box-item" style="background: unset;" @click="onSelect(child)">
					<div class="icon-box" :style="'background:'+getColor()">
						
						<i :class="'el-icon-' + getType(child)"></i>
						<!-- <Icon size="40" color="#ffffff" :type="getType(child,i)"></Icon> -->
					</div>
					<div class="item-text">{{child.text}}</div>
					</div>
					<!-- <template v-if="(i + 1) % getBoxSpan(menu) == 0"><br></template> -->
				</template>
			</div>
			<div style="clear: both;"></div>
			<!-- </div> -->
		</div>
	</div>
</template>

<script>
export default {
	data: function() {
		return {
			init: false,
			menus: [],
			menuType: {
				'菜单管理': 's-grid',
				'用户管理': 'user-solid',
				'角色管理': 'user',
				'参数管理': 's-operation',
				'参数高级管理': 's-operation',
				'映射配置管理': 'sort',
				'分布式锁管理': 'lock',

				'核心交互日志': 'tickets',
				'轨迹查询': 's-promotion',
				'实名认证中保信': 'success',
				'实名认证江苏平台': 'success',
				'外部接口日志': 'tickets',
				'用户授权书同意查询': 'notebook-2',
				'支付流程查询': 'share',
				'金额统计': 'money',

				'中保付机构代码管理': 'document',
				'网上支付二维码入口配置': 'menu',
				'易宝二维码商户码配置': 'document',	
				'实名认证机构配置': 's-flag',
				'支付渠道中保付配置': 's-tools',
				'支付渠道易宝配置': 's-tools',

				'缴费查询核心': 'social-yen',
				'到账同步核心': 'arrow-swap',
				'到账核心任务管理': 'search',
				'实名认证核心': 'android-done',
				'网上支付渠道下单记录': 'record',

				'消息提醒':'message-solid',
				'系统日志':'s-order',
				'轨迹查询':'map-location',
				'缓存监控':'video-camera-solid',
				'分布式锁':'unlock',
				'部门查询':'search',
				'区域国际码':'location-information',
				'拍卖商用户管理':'s-custom',
				'系统菜单':'s-tools',
				'常用意见管理':'edit-outline',
				'公告管理':'chat-dot-square',
				'竞价发布':'s-promotion',
				'待处理':'tickets',
				'待审核':'s-check',
				'二次审核':'document-checked',
				'综合查询':'search',
				'完成竞价车辆':'car',
				'需要竞价车辆':'car-money',
				'委托车辆':'car-wt',
				'拍卖商考核指标统计表':'data-line',
				'竞价案件清单':'notebook-2',
				'未竞价案件清单':'notebook-2',
				'委托拍卖案件清单':'paimai',
				'拍卖商管理':'s-order',


				'拍卖任务':'paimai',
				'历史竞价车辆':'collection',
				'已竞中车辆':'car-money',
				'拍卖商意见管理':'edit-outline',
				'过户任务':'user-solid'
			}
		}
	},
	created: function() {
		this.initMenu();
	},
	computed:{
		style: function() {
            var width;
            if(Util.isIE()) {
                // var width = (Core.getPageWidth() - 80) + "px"; 1286  1080 = 
                var width = (Core.getPageWidth() - 286) + "px";
            } else {
                var width = "calc(100% - 15px)";
            }
            var style = "padding:5px; height:calc(100% - 10px); width:" + width + "; background:none;"
            return style;
        }
	},
	methods: {
		initMenu: function() {
			this.menus = DataInit.getUserMenu();
			this.init = true;
		},
		getColor: function (node, index) {
        	return Constants.getColorAuto();
		},
		getType: function (child) {
			var icon = this.menuType[child.text];
			if(icon == null) {
				icon = 'document';
			}
			return icon;
		},
		onSelect: function (child) {
			console.log('select icon', child.text + '-' + child.id);
			// window.App.fromIcon(child.text);
			// Store.commit('setTagName', child.text);
			Store.commit('setTagName',  child.id);
			Store.commit('eventClickIcon');
		}
	},
}
</script>

<style>
.icon-page {
	color:#4e4e4e;
	font-size: 13px;
}
.icon-page .title {
	padding-left: 10px;
	margin-bottom: 10px;
	border-left: 6px solid #ff9e2b;
	font-size: 16px;
	font-weight:bold;
}
.icon-page i {
	font-size:40px;
	color:white;
	margin-top:10px;
}

.box-menu-div {
    /* border: 1px solid #000; */
    padding-bottom: 50px;
    margin:0px;
    background-color: #fff;
  }
  .box-menu {
    /* float: left; */
    /* width: 350px; */
    /* height: 350px; */
    margin:15px;
    padding:10px;
    /* background: #fff; */
  }
  .box-menu .box-item {
    display: inline-block;
    text-align: center;
    padding: 10px;
    overflow: hidden;
    width: 100px;
	/* height: 130px; */
	height:100px;
    cursor: pointer;
  }
  .box-item .icon-box {
    margin: 0 auto;
    width: 60px;
    height: 60px;
    border-radius: 30%;
  }
  .box-item .item-text {
	margin-top: 5px;
	font-size: 16px;
  }
  .icon-box .ivu-icon {
    margin-top:11px;
  }

</style>
