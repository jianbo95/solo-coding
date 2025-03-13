(function(parentUrl) {
Flag("compileByJianbo");
Flag("compileByPublish");
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports = {
    menu: [{
        "id": "auto1",
        "title": "测试",
        "type": "server",
        "parent": null
    }, {
        "id": "auto2",
        "title": "支付服务器",
        "type": "server",
        "parent": "auto1"
    }, {
        "id": 1,
        "name": "mobitest@10.13.1.235",
        "ip": "10.13.1.235",
        "port": 22,
        "username": "mobitest",
        "password": "7L#x5WZe1L",
        "groups": "测试 > 支付服务器",
        "parent": "auto2",
        "title": "mobitest@10.13.1.235",
        "type": "server"
    }, {
        "id": "auto3",
        "title": "个人",
        "type": "server",
        "parent": null
    }, {
        "id": "auto4",
        "title": "手机",
        "type": "server",
        "parent": "auto3"
    }, {
        "id": 2,
        "name": "u0_a399@192.168.1.112",
        "ip": "192.168.1.112",
        "port": 8023,
        "username": "u0_a399",
        "password": "jianbo100",
        "groups": "个人 > 手机",
        "parent": "auto4",
        "title": "u0_a399@192.168.1.112",
        "type": "server"
    }, {
        "id": 3,
        "name": "weblogic@10.13.1.235",
        "ip": "10.13.1.235",
        "port": 22,
        "username": "weblogic",
        "password": "7L#x5WZe1L",
        "groups": "测试 > 支付服务器",
        "parent": "auto2",
        "title": "weblogic@10.13.1.235",
        "type": "server"
    }, {
        "id": "auto5",
        "title": "虚拟机",
        "type": "server",
        "parent": "auto3"
    }, {
        "id": 4,
        "name": "jianbo95@vos",
        "ip": "192.168.56.101",
        "port": 22,
        "username": "jianbo95",
        "password": "123456",
        "groups": "个人 > 虚拟机",
        "parent": "auto5",
        "title": "jianbo95@vos",
        "type": "server"
    }, {
        "id": 5,
        "name": "root@openwrt",
        "ip": "192.168.56.102",
        "port": 22,
        "username": "root",
        "password": "koolshare",
        "groups": "个人 > 虚拟机",
        "parent": "auto5",
        "title": "root@openwrt",
        "type": "server"
    }, {
        "id": "sub1",
        "title": "支付日志",
        "ssh_name": "weblogic@10.13.1.235",
        "description": "支付日志",
        "create_date": 1687138117000,
        "parent": 3,
        "type": "item",
        "ip": "10.13.1.235",
        "port": 22,
        "username": "weblogic",
        "password": "7L#x5WZe1L"
    }, {
        "id": "sub2",
        "title": "测试1",
        "ssh_name": "jianbo95@vos",
        "description": "测试1",
        "script": "ls",
        "create_date": 1687142714000,
        "parent": 4,
        "type": "item",
        "ip": "192.168.56.101",
        "port": 22,
        "username": "jianbo95",
        "password": "123456"
    }, {
        "id": "sub3",
        "title": "测试2",
        "ssh_name": "root@openwrt",
        "description": "测试2",
        "script": "ifconfig",
        "create_date": 1687146642000,
        "parent": 5,
        "type": "item",
        "ip": "192.168.56.102",
        "port": 22,
        "username": "root",
        "password": "koolshare"
    }]

};
})('module/test/data/test-menu2.js'); exports; 