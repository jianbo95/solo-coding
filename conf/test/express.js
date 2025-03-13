const express = require('express');
var app = express();
var port = 9090;
var server = app.listen(port, () => console.log('App listening on ' + port + ' !'));
console.log(server);
server.close();