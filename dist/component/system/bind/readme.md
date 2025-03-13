# 页面绑定

按照链接顺序绑定页面

## demo
```html
<cc-page-bind>
	<div class="pure-menu pure-menu-horizontal">
	    <ul class="pure-menu-list">
	        <li class="pure-menu-item"><cc-page-link class="pure-menu-link">移动查勘</cc-page-link></li>
	        <li class="pure-menu-item"><cc-page-link class="pure-menu-link">移动平台</cc-page-link></li>
	        <li class="pure-menu-item"><cc-page-link class="pure-menu-link">支付平台</cc-page-link></li>
	    </ul>
	</div>
	<cc-page-group>
		<ms-page></ms-page>
		<rapid-page></rapid-page>
		<upay-page></upay-page>
		<cc-finsih></cc-finsih>
	</cc-page-group>
</cc-page-bind>
```