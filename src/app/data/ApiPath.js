/**
 * 接口路径定义
 */
export default {
    // "menuData": "dataApiFaas/lowcode/menuData",
    "menuData": "faas/lowcode/menuData",
    "docMenuData": "faas/lowcode/docMenuData",
    "userInfo": "user/userInfo",
    "userLogin": "user/login",
    // http ssh
    "sshDatagrid": "websshHttp/datagrid",
    "sshOpen": "websshHttp/open",
    "sshSend": "websshHttp/send",
    "sshGet": "websshHttp/get",
    "sshSize": "websshHttp/size",
    "sshClose": "websshHttp/close",
    // cicd file
    "cicdFtpFiles": "cicdFtp/localFileList",
    "cicdFtpCopy": "cicdFtp/copy",
    "cicdFtpDelete": "cicdFtp/delete",
    // database server
    queryDbTable (refresh) {
        if(refresh == true) {
            return "serverCache/queryDbTable";
        } else {
            return "server/queryDbTable";
        }
    },
    // editor
    "fileGet": "editor/fileGet",
    "fileSave": "editor/fileSave"
}