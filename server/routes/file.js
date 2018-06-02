var express = require('express');
const mongoose = require('mongoose');
var fs = require("fs"); //文件操作
const http = require("http");
const multer = require("multer");
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

/*创建工程项目请求*/
router.post('/newProject', function (req, res, next) {
    var project_name = req.body.name; //获取到请求创建的工程名
    // console.log('project name : ', project_name);
    console.log('------------------name--------------------');
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' +  req.session.user);
    // console.log('------------------end--------------------');
    connPro.on('connected', function (err) {
        if (err) {
            console.log('连接用户数据库失败：' + err);
        } else {
            console.log('连接用户数据库成功！');
            connPro.model('ProArticle', ArticleSchema);
            const ProArticle = connPro.model('ProArticle');
            ProArticle.find({
                name: project_name
            }, function (err, docs) {
                if (err) {
                    console.log('search database error !');
                    console.log(err);
                    res.send({
                        message: 'search database error !'
                    }); //返回请求数据
                    return;
                } else if (docs[0] && docs[0].name) { //判断工程是否存在，如果存在则返回不创建
                    console.log('project has been existed !');
                    res.send({
                        message: 'project has been existed !'
                    }); //返回请求数据
                } else {
                    //创建工程项并插入到数据库中
                    console.log('nodejs: ', project_name);
                    var pro_info = {
                        name: project_name,
                        inUse: true,
                        path: '/client/public/users/' +  req.session.user + '/' + project_name,
                        files: []
                    }
                    //创建并保存一个工程方法
                    var art = new ProArticle(pro_info);
                    art.save(function (err) {
                        if (err) {
                            console.log('save failed');
                            console.log(err);
                            res.send({
                                message: 'create project fail !'
                            }); //返回请求数据
                            return;
                        } else {
                            res.send(pro_info); //返回请求数据
                            console.log('save success');
                            fs.mkdirSync('./client/public/users/' +  req.session.user + '/' + project_name, function (err) {
                                if (err) {
                                    return console.error(err);
                                }
                                console.log("工程目录创建成功!");
                            });
                            fs.mkdirSync('./client//public/users/' +  req.session.user + '/' + project_name + '/Resource', function (err) {
                                if (err) {
                                    return console.error(err);
                                }
                                console.log("工程资源目录创建成功!");
                            });
                        }
                    });
                }

            });
            //将该工程之外的所有工程设置为不在使用
            ProArticle.find({}, function (err, docs) {
                if (err) {
                    console.log('search database error !');
                    console.log(err);
                    res.send({
                        message: 'search database error !'
                    }); //返回请求数据
                    return;
                }
                for (var i = 0; i < docs.length; i++) {
                    if (docs[i].name !== project_name) {
                        docs[i].inUse = false;
                        docs[i].save();
                    } else {
                        docs[i].inUse = true;
                        docs[i].save();
                    }
                }
            });
        }
    });
});

/*创建项目文件请求*/
router.post('/newFile', function (req, res, next) {
    // var connNewFile = mongoose.createConnection('mongodb://localhost:27017/' + name);
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' +  req.session.user);
    connPro.on('connected', function (err) {
        var fileName = req.body.name; //获取到请求创建的文件名
        var fileType = req.body.type; //获取程序类型 (程序，功能块，函数)	
        var language = req.body.language; //获取文件类型(ST,IL,SFC,LD,FBD)
        /*	if(fileType === 'LD' || fileType === 'FBD' || fileType === 'SFC'){
                fileType = 'xml';
            }
            if(fileType === 'ST' || fileType === 'IL' || fileType === 'cpp'){
                fileType = req.body.fileType; //获取文件类型(ST,IL,SFC,LD,FBD)
            }*/
        connPro.model('ProArticle', ArticleSchema);
        const ProArticle = connPro.model('ProArticle');
        var fileIsExist = false;
        // connNewFile.model('NewFileArticle', ArticleSchema);
        // const NewFileArticle = connNewFile.model('NewFileArticle');
        ProArticle.find({ inUse: true }, function (err, docs) {
            if (err) {
                console.log('search database error !');
                console.log(err);
                res.send({
                    message: 'search database error !'
                }); //返回请求数据
                return;
            }else if (docs[0] && docs[0].name) { //判断工程是否存在，如果存在则返回不创建
                fileIsExist = false;
                //判断创建的文件名是否冲突，如果文件已经存在则创建失败
                docs[0].files.forEach(function (value) {
                    if (value.name === fileName) {
                        fileIsExist = true;
                        console.log('file has been existed !');
                        res.send({
                            message: 'file has been existed !'
                        }); //返回请求数据
                    }
                });

                if (!fileIsExist) {
                    //文件如果不存在，创建之
                    var proName = docs[0].name;
                    var filePath ='/users/' +  req.session.user  + '/' + proName;
                    var resource ='/users/' +  req.session.user + '/' + proName + '/Resource';
                    docs[0].files.push({
                        name: fileName,
                        path: filePath,
                        fileType: fileType,
                        relLanguage: language,
                        isSave: false,
                        resource: resource
                    });
                    docs[0].save();
                    res.send(docs); //创建成功，返回工程json数据
                    fs.open('./client/public/users/' +  req.session.user + '/' + proName + '/' + fileName + '.html', 'a+', function (err, fd) {
                        if (err) {
                            return console.error(err);
                        }
                        console.log("文件打开成功！");
                        fs.close(fd, function (err) {
                            if (err) {
                                console.log(err);
                            }
                            console.log("文件关闭成功");
                        });
                    });

                    if (language === 'CPP') {
                        fs.readFile('./client/public/model/cpp_model_file.html', function (err, data) {
                            if (err) {
                                return console.error(err);
                            }
                            fs.writeFile('./client/public/users/' +  req.session.user + '/' + proName + '/' + fileName + '.html', data.toString(), function (err) {
                                if (err) {
                                    return console.error(err);
                                }
                                console.log("数据写入成功！");

                            });
                        });
                    } else if (language === 'IL') {
                        fs.readFile('./client/public/model/il_model_file.html', function (err, data) {
                            if (err) {
                                return console.error(err);
                            }
                            fs.writeFile('./client/public/users/' +  req.session.user + '/' + proName + '/' + fileName + '.html', data.toString(), function (err) {
                                if (err) {
                                    return console.error(err);
                                }
                                console.log("数据写入成功！");

                            });
                        });
                    } else if (language === 'ST') {
                        fs.readFile('./client/public/model/st_model_file.html', function (err, data) {
                            if (err) {
                                return console.error(err);
                            }
                            fs.writeFile('./client/public/users/' +  req.session.user + '/' + proName + '/' + fileName + '.html', data.toString(), function (err) {
                                if (err) {
                                    return console.error(err);
                                }
                                console.log("数据写入成功！");

                            });
                        });
                    } else if (language === 'LD' || language === 'FBD' || language === 'SFC') {
                        fs.readFile('./client/public/model/graphEditor.html', function (err, data) {
                            if (err) {
                                return console.error(err);
                            }
                            fs.writeFile('./client/public/users/' +  req.session.user + '/' + proName + '/' + fileName + '.html', data.toString(), function (err) {
                                if (err) {
                                    return console.error(err);
                                }
                                console.log("数据写入成功！");

                            });
                        });
                    }
                    fs.open('./client/public/users/' +  req.session.user + '/' + proName + '/Resource/' + fileName + '.' + language, 'a+', function (err, fd) {
                        if (err) {
                            return console.error(err);
                        }
                        console.log("文件打开成功！");
                        fs.close(fd, function (err) {
                            if (err) {
                                console.log(err);
                            }
                            console.log("文件关闭成功");
                        });
                    });
                }

            } else {
                console.log('Unkonwn error: The project is not in use !');
                res.send({
                    message: 'Unkonwn error: The project is not in use !'
                });
            }
        });
    });
});

// ctrl + s保存文件
router.post('/saveFile', function(req, res, next) {
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' +  req.session.user);
    connPro.on('connected', function (err) {
        connPro.model('ProArticle', ArticleSchema);
        const ProArticle = connPro.model('ProArticle');
        ProArticle.find({ inUse: true }, function (err, docs) {
            if(err) {
                console.log(err);
                return;
            }
            for(var i = 0; i < docs[0].files.length; i++) {
                if(docs[0].files[i].name === req.body.name) {
                    var resourcePath = '.' + docs[0].path + '/Resource/' + docs[0].files[i].name + '.' + docs[0].files[i].relLanguage;
                    console.log(resourcePath);
                    fs.writeFile(resourcePath, req.body.content, function(err) {
                        if(err) {
                            return console.error(err);
                        }
                        console.log("数据写入成功！");
    
                    });
                    docs[0].files[i].isSave = true; //设置为保存
                    docs[0].save();
                    res.send({
                        message: 'save ok'
                    });
                }
            }
        });
    });
});

// 文件打开时加载文件内容
router.post('/loadFile', function(req, res, next) {
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' +  req.session.user);
    connPro.on('connected', function (err) {
        connPro.model('ProArticle', ArticleSchema);
        const ProArticle = connPro.model('ProArticle');
        ProArticle.find({ inUse: true }, function (err, docs) {
            if(err) {
                console.log(err);
                return;
            }
            for(var i = 0; i < docs[0].files.length; i++) {
                if(docs[0].files[i].name === req.body.name) {
                    var resourcePath = '.' + docs[0].path + '/Resource/' + docs[0].files[i].name + '.' + docs[0].files[i].relLanguage;
                    console.log('resource path: ' + resourcePath);
                    fs.readFile(resourcePath, function(err, data) {
                        if(err) {
                            console.log('read file error :' + resourcePath);
                            return console.error(err);
                        }
                        res.send({
                            message: data.toString()
                        });
                    });
                }
            }
        });
    });
});


// 编辑器打开加载未关闭的工程
router.post('/loadPro', function(req, res, next) {
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' +  req.session.user);
    connPro.on('connected', function (err) {
        connPro.model('ProArticle', ArticleSchema);
        const ProArticle = connPro.model('ProArticle');
        ProArticle.find({ inUse: true }, function (err, docs) {
            if(err) {
                console.log(err);
                return;
            }
            if(docs[0] && docs[0].name) {
                res.send(docs);
            } else {
                res.send({
                    message: 'no project in use !'
                });
            }
        });
    });
});

// 关闭工程
router.post('/closePro', function(req, res, next) {
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' +  req.session.user);
    connPro.on('connected', function (err) {
        connPro.model('ProArticle', ArticleSchema);
        const ProArticle = connPro.model('ProArticle');
        ProArticle.find({ inUse: true }, function (err, docs) {
            if(err) {
                console.log('save failed');
                console.log(err);
                return;
            }
            if(docs[0] && docs[0].inUse) {
                docs[0].inUse = false;
                docs[0].save();
            }
        });
        console.log('Project closed !');
        res.send({
            message: 'Project closed !'
        });
    });
});

// 加载工程列表
router.post('/projectList', function(req, res, next) {
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' +  req.session.user);
    connPro.on('connected', function (err) {
        connPro.model('ProArticle', ArticleSchema);
        const ProArticle = connPro.model('ProArticle');
        ProArticle.find({}, function (err, docs) {
            if(err) {
                console.log('search database error !');
                console.log(err);
                res.send({
                    message: 'search database error !'
                });
                return;
            }
            if(docs.length === 0) {
                res.send({
                    message: 'no project, please create a project !'
                });
            } else {
                var projects = [];
                for(var i = 0; i < docs.length; i++) {
                    projects[i] = docs[i].name;
                }
                console.log(projects);
                res.send({
                    project: projects
                });
            }
        });
    });
});

// 打开工程
router.post('/openPro', function(req, res, next) {
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' +  req.session.user);
    connPro.on('connected', function (err) {
        connPro.model('ProArticle', ArticleSchema);
        const ProArticle = connPro.model('ProArticle');   
        ProArticle.find({
            name: req.body.project
        }, function(err, docs) {
            if(err) {
                console.log('search database error !');
                console.log(err);
                res.send({
                    message: 'search database error !'
                }); //返回请求数据
                return;
            }
            if(docs.length > 0){
                if(docs[0].inUse) {
                    res.send({
                        message: 'The project is opening !'
                    });
                } else {
                    res.send(docs); //返回工程数据
                }
            }
        });
        //将该工程之外的所有工程设置为不在使用
        ProArticle.find({}, function(err, docs) {
            if(err) {
                console.log('search database error !');
                console.log(err);
                res.send({
                    message: 'search database error !'
                }); //返回请求数据
                return;
            }
            for(var i = 0; i < docs.length; i++) {
                if(docs[i].name !== req.body.project) {
                    docs[i].inUse = false;
                    docs[i].save();
                } else {
                    docs[i].inUse = true;
                    docs[i].save();
                }
            }
        });
    });
});

var uploadFileName;
//设置文件上传路径和文件命名
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
        var connPro = mongoose.createConnection('mongodb://localhost:27017/' +  req.session.user);
        connPro.on('connected', function (err) {
            connPro.model('ProArticle', ArticleSchema);
            const ProArticle = connPro.model('ProArticle');   
            ProArticle.find({
                inUse: true
            }, function(err, docs) {
                if(err) {
                    console.log('save failed');
                    console.log(err);
                    return;
                }
                if(docs[0] && docs[0].name) {
                    var fileExist = false;
                    docs[0].files.forEach(function(value) {
                        if(value.name === (file.originalname.split('.'))[0]) {
                            console.log('file has been exist ，please rename your file !');
                            fileExist = true;
                        }
                    });
                    if(!fileExist) {
                        //文件上传成功后会放入public下的upload文件夹 
                        cb(null, '.' + docs[0].path + '/Resource');
                        uploadFileName = file.originalname;
                        console.log('uploadFileName: ', uploadFileName);
                    }
                }
            });
        });
	},
	filename: function(req, file, cb) {
		//设置文件的名字为其原本的名字，也可以添加其他字符，来区别相同文件，例如file.originalname+new Date().getTime();利用时间来区分
		cb(null, file.originalname)
	}
});
var upload = multer({
	storage: storage
}).single('file');
//处理来自页面的ajax请求。single文件上传
router.post('/upload', function(req, res, next) {

	upload(req, res, function(err) {
    console.log('-----uploadFileName: -----', uploadFileName);
		if(err) {
			res.send({
				message: 'upload fail !'
			});
			return
        }
        var fileName = uploadFileName.split('.')[0]; //获取到请求创建的文件名
		var fileType = 'upload'; //这里设置为上传文件，由于无法知道程序类型
        var language = uploadFileName.split('.')[1]; //获取文件类型(ST,IL,SFC,LD,FBD)
        var fileIsExist = false;
        var connPro = mongoose.createConnection('mongodb://localhost:27017/' +  req.session.user);
        connPro.on('connected', function (err) {
            connPro.model('ProArticle', ArticleSchema);
            const ProArticle = connPro.model('ProArticle');
            var fileIsExist = false;
            ProArticle.find({ inUse: true }, function (err, docs) {
                if (err) {
                    console.log('search database error !');
                    console.log(err);
                    res.send({
                        message: 'search database error !'
                    }); //返回请求数据
                    return;
                }else if (docs[0] && docs[0].name) { //判断工程是否存在，如果存在则返回不创建
                    fileIsExist = false;
                    //判断创建的文件名是否冲突，如果文件已经存在则创建失败
                    docs[0].files.forEach(function (value) {
                        if (value.name === fileName) {
                            fileIsExist = true;
                            console.log('file has been existed !');
                            res.send({
                                message: 'file has been existed !'
                            }); //返回请求数据
                        }
                    });
    
                    if (!fileIsExist) {
                        //文件如果不存在，创建之
                        var proName = docs[0].name;
                        var filePath ='/users/' +  req.session.user  + '/' + proName;
                        var resource ='/users/' +  req.session.user + '/' + proName + '/Resource';
                        docs[0].files.push({
                            name: fileName,
                            path: filePath,
                            fileType: fileType,
                            relLanguage: language,
                            isSave: false,
                            resource: resource
                        });
                        docs[0].save();
                        res.send(docs); //创建成功，返回工程json数据
                        fs.open('./client/public/users/' +  req.session.user + '/' + proName + '/' + fileName + '.html', 'a+', function (err, fd) {
                            if (err) {
                                return console.error(err);
                            }
                            console.log("文件打开成功！");
                            fs.close(fd, function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                console.log("文件关闭成功");
                            });
                        });
    
                        if (language === 'CPP' || language === 'cpp') {
                            fs.readFile('./client/public/model/cpp_model_file.html', function (err, data) {
                                if (err) {
                                    return console.error(err);
                                }
                                fs.writeFile('./client/public/users/' +  req.session.user + '/' + proName + '/' + fileName + '.html', data.toString(), function (err) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                    console.log("数据写入成功！");
    
                                });
                            });
                        } else if (language === 'IL' || language === 'il') {
                            fs.readFile('./client/public/model/il_model_file.html', function (err, data) {
                                if (err) {
                                    return console.error(err);
                                }
                                fs.writeFile('./client/public/users/' +  req.session.user + '/' + proName + '/' + fileName + '.html', data.toString(), function (err) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                    console.log("数据写入成功！");
    
                                });
                            });
                        } else if (language === 'ST' || language === 'st') {
                            fs.readFile('./client/public/model/st_model_file.html', function (err, data) {
                                if (err) {
                                    return console.error(err);
                                }
                                fs.writeFile('./client/public/users/' +  req.session.user + '/' + proName + '/' + fileName + '.html', data.toString(), function (err) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                    console.log("数据写入成功！");
    
                                });
                            });
                        } else if (language === 'LD' || language === 'FBD' || language === 'SFC') {
                            fs.readFile('./client/public/model/graphEditor.html', function (err, data) {
                                if (err) {
                                    return console.error(err);
                                }
                                fs.writeFile('./client/public/users/' +  req.session.user + '/' + proName + '/' + fileName + '.html', data.toString(), function (err) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                    console.log("数据写入成功！");
    
                                });
                            });
                        }
                    }
    
                } else {
                    console.log('Unkonwn error: The project is not in use !');
                    res.send({
                        message: 'Unkonwn error: The project is not in use !'
                    });
                }
            });
        });
	})
});

//加载图形语言文件
router.post('/loadGraph', function(req, res, next) {
    //查找正在使用的工程中某个文件并保存
    var connPro = mongoose.createConnection('mongodb://localhost:27017/' +  req.session.user);
    connPro.on('connected', function (err) {
        connPro.model('ProArticle', ArticleSchema);
        const ProArticle = connPro.model('ProArticle');
        ProArticle.find({
            inUse: true
        }, function(err, docs) {
            if(err) {
                console.log(err);
                return;
            }
            for(var i = 0; i < docs[0].files.length; i++) {
                if(docs[0].files[i].name === req.body.name) {
                    // var resourcePath = project_path + docs[0].name + '/Resource/' + docs[0].files[i].name + '.' + docs[0].files[i].fileType;
                    var resourcePath = './client/public/users/' +  req.session.user + '/' + docs[0].name + '/Resource/' + docs[0].files[i].name + '.' + docs[0].files[i].relLanguage;
                        //返回工程的名字和查找文件类型
                        res.send({
                            resource:docs[0].files[i].resource,
                            proName: docs[0].name,
                            fileType: docs[0].files[i].relLanguage
                        });
                }
            }
    
        });
    });

});

/* GET file listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource of file');
});

module.exports = router;