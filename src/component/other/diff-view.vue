<template>
    <div :id="id">
    </div>
</template>

<script>
export default {
    data: function() {
        return {  
            id: null     
        }
    },
    props: {
        preData: {
            default: "",
            type: String
        },
        nextData: {
            default: "",
            type: String
        }
    },
    created() {
        this.id = Util.UUID();
        ModuleDefine.load('difflib', () => {

        Core.waitDomById(this.id, () => {
            var base = difflib.stringAsLines(this.preData);
            var newtxt = difflib.stringAsLines(this.nextData);
            var sm = new difflib.SequenceMatcher(base, newtxt);
            var opcodes = sm.get_opcodes();

            var diffoutputdiv = document.getElementById(this.id);
            diffoutputdiv.innerHTML = "";
            
            var opt = {
                baseTextLines: base,
                newTextLines: newtxt,
                opcodes: opcodes,
                baseTextName: "操作前数据",
                newTextName: "操作后数据",
                contextSize: 5,
                viewType: 0
            };
            diffoutputdiv.appendChild(diffview.buildView(opt));
        });

        });
    }
}
</script>