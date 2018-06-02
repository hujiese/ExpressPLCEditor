require(["dojo/store/Memory", "dijit/form/FilteringSelect", "dojo/domReady!"], function (Memory, FilteringSelect) {
		//-----------------------------创建工程----------------------------//
		//弹出“创建工程”对话框
		newPro.onClick = function () {
			console.log('new Project !');
			newProject.show();
		}
	
		//“确认”创建工程
		newProjectOk.onClick = function () {
			console.log($('#proName').val().trim());
			if (!$('#proName').val().trim()) { //工程名不能为空
				alert('请填写工程名');
			} else {
				newProject.hide();
				var params = {
					'name': $('#proName').val()
				};
				//			response数据格式: {
				//				name: project_name,
				//				inUse: true,
				//				path: '/Users/User/Projects/' + project_name,
				//				files: []
				//			}
				$.ajax({
					url: "http://localhost:3000/file/newProject",
					type: "post",
					dataType: "json",
					data: params,
					success: function (response) {
						if (response.hasOwnProperty('message')) {
							alert(response.message);
						} else {
	
							alert('创建成功!');
							var treeData = [{
								name: $('#proName').val(),
								open: true,
								children: []
							}];
							var children = onCloseEx.getChildren(); //获取tab容器里的所有tab
							//遍历子元素，如果传入需要打开的标签已经存在了，那么选中，并直接返回
							for (var i = 0; i < children.length; i++) {
								onCloseEx.removeChild(children[i]);
							}
							console.log('zTree', (zTree.getNodes())[0].name);
							(zTree.getNodes())[0].name = $('#proName').val();
							(zTree.getNodes())[0].children = [];
							zTree.showNode((zTree.getNodes())[0]);
							zTree.refresh();
						}
						console.log('response', response);
					},
					error: function () {
						console.log('create project fail !');
					}
				});
			}
		}
	
		//-----------------------------打开工程----------------------------//
		var stateStore = new Memory({
			data: [
				{ name: "", id: "" },
			]
		});
		var filteringSelect = new FilteringSelect({
			id: "openProSelect",
			name: "state",
			value: "CA",
			store: stateStore,
			searchAttr: "name"
		}, "openProSelect");
	
		openPro.onClick = function () {
			console.log('open Project !');
			openProDlg.show();
			//此处异步加载工程数据,加载工程列表
			$.ajax({
				url: "http://localhost:3000/file/projectList",
				type: "post",
				dataType: "json",
				data: {},
				success: function (response) {
					if (response.hasOwnProperty('message')) {
						alert(response.message);
					} else {
						stateStore.data = [];
						var projects = response.project;
						for (var i = 0; i < projects.length; i++) {
							var tempInfo = { name: "", id: "" };
							tempInfo.name = projects[i];
							tempInfo.id = projects[i];
							stateStore.data[i] = tempInfo;
						}
						filteringSelect.startup();
					}
				},
				error: function () {
					console.log('open project fail !');
				}
			});
	
	
		}
	
		openProOk.onClick = function () {
			var projectName = dijit.byId('openProSelect').get('displayedValue')
			if (projectName !== '') {
				//获取到选中的工程名字
				console.log('project name:', projectName);
				openProDlg.hide();
				$.ajax({
					url: "http://localhost:3000/file/openPro",
					type: "post",
					dataType: "json",
					data: {
						project: projectName
					},
					success: function (response) {
						if (response.hasOwnProperty('message')) {
							alert(response.message);
						} else {
							var childrens = [];
							for (var i = 0; i < response[0].files.length; i++) {
								childrens[i] = {
									name: response[0].files[i].name + '(' + response[0].files[i].relLanguage + ')',
									link: response[0].files[i].path + '/' + response[0].files[i].name + '.html'
								}
							}
							console.log(childrens);
							var children = onCloseEx.getChildren(); //获取tab容器里的所有tab
							//遍历子元素，如果传入需要打开的标签已经存在了，那么选中，并直接返回
							for (var i = 0; i < children.length; i++) {
								onCloseEx.removeChild(children[i]);
							}
							(zTree.getNodes())[0].name = response[0].name;
							(zTree.getNodes())[0].children = childrens;
							zTree.showNode((zTree.getNodes())[0]);
							zTree.refresh();
						}
					},
					error: function () {
						console.log('open project fail !');
					}
				});
			}
		}
		//-----------------------------关闭工程----------------------------//
		closePro.onClick = function () {
			console.log('close Project !');
			var children = onCloseEx.getChildren(); //获取tab容器里的所有tab
			//遍历子元素，如果传入需要打开的标签已经存在了，那么选中，并直接返回
			for (var i = 0; i < children.length; i++) {
				onCloseEx.removeChild(children[i]);
			}
			zTree.hideNode((zTree.getNodes())[0]);
	
			$.ajax({
				url: "http://localhost:3000/file/closePro",
				type: "post",
				dataType: "json",
				data: {},
				success: function (response) {
					if (response.hasOwnProperty('message')) {
						alert(response.message);
					}
					console.log(response);
				},
				error: function () {
					console.log('close project fail !');
				}
			});
		}
	
		//-----------------------------创建文件----------------------------//
		newFile.onClick = function () {
			console.log('new File !');
			createFile.show();
		}
	
		newFileOk.onClick = function () {
			var fileName = $('#fileName').val().trim();
			var fileTypeValue = fileType.get('value');
			var fileTypeDisplayedValue = fileType.get('displayedValue');
			var relLanguageValue = relLanguage.get('value');
			var relLanguageDisplayedValue = relLanguage.get('displayedValue');
			console.log('file name: ', fileName);
			console.log('file type: ', fileTypeValue, fileTypeDisplayedValue);
			console.log('realize language: ', relLanguageValue, relLanguageDisplayedValue);
			if (fileName && fileTypeDisplayedValue && relLanguageDisplayedValue) {
				createFile.hide();
				var params = {
					'name': fileName,
					'type': fileTypeValue,
					'language': relLanguageValue
				};
				console.log(params);
				$.ajax({
					url: "http://localhost:3000/file/newFile",
					type: "post",
					dataType: "json",
					data: params,
					success: function (response) {
						if (response.hasOwnProperty('message')) {
							alert(response.message);
						} else {
							alert('创建文件成功!');
							var childrens = [];
							for (var i = 0; i < response[0].files.length; i++) {
								childrens[i] = {
									name: response[0].files[i].name + '(' + response[0].files[i].relLanguage + ')',
									link: response[0].files[i].path + '/' + response[0].files[i].name + '.html'
								}
							}
							console.log(childrens);
							(zTree.getNodes())[0].name = response[0].name;
							(zTree.getNodes())[0].children = childrens;
							zTree.refresh();
						}
					},
					error: function () {
						console.log('create file fail !');
					}
				});
			} else {
				console.log('请填写信息!');
				alert('请填写信息!');
			}
		}
	
		//-----------------------------上传GIT----------------------------//
		putToGit.onClick = function () {
			console.log('push Project to GIT !');
			pushGitDlg.show();
		}

		    //----------------------------------------上传本地文件------------------------------
			$('#file_upload').change(function () {
				var file = $("#file_upload").get(0).files[0];
				console.log("文件:" + file);
				console.log("Path:" + file.path);
				console.log("文件名:" + file.name);
				console.log("文件类型:" + file.type);
				console.log("文件大小:" + file.size);
				//创建一个FormDate
				var formData = new FormData();
				//将文件信息追加到其中
				formData.append('file', file);
				//利用split切割，拿到上传文件的格式
				var src = file.name,
					formart = src.split(".")[1];
				//使用if判断上传文件格式是否符合                                                          
				if (formart === 'cpp' || formart === 'st' || formart === 'il' || formart === 'xml' ||
					formart === 'CPP' || formart === 'ST' || formart === 'IL' || formart === 'XML') {
					//只有满足以上格式时，才会触发ajax请求
					$.ajax({
						url: '/file/upload',
						type: 'POST',
						data: formData,
						cache: false,
						contentType: false,
						processData: false,
						success: function (response) {
							alert('上传成功');
							var childrens = [];
							for (var i = 0; i < response[0].files.length; i++) {
								childrens[i] = {
									name: response[0].files[i].name + '(' + response[0].files[i].relLanguage + ')',
									link: response[0].files[i].path + '/' + response[0].files[i].name + '.html'
								}
							}
							console.log(childrens);
							(zTree.getNodes())[0].name = response[0].name;
							(zTree.getNodes())[0].children = childrens;
							zTree.refresh();
						},
						error: function () {
							console.log('upload fail !');
						}
					});
				} else { //不满足上传格式时 
					alert("文件格式不支持上传");
				}
			});
		
		upload.onClick = function () {
			console.log('上传本地文件');
			$('#file_upload').click();
		};
	});