
export default {
    get(url, call) {
        $.ajax({
            url: url + '?version=' + window.Version,
            method: 'GET',
            dataType: 'json',
            success: (res) => {
                call(res);
            }
        });
    },
    getStr(url, call) {
        $.ajax({
            url: url + '?version=' + window.Version,
            method: 'GET',
            dataType: 'text',
            success: (res) => {
                call(res);
            }
        });
    },
}