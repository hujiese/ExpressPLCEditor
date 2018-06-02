var express = require('express');
const mongoose = require('mongoose');
var fs = require("fs"); //文件操作
const http = require("http");
var router = express.Router();

/*约束文档*/
const ArticleSchema = new mongoose.Schema({
    name: String,
    inUse: Boolean,
    path: String,
    files: [{
        name: String,
        path: String,
        fileType: String,
        relLanguage: String,
        isSave: Boolean,
        resource: String
    }]
});

//重命名工程
router.post('/searchPro', function (req, res, next) {
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' + req.session.user);
    connPro.on('connected', function (err) {
        if (err) {
            console.log('连接用户数据库失败：' + err);
        } else {
            connPro.model('ProArticle', ArticleSchema);
            const ProArticle = connPro.model('ProArticle');
            ProArticle.find({
                name: req.body.name
            }, function (err, docs) {
                if (err) {
                    console.log('search database error !');
                    console.log(err);
                    res.send({
                        message: 'search database error !'
                    }); //返回请求数据
                    return;
                }

                if (docs[0] && docs[0].name) { //判断工程是否存在，如果存在则返回不创建
                    console.log('project has been existed ，please use other name !');
                    res.send({
                        message: 'project has been exist, please use another name !'
                    });
                } else {
                    res.send({
                        message: 'ok'
                    });
                }

            });
        }
    });
});

//重命名工程
router.post('/renamePro', function (req, res, next) {
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' + req.session.user);
    connPro.on('connected', function (err) {
        if (err) {
            console.log('连接用户数据库失败：' + err);
        } else {
            connPro.model('ProArticle', ArticleSchema);
            const ProArticle = connPro.model('ProArticle');
            //查找正在使用的工程并修改工程名
            ProArticle.find({
                inUse: true
            }, function (err, docs) {
                if (err) {
                    console.log('save failed');
                    console.log(err);
                    return;
                }
                var oldProName = docs[0].name;
                var oldProPath = docs[0].path;
                docs[0].name = req.body.name;
                docs[0].path = docs[0].path.replace(new RegExp(oldProName, 'g'), docs[0].name); //修改工程路径
                fs.rename('.' + oldProPath, '.' + docs[0].path, function (err) {
                    if (err) {
                        console.log('重命名出错: ', err);
                        return;
                    }
                });
                docs[0].files.forEach(function (value) {
                    value.path = value.path.replace(new RegExp(oldProName, 'g'), docs[0].name); //修改工程下文件路径
                    value.resource = value.resource.replace(new RegExp(oldProName, 'g'), docs[0].name); //修改工程下文件Resource路径
                });
                docs[0].save();
                //console.log('result: ' + docs);
                res.send({
                    message: 'rename ok'
                });

            });
        }
    });
});


//递归删除目录及子目录下所有文件
function deleteall(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse  
                deleteall(curPath);
            } else { // delete file  
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

//删除工程
router.post('/delProj', function (req, res, next) {
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' + req.session.user);
    connPro.on('connected', function (err) {
        if (err) {
            console.log('连接用户数据库失败：' + err);
        } else {
            connPro.model('ProArticle', ArticleSchema);
            const ProArticle = connPro.model('ProArticle');
            //查找正在使用的工程并删除工程
            ProArticle.remove({
                inUse: true
            }, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('remove ok');
                }
            });
        }
    });
    deleteall('./client/public/users/' + req.session.user + '/' + req.body.project);
    res.send({
        message: 'del ok'
    });
});

//删除文件
router.post('/delFile', function (req, res, next) {
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' + req.session.user);
    connPro.on('connected', function (err) {
        if (err) {
            console.log('连接用户数据库失败：' + err);
        } else {
            connPro.model('ProArticle', ArticleSchema);
            const ProArticle = connPro.model('ProArticle');
            //查找正在使用的工程中某个文件并删除
            ProArticle.find({
                inUse: true
            }, function (err, docs) {
                if (err) {
                    console.log('save failed');
                    console.log(err);
                    return;
                }

                for (var i = 0; i < docs[0].files.length; i++) {
                    if (docs[0].files[i].name === req.body.filename) {
                        var filePath = './client/public/users/' + req.session.user + '/' + docs[0].name + '/' + req.body.filename + '.html';
                        var resourcePath = './client/public/users/' + req.session.user + '/' + docs[0].name + '/Resource/' + req.body.filename + '.' + docs[0].files[i].relLanguage;
                        console.log(filePath);
                        console.log(resourcePath);
                        console.log('result: ' + docs);
                        fs.unlink(filePath, function (err) {
                            if (err) {
                                return console.error(err);
                            }
                            console.log("文件删除成功！");
                        });
                        fs.unlink(resourcePath, function (err) {
                            if (err) {
                                return console.error(err);
                            }
                            console.log("文件删除成功！");
                        });
                        docs[0].save();
                        docs[0].files.splice(i, 1);
                    }
                }
            });
            res.send({
                message: 'del ok'
            });
        }
    });
});

//下载文件
router.get('/download', function (req, res, next) {
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' + req.session.user);
    connPro.on('connected', function (err) {
        if (err) {
            console.log('连接用户数据库失败：' + err);
        } else {
            connPro.model('ProArticle', ArticleSchema);
            const ProArticle = connPro.model('ProArticle');
            //查找正在使用的工程中某个文件
            ProArticle.find({
                inUse: true
            }, function (err, docs) {
                if (err) {
                    console.log(err);
                    return;
                }
                for (var i = 0; i < docs[0].files.length; i++) {
                    if (docs[0].files[i].name === (req.query.filename.split('.'))[0]) {
                        var resourcePath = './client/public/users/' + req.session.user + '/' + docs[0].name + '/Resource/' + req.query.filename;
                        console.log(resourcePath);
                        res.download(resourcePath, function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                        });
                    }
                }

            });
        }
    });

});

router.get('/', function (req, res, next) {
    res.send('respond with a resource of file');
});

module.exports = router;