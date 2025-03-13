export default {
    build() {
        let builder = {
            funcList: [],
            _finish: null,
            _count: null,
            // public
            addPool(_func) {
                // console.log('addPool', _func);
                this.funcList.push(_func);
            },

            setCount(_count) {
                this._count = _count;
            },
            // public
            execute(_finish) {
                this._finish = _finish;
                if(this.funcList.length > 0) {
                    this.executeFun();
                } else {
                    this._finish();
                }
            },
            // private
            executeFun(i) {
                if(i == null) {
                    i = 0;
                }
                let _func = this.funcList[i];
                if(_func == null) {
                    this._finish();
                    return;
                }
                _func(() => {
                    if(this._count != null) {
                        this._count();
                    }
                    this.executeFun(i + 1);
                });
            }
        };
        return builder;
    },
}