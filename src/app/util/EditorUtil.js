export default {
    buildCompleter(columnInfo) {

        var allField = [];
        var allComment = [];
        for (let i = 0; i < columnInfo.length; i++) {
            let column = columnInfo[i];
            if(i == columnInfo.length - 1) {
                // 最后一行
                allField.push(column.name + '--' + column.comment + '\n');
                allComment.push(column.name + ' ' + column.comment + '\n');
            } else {
                // 第一行
                allField.push(column.name + ', --' + column.comment + '\n');
                allComment.push(column.name + ' ' + column.comment + ',\n');
            }
        }
        
        var allFieldSql = allField.join('');
        var allFieldCommentSql = allComment.join('');

        var staticWordCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                console.log('EditorUtil prefix [' + prefix + ']');
                var token = session.getTokenAt(pos.row, pos.column);
                // console.log(pos, session.getTokenAt(pos.row, pos.column));
                // always callback

                var calldata = [];
                for (let i = 0; i < columnInfo.length; i++) {
                    let column = columnInfo[i];
                    let word = column.name;
                    calldata.push({
                        caption: 'field.' + word + ' ' + column.comment,
                        value: word,
                        scope: 3000,
                        meta: "field"
                    });
                }
                calldata.push({
                    caption: 'field all 字段名',
                    value: allFieldSql,
                    scope: 3001,
                    meta: "field"
                });
                calldata.push({
                    caption: 'field all 注释名',
                    value: allFieldCommentSql,
                    scope: 3001,
                    meta: "field"
                });

                // 自动补充所有字段


                // var calldata = staticVar.map(function(word) {
                //     return {
                //         caption: 'field.' + word,
                //         value: word,
                //         scope: 3000,
                //         meta: "field"
                //     };
                // });

                console.log('calldata', calldata);

                callback(null, calldata);
            },
            triggerCharacters: ["."],
        };
        return staticWordCompleter;
    }
}