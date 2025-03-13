<template>
	<section class="section-content" style="width:700px;">
		<div class="wrapper wrapper-content ">
			<div class="row">
				<div class="col-sm-12">
					<table class="table table-bordered table-striped">
						<tbody>
							<input id="workOrderId" name="workOrderId" type="hidden"
								:value="workOrderId">
							<!-- <input id="picType" name="picType" type="hidden"
								th:value="2"> -->
							<input id="picType" name="picType" type="hidden" :value="picType">
							<input id="picTypeCode" name="picTypeCode" type="hidden" :value="picTypeCode">
							<div class="ibox-content">
								<!-- <a rel="group" th:each="pic,userStat:${picList}"
									th:href="@{'/car/deptPic/printPic/'+${pic.id}}"
									th:title="${pic.remark}"> <img
									th:src="@{'/car/deptPic/printPic/'+${pic.id}}" width="80" />
								</a>  -->
								<el-image @click.native="deletePic(item)" style="width: 100px; height: 100px" v-for="(item,index) in srcList" :key="index" :src="item.url" fit="contain"></el-image>
							</div>
							<div class="ibox-content">
								<div class="page-container">
									<p>您可以尝试文件拖拽，使用QQ截屏工具，然后激活窗口后粘贴，或者点击添加图片按钮.</p>
									<div id="uploader" class="wu-example">
										<div class="queueList">
											<div id="dndArea" class="placeholder">
												<div id="filePicker" class="webuploader-container">
													<div class="webuploader-pick">点击选择图片</div>
													<div id="rt_rt_1de8ojknb1r1v14t4urkjhr11nj1"
														style="position: absolute; top: 0px; left: 618.2px; width: 168px; height: 44px; overflow: hidden; bottom: auto; right: auto;">
														<input type="file" name="file"
															class="webuploader-element-invisible" multiple="multiple"
															accept="image/*"><label
															style="opacity: 0; width: 100%; height: 100%; display: block; cursor: pointer; background: rgb(255, 255, 255);"></label>
													</div>
												</div>
												<p>或将照片拖到这里，单次最多可选300张</p>
											</div>
											<ul class="filelist"></ul>
										</div>
										<div class="statusBar"  style="display:none;">
											<div class="progress" style="display: none;">
												<span class="text">0%</span> <span class="percentage"
													style="width: 0%;"></span>
											</div>
											<div class="info" ref="info">共0张（0B），已上传0张</div>
											<div class="btns">
												<div id="filePicker2" class="webuploader-container">
													<div class="webuploader-pick">继续添加</div>
													<div id="rt_rt_1de8ojknd61la9pgah1ks41g1p6"
														style="position: absolute; top: 0px; left: 0px; width: 1px; height: 1px; overflow: hidden;">
														<input type="file" name="file"
															class="webuploader-element-invisible" multiple="multiple"
															accept="image/*"><label
															style="opacity: 0; width: 100%; height: 100%; display: block; cursor: pointer; background: rgb(255, 255, 255);"></label>
													</div>
												</div>
												<div class="uploadBtn state-pedding">开始上传</div>
											</div>
										</div>
									</div>
								</div>
							</div>

						</tbody>
					</table>

				</div>
			</div>
		</div>

	</section>
</template>

<script>

import Webuploader from '@/app/util/webuploader';

export default {
	props:{
		workOrderId:{
			type:String,
		},

		picTypeCode:{
			default:'1',
			type:String
		},
		picType:{
			default:'1', // 1为工单图片，2为拍卖商管理模块的图片
			type:String
		},
	},
    data(){
        return{
			uploader: null,
			srcList:[],
			picList:[]
        }
	},
	mounted(){
        		
		setTimeout(() => {
			
			this.uploader = Webuploader();
			console.log('uploader 实例创建');

		}, 1000);

        this.queryPic();
	},
	computed:{},
	methods:{
        queryPic() {
            let url = Constants.root + 'workOrderPic/queryPic'
            let param = {
                id: this.workOrderId,
                picType: this.picType,
                picTypeCode: this.picTypeCode
            };
            UI.post(url, param, (result) => {
                this.picList = result.data;
                this.showPic();
            });
        },
		showPic(){
			this.srcList = []
            this.picList.forEach(element => {
                let url = Constants.root + 'workOrderPic/printImg?picId=' 
                    + element + '&picType=' + this.picType;
                Core.getImage(url, (result) => {
                    this.srcList.push({
						url:result,
						picId:element
					})
                });
            });
		},
		deletePic(item){
			console.log('item',item);
			UI.confirmDialog('确定删除图片吗？',()=>{
                let url = Constants.root + "workOrderPic/delete";
                var param = { 
                    id: item.picId,
                    picType: this.picType
                };
                UI.post(url, param, result=>{
                    if(result.status == 'success') {

                        UI.success('删除成功');
                        this.queryPic();
                    }
                });
            }, ()=>{})
		},
		pedding() {
			this.uploader.setState('pedding');
		},
		ready() {
			this.uploader.setState('ready');
		},
		paused() {
			this.uploader.setState('paused');
		},
		uploading() {
			this.uploader.setState('uploading');
		}
	}
}
</script>
