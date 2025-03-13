export default {
    data: {
        dao: '',
        from: '',
        field: []
    },
    relay(dao) {
        this.data.dao = dao;
        return this;
    },
    from(from) {
        this.data.from = from;
        return this;
    },
    select() {
        var field = [];
        for (let i = 0; i < arguments.length; i++) {
            const element = arguments[i];
            field.push(element);
        }
        this.data.field = field;
        return this;
    }
}