require(["dojo/parser", "dijit/MenuItem", "dojo/domReady!"], function (parser, MenuItem) {
	//------------------------工程重命名--------------------------
	remanePro.onClick = function () {
		console.log(treeNodeBuffer.name, 'rename Project !');
		rMenu.css({ "visibility": "hidden" });
		renameProDlg.show();
	}

	renameProOk.onClick = function () {
		var proName = $('#renameProject').val().trim();
		console.log(proName);
		if (!proName) { //工程名不能为空
			alert('请填写工程名!');
		} else {
			renameProDlg.hide();
			var params = {
				'name': proName
			};
			var proexist = true;
			//此处向服务器发送更新节点信息
			$.ajax({
				url: "http://localhost:3000/tree/searchPro",
				type: "post",
				dataType: "json",
				async: false, //此处一定要为同步,否则下面ajax代码无条件执行
				data: params,
				success: function (response) {
					if (response.message === 'ok') {
						proexist = false;
						console.log(response.message);
					} else {
						proexist = true;
						alert(response.message);
					}
				},
				error: function () {
					console.log('rename project fail !');
				}
			});
			//正式重命名,上面只是查询是否重名
			if (!proexist) {
				proexist = true;
				$.ajax({
					url: "http://localhost:3000/tree/renamePro",
					type: "post",
					dataType: "json",
					data: params,
					success: function (response) {
						if (response.message === 'rename ok') {
							console.log(response.message);
							//更新树根节点
							(zTree.getNodes())[0].name = proName;
							zTree.updateNode((zTree.getNodes())[0]);
						} else {
							alert(response.message);
						}
					},
					error: function () {
						console.log('rename project fail !');
					}
				});
			}
		}
	}
	//------------------------删除工程--------------------------
	deletePro.onClick = function () {
		console.log(treeNodeBuffer.name, 'delete Project !');
		rMenu.css({ "visibility": "hidden" });
		delProDlg.show();
	}

	delProOk.onClick = function () {
		//关闭对话框
		delProDlg.hide();
		//关闭所有tab
		var children = onCloseEx.getChildren(); //获取tab容器里的所有tab
		//遍历子元素，如果传入需要打开的标签已经存在了，那么选中，并直接返回
		for (var i = 0; i < children.length; i++) {
			onCloseEx.removeChild(children[i]);
		}
		//关闭所有tree
		zTree.hideNode((zTree.getNodes())[0]);
		//发送给服务器删除工程信息
		$.ajax({
			url: "http://localhost:3000/tree/delProj",
			type: "post",
			dataType: "json",
			data: {
				project: treeNodeBuffer.name
			},
			success: function (response) {
				if (response.message === 'del ok') {
					alert('删除工程成功!');
				} else {
					alert('删除错误!');
				}
			},
			error: function () {
				console.log('删除工程出错 !');
			}
		});
	}
	//------------------------删除文件--------------------------
	deleteFile.onClick = function () {
		console.log(treeNodeBuffer.name, 'delete File !');
		rMenu.css({ "visibility": "hidden" });
		delFileDlg.show();
	}

	delFileOk.onClick = function () {
		$.ajax({
			url: "http://localhost:3000/tree/delFile",
			type: "post",
			dataType: "json",
			data: {
				filename: (treeNodeBuffer.name.split('('))[0]
			},
			success: function (response) {
				if (response.message === 'del ok') {
					delFileDlg.hide();
					alert('删除文件成功!');
					var children = onCloseEx.getChildren(); //获取tab容器里的所有tab
					//遍历子元素，如果传入需要打开的标签已经存在了，那么选中，并直接返回
					for (var i = 0; i < children.length; i++) {
						if (treeNodeBuffer.name === children[i].title) {
							onCloseEx.removeChild(children[i]);
						}

					}
					var nodes = zTree.getSelectedNodes();
					var treeNode = nodes[0];
					zTree.removeNode(treeNode);
					(zTree.getNodes())[0].isParent = true;//显示根节点图标为文件夹
					zTree.refresh();

				} else {
					alert('删除文件错误!');
				}
			},
			error: function () {
				console.log('删除文件出错 !');
			}
		});
	}

	//------------------------下载文件--------------------------
	downloadFile.onClick = function () {
		console.log(treeNodeBuffer.name, 'download File !');
		rMenu.css({ "visibility": "hidden" });
		var url = 'http://localhost:3000/tree/download?filename=' + (treeNodeBuffer.name.split('('))[0] + '.' + (((treeNodeBuffer.name.split('('))[1]).split(')'))[0];
		console.log(url);
		// 转换完成，创建一个a标签用于下载
		var a = document.createElement('a');
		a.download = url;
		a.href = url;
		$("body").append(a); // 修复firefox中无法触发click
		a.click();
		$(a).remove();
	}
});