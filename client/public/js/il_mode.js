//c++文件的保存等操作
$(function() {
	// trigger extension
	ace.require("ace/ext/language_tools"); //加载依赖
	var editor = ace.edit("editor"); //创建editor
	editor.session.setMode("ace/mode/assembly_x86"); //设置文件类型
	editor.setTheme("ace/theme/xcode"); //设置编辑器主题
	editor.setValue("the new text here"); //设置默认内容
	console.log(editor.getValue()); //打印获取内容
	document.getElementById('editor').style.fontSize = '14px'; //修改字体大小
	// enable autocompletion and snippets
	//editor.setAutoScrollEditorIntoView(true);
	editor.setOptions({
		enableBasicAutocompletion: true,
		enableSnippets: true,
		enableLiveAutocompletion: false
	});
	//获取该Html的文件名
	var str = window.location.href;
	str = str.substring(str.lastIndexOf("/") + 1);
	str = str.substring(0, str.lastIndexOf("."));
	console.log(str);

	$.ajax({
		url: "http://localhost:3000/file/loadFile",
		type: "post",
		dataType: "json",
		data: {
			name: str
		},
		success: function(response) {
			editor.setValue(response.message);
		},
		error: function() {
			console.log('load file fail !');
		}
	});

	/*
	 * 监听所有事件
	 * insert: 插入事件
	 * remove: 删除事件
	 */
	editor.getSession().on('change', function(e) {
		if(e.action === 'insert') {
			console.log('插入内容');
		}
		if(e.action === 'remove') {
			console.log('删除内容');
		}
	});

	//保存文件
	function save() {
		var params = {
			name: str,
			content: editor.getValue()
		};
		//ctrl + s 保存文件
		$.ajax({
			url: "http://localhost:3000/file/saveFile",
			type: "post",
			dataType: "json",
			data: params,
			success: function(response) {
				console.log(response.message);
			},
			error: function() {
				console.log('save file fail !');
			}
		});
	}
	
	/*
	 * 监听快捷键，这里为保存按键
	 */
	editor.commands.addCommand({
		name: 'save',
		bindKey: {
			win: 'Ctrl-S',
			mac: 'Ctrl-S'
		},
		exec: function(editor) {
			console.log(editor.getValue()); //获取文本内容并打印 	
			save();
		},
		readOnly: false // 如果不需要使用只读模式，这里设置false
	});
	
	setInterval(save, 600 * 1000); // 十分钟自动保存一次 

});