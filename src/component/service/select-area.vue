<template>
    <div>
        <el-input
            v-model="currentValue"
            class="form-control"
            :size="size"
            readonly
            type="text"
            @click.native="openDialog"
        ></el-input>
        <cc-dialog
            ref="detailDialog"
            title="选择城市"
            width="300px"
            :visible.sync="detailDialogShow"
        >
            <section style="width: 250px; margin: 0 auto; max-height: 320px">
                <el-tree
                    :data="data"
                    :props="defaultProps"
                    @node-click="handleNodeClick"
                    :default-expand-all="true"
                ></el-tree>
            </section>
            <template v-slot:footer-middle>
                <el-button size="mini" type="primary" @click="onComfirm"
                    >确 定</el-button
                >
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
            data: [],
            defaultProps: {
                children: "children",
                label: "text",
            },
            areaMap: {},
            currentNode: {},
            currentText: "",
            inputText: "",
            currentValue: this.value,
        };
    },
    props: {
        size: {
            default: "mini",
            type: String,
        },
        value: String,
        prop: {
            type: String,
        },
    },
    methods: {
        openDialog() {
            this.initRootArea();
            this.detailDialogShow = true;
        },
        initRootArea(id) {
            var url = Constants.root + "sysArea/tree";
            if (Util.isBlank(id)) {
                id = "#";
            }
            let param = {
                id: id,
            };
            UI.post(url, param, (result) => {
                this.data = result;
                console.log('result', result);
                for(let i in result) {
                    let area = result[i];
                    this.areaMap[area.id] = area;
                }
            });
        },
        // 获取子选项
        handleNodeClick(select, node, a) {
            // let _this = this;
            // console.log(data.id);
            // console.log('当前', select.id, select, node, a);
            // console.log("select", select);
            this.currentNode = select;

            var url = Constants.root + "sysArea/tree";
            UI.post(url, { parentCode: select.id }, (result) => {
                if (result.length == 0) {
                    select.end = true;
                }

                for(let i in result) {
                    let area = result[i];
                    this.areaMap[area.id] = area;
                }

                select.children = result;
            });
        },
        onComfirm() {
            console.log("选择的地区", this.currentNode);
            let params = {};

            if (!this.currentNode.end) {
                UI.warning("请选择下一级");
                return;
            }

            let areaList = [];

            let pure = (node) => {
                return {
                    id: node.id,
                    text: node.text,
                    parentId: node.parentId
                }
            };

            let loopAreaList = (node) => {
                areaList.push(pure(node));
                let lastNode = this.areaMap[node.parentId];
                if(lastNode != null) {
                    loopAreaList(pure(lastNode));
                }
            };

            loopAreaList(this.currentNode);
            
            areaList.reverse();

            if(areaList[0] != null) {
                params.proviceCode = areaList[0].id;
                params.proviceName = areaList[0].text;
            }

            if(areaList[1] != null) {
                params.cityCode = areaList[1].id;
                params.cityName = areaList[1].text;
            }

            if(areaList[2] != null) {
                params.areaCode = areaList[2].id;
                params.areaName = areaList[2].text;
            }

            let currentValue = params.proviceName;
            if (params.cityName != null) {
                currentValue = currentValue + " " + params.cityName;

                if (params.areaName != null) {
                    currentValue = currentValue + " " + params.areaName;
                }
            }
            this.currentValue = currentValue;
            this.$emit(
                "onArea",
                params.proviceCode,
                params.proviceName,
                params.cityCode,
                params.cityName,
                params.areaCode,
                params.areaName
            );
            this.$emit("input", this.currentValue);
            this.detailDialogShow = false;
        },
    },
    watch: {
        // 流入 value
        value: function () {
            if (this.value != this.currentValue) {
                this.currentValue = this.value;
            }
        },
    },
};
</script>
