<template>
  <div>
    <el-input v-model="currentValue" class="form-control" :size="size" readonly type="text" @click.native="openDialog"></el-input>
    <cc-dialog ref="detailDialog" title="选择城市"
      width="300px" :visible.sync="detailDialogShow" > 
        <section style="width:250px;margin:0 auto;max-height: 320px;">
            <el-tree :data="data" :props="defaultProps" @node-click="handleNodeClick" :default-expand-all="true"></el-tree>
        </section>
        <template v-slot:footer-middle>
			<el-button size="mini" type="primary" @click="onComfirm">确 定</el-button>
		</template>
    </cc-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      options: [],
      detailDialogShow: false,
      data:[],
      defaultProps: {
        children: "children",
        label: "text"
      },
      currentNode:{},
      currentText:'',
      inputText:'',
      currentValue:this.value
    };
  },
  props:{
        size: {
            default: "mini",
            type: String
        },
        value: String,
        prop:{
            type:String
        }
  },
  methods: {
    openDialog() {
      this.getArea();
      // alert(1)
      this.detailDialogShow = true;
    },
    getArea(id) {
      let _this = this;
      var url = Constants.root + "sysArea/tree";
      if (Util.isBlank(id)) {
        id = "#";
      }
      UI.post(url, { id: id }, function(result) {
        console.log("地址11", result);
        _this.data = result;
      });
    },
    handleNodeClick(data, node, a) {
      let _this = this;
      console.log(data, node, a);
      if (data.parentId == "0") {
        var url = Constants.root + "sysArea/tree";
        UI.post(url, { parentCode: data.id }, function(result) {
          console.log("地址22", result);
        //   _this.data = result;
            _this.data.forEach(item=>{
                if(item.id == data.id){
                    item.children = result
                    _this.currentNode = item
                }
            })
        });
      }else{
          _this.currentNode = data
      }
    },
    onComfirm(){
        if(this.currentNode.parentId == 0){return}
        console.log('选择的地区',this.currentNode);
        this.data.forEach(item=>{
            if(item.id == this.currentNode.parentId){
                console.log('选择的省份', item.text);
                console.log('选择的市区', this.currentNode.text);
                this.$emit('onCity',this.currentNode.parentId,item.text,this.currentNode.id,this.currentNode.text)
                this.currentValue = item.text + this.currentNode.text
                this.$emit('input',this.currentValue)
                this.detailDialogShow = false
            }
        })
    }
  },
    watch: {
        // 流入 value
        value: function() {
            if(this.value != this.currentValue) {
                this.currentValue = this.value;
            }
        },
    }
};
</script>