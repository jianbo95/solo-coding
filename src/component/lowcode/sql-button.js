export default { 
    code : `
    // Auto Code start
    if(!this.service.isSelect()) {
        return;
    }
    var url = Constants.root + '{{api}}';
    var param = this.currentRow;
    this.loading = true;
    Core.post(url, param, (result) => {
        this.loading = false;
    });
    // Auto Code end
`,
    pureCode: `
    // Auto Code start
    var url = Constants.root + '{{api}}';
    var param = {
        id: null
    };
    Core.post(url, param, (result) => {
        
    });
    // Auto Code end
`,
}

