export default {
    date(row, page, value) {
        return new Date(value).format();
    },
    costTime(startField, endField) {
        return (row) => {
            let start = row[startField];
            let end = row[endField];
            if(start != null && end != null) {
                return end - start;
            }
            return null;
        };
    }
}