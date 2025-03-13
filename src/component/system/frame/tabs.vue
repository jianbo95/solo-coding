<template>
	<div class="cc-tabs">

        <ul class="tab">
        	<li class="active">About</li>
        	<li>Services</li>
        	<li>Work</li>
        </ul>
    
	</div>
</template>

<script type="text/javascript">
	export default {}
</script>

<style type="text/css">
.cc-tabs {
    position: relative;
	width: 100%;
	margin-left: 160px;
}

.cc-tabs ul{
	background: #68AAA9;
	list-style:none;
	height: 30px;
	margin: 0px;
	padding: 0px;
}
.cc-tabs li {
	float:left;
	background: #5ba4a4;
	font-size: 15px;
	line-height: 30px;
	height: 30px;
	position: relative;
	padding: 0 20px;
	display: block;
	width: 80px;
	color: #385c5b;
	letter-spacing: 1px;
	text-transform: uppercase;
	font-weight: bold;
	text-align: center;
	text-shadow: 1px 1px 1px rgba(255,255,255,0.3);
    /*border-radius: 3px 3px 0 0;*/
    box-shadow: 2px 0 2px rgba(0,0,0,0.1), -2px 0 2px rgba(0,0,0,0.1);
    cursor: pointer;
}
.cc-tabs .active {
	background: #fff;
	display: block;
	box-shadow: 0 0 0 rgba(0,0,0,0.1), 0 0 0 rgba(0,0,0,0.1);
	/*margin-top: 1px;*/
}
.cc-tabs li:hover {
	background: #6CACAB;
}
.cc-tabs .active:hover {
	background: #fff;
}

</style>