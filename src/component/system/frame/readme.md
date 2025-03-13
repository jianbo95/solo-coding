# frame 框架使用教程

## 菜单样式
system | custom | channel | app | cloud | source | statistics 

## 使用实例
```html
<cc-frame>
	<cc-menu>
		<cc-menu-items name='业务系统' class='system'>
			<cc-menu-item name='我的主页' to='/'></cc-menu-item>
			<cc-menu-item name='工作测试' to='/job-test'></cc-menu-item>
		</cc-menu-items>
		<cc-menu-items name='个人中心' class='custom'>
			<cc-menu-item name='账号' to=''></cc-menu-item>
			<cc-menu-item name='信息' to=''></cc-menu-item>
		</cc-menu-items>
	</cc-menu>
	<cc-title default='我的主页'></cc-title>
	<cc-content>
		<keep-alive>
			<router-view></router-view>
		</keep-alive>
	</cc-content>
</cc-frame>
```