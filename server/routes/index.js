const mongoose = require('mongoose');
const useruri = 'mongodb://localhost:27017/users'; //mogodb用户数据库地址
var express = require('express');
var clientDir = require("fs");
var crypto = require('crypto');
const multer = require("multer");
var router = express.Router();
var name = '';//保存用户名
var password;//保存用户密码
var loginflag = true;//登陆成功标志位，如果登陆成功将设置为false，否则继续登陆
// var clientWorkSpace = globalPath + '/user';//用户的工作空间
/* GET home page. */
router.get('/', function (req, res, next) {
  if (loginflag === true) {
    console.log(loginflag);
    res.render('login', { message: '' });
  } else {
    res.render('index');
    loginflag = true;
  }
});

router.get('/login', function (req, res, next) {
  res.render('login', { message: '' });
});

const UsersArticleSchema = new mongoose.Schema({
  username: String,
  password: String
});

router.post('/login', function (req, res, next) {
  name = req.body.name;
  password = req.body.password;
  var hash = crypto.createHash('md5');
  hash.update(password);
  password = hash.digest('hex');
  /*连接数据库*/
  var conn = mongoose.createConnection(useruri);
  conn.on('connected', function (err) {
    if (err) {
      console.log('连接数据库Users失败：' + err);
    } else {
      console.log('连接数据库Users成功！');
      conn.model('articles', UsersArticleSchema);

      const UserArticle = conn.model('articles');
      UserArticle.find({ username: name, password: password }, function (err, docs) {
        if (err) {
          console.log('search database error !');
          console.log(err);
          return;
        }
        console.log(name, password);
        console.log(docs, docs.length);
        if (docs.length === 1) {
          loginflag = false;
          req.session.user = name;
          res.redirect('/');
          //根据登陆用户创建用户的工作空间
          if (!clientDir.existsSync('./client/public/users/' + name)) {
            console.log('create dir:', './client/public/users/' + name);
            clientDir.mkdir('./client/public/users/' + name, function (err) {
              if (err) {
                return console.error(err);
              }
              console.log("工程目录创建成功!");
            });
          }
        } else {
          res.render('login', { message: '用户名或者密码错误' });
          return;
        }
      });
    }
  });
});

module.exports = router;
