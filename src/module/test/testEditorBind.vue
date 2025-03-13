<template>
    <div>
        <div>
            iframe textarea文本输入1
            <input type="text" v-model="param.inputText">
        </div>
        <cc-editor-textarea v-model="param.inputText" width="500px" height="50px"></cc-editor-textarea>

        <div>
            iframe textarea文本输入2
            <input type="text" v-model="param.inputText2">
        </div>
        <cc-editor-textarea v-model="param.inputText2" width="500px" height="50px"></cc-editor-textarea>

        <div>
            iframe ace 编辑器输入1
            <input type="text" v-model="param.inputText3">
        </div>
        <cc-editor-ace v-model="param.inputText3" width="99%" height="250px"></cc-editor-ace>

        <div>
            iframe ace 编辑器输入2
            <input type="text" v-model="param.inputText4">
        </div>
        <cc-editor-ace v-model="param.inputText4" width="99%" height="250px"></cc-editor-ace>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
            param: {
                inputText: '',
                inputText2: ''
            }
        }
    }
}
</script>