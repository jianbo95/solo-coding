export default {
    buildAttr(attrs) {
        let attrArr = [];
        for(let i in attrs) {
            let attr = attrs[i];
            let name = attr.name;
            let value = attr.value;
            if(value != '') {
                attrArr.push(name + '="' + value + '"')
            } else {
                attrArr.push(name)
            }
        }
        return attrArr.join(' ');
    }

}