## 安装和使用Express PLC Editor Server Framework ##

### 1.安装Node.js ###
这里使用的操作系统版本为Window10,当然其他操作系统版本也类似，参考下面这篇文章在各个平台上安装Node.js的不同版本：
> http://www.runoob.com/nodejs/nodejs-install-setup.html

注意：推荐安装node-v8.9.0及其以上稳定版本，低版本运行npm install安装Node模块可能会出现模块丢失情况

### 2.安装MongoDB ###

Windows下MongoDB的安装可以参考这篇文章：
>http://www.runoob.com/mongodb/mongodb-window-install.html

Linux下MongoDB的安装可以参考这篇文章：
>http://www.runoob.com/mongodb/mongodb-linux-install.html

MacOS下MongoDB的安装可以参考这篇文章：
>http://www.runoob.com/mongodb/mongodb-osx-install.html

建议安装MongoDB可视化工具Robo 3T，下载地址见官网:
>https://robomongo.org/

MongoDB安装成功后打开Robo 3T:
![](https://i.imgur.com/8n88Cqb.png)

创建一个数据库叫users:

![](https://i.imgur.com/w2H928e.png)

然后默认文档里面插入一条数据：

	/* 1 */
	{
    	"_id" : ObjectId("5aaf7d4df5bf5527d0f5219d"),
    	"username" : "jack",
    	"password" : "66cb87e4e66a825d10cf4227e0e82eee"
	}

### 3.解压运行###

确保Node.js安装成功后，下载工程的压缩文件，解压后进入，一开始里面的目录是这样的：

![](https://i.imgur.com/o7ipMSb.png)
然后在此目录下使用命令:

	npm install
	npm install mongoose

然后你的文件夹会变成这样：

![](https://i.imgur.com/AiFOrqq.png)

可以看到，多了一个node_modules文件夹，接下来输入命令:

	node app.js

如果一切顺利，可以看到命令行输出如下：

	listening port 3000

这时可以打开浏览器，输入如下URL来运行Editor：

> http://localhost:3000/

![](https://i.imgur.com/E8qMR7R.png)

输入
>jack

>jack123456

点击“登录”即可使用：
![](https://i.imgur.com/50gIMzI.png)

![](https://i.imgur.com/SjcKViH.png)

![](https://i.imgur.com/lf7sL3n.png)