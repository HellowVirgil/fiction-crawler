//demo.js 文件
const path = require('path');
const fs = require('fs');
var express = require('express');
var app = express();

app.use('/dist', express.static('dist'));

// app.get('/', function (req, res) {
//    res.send('Hello World');
// })
 
var server = app.listen(8081, 'localhost', function () {
 
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s/dist/https_lxsw2020_com", host, port)
 
})