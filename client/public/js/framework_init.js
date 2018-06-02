var zTree, rMenu;
var treeNodeBuffer;
dojoConfig = {
    async: true,
    parseOnLoad: false
}
require(["dojo/parser", "dijit/layout/TabContainer", "dijit/layout/ContentPane", "dojo/domReady!"], function (parser, TabContainer, ContentPane) {
    parser.parse();
    //增加tab
    function addTab(name, url) {
        //先判断tab容器里面有没有tab
        if (onCloseEx.hasChildren()) {
            var children = onCloseEx.getChildren(); //获取tab容器里的所有tab
            //遍历子元素，如果传入需要打开的标签已经存在了，那么选中，并直接返回
            for (var i = 0; i < children.length; i++) {
                if (name === children[i].title) {
                    onCloseEx.selectChild(children[i], true);
                    return;
                }
            }
        }
        //如果tab容器没有tab或者没有打开，那么创建一个tabPane，嵌入网页并添加到tab容器中
        var pane = new ContentPane({
            style: 'padding:0px;display:none;overflow: hidden;',
            title: name,
            content: '<iframe src=' + url + ' frameborder="0" scrolling="auto" width="100%" height="100%"></iframe>',
            closable: true
        });
        onCloseEx.addChild(pane);
        onCloseEx.selectChild(pane, true);
    }

    var treeData = [];
	$.ajax({
		url: "http://localhost:3000/file/loadPro",
		type: "post",
		dataType: "json",
		data: {},
		success: function(response) {
			if(response.hasOwnProperty('message')) {
				//alert(response.message);
			} else {
				var childrens = [];
				for(var i = 0; i < response[0].files.length; i++) {
					childrens[i] = {
                        name: response[0].files[i].name + '(' + response[0].files[i].relLanguage + ')',
                        link: response[0].files[i].path + '/' + response[0].files[i].name + '.html'
					}
				}
				console.log(childrens);
                (zTree.getNodes())[0].name =  response[0].name;
                (zTree.getNodes())[0].children = childrens;
                zTree.refresh();
			}
		},
		error: function() {
			console.log('Load Project fail !');
		}
    });
    
    //初始化树菜单数据
    var setting = {};
    var zNodes = [
         {
         name: "",
         open: true,
         children: [
            //  {
    //         name: "PLC1(ST)",
    //         link: '/users/jack/PLC0/DEMO0.html'
    //     },
    //     {
    //         name: "PLC2(IL)",
    //         link: 'welcome.html'
    //     },
    //     {
    //         name: "PLC3(CPP)",
    //         link: 'welcome.html'

    //     }
        ]}
];

    //为树添加点击事件等回调方法
    var setting = {
        callback: {
            onClick: onClick,
            onRightClick: OnRightClick
        }
    };

    //树菜单显示方法
    function showRMenu(type, x, y) {
        $("#rMenu ul").show();
        if (type=="root") {
            $("#remanePro").show();
            $("#deletePro").show();
            $("#deleteFile").hide();
            $("#downloadFile").hide();
        } else {
            $("#remanePro").hide();
            $("#deletePro").hide();
            $("#deleteFile").show();
            $("#downloadFile").show();
        }
        y += document.body.scrollTop;
        x += document.body.scrollLeft;
        rMenu.css({
            "top": y + "px",
            "left": x + "px",
            "visibility": "visible"
        });

        $("body").bind("mousedown", onBodyMouseDown);
    }
    //树菜单右键事件回调方法
    function OnRightClick(event, treeId, treeNode) {
        treeNodeBuffer = treeNode;
        if(!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0){
            //do nothing...
        }else if (treeNode.children) {
            zTree.cancelSelectedNode();
            showRMenu("root", event.clientX, event.clientY);
        } else {
            zTree.selectNode(treeNode);
            showRMenu("node", event.clientX, event.clientY);
        }
    }

    //树菜单点击回调方法
    function onClick(event, treeId, treeNode, clickFlag) {
        if (!treeNode.children) {
            addTab(treeNode.name, treeNode.link);
        }
    }

    function hideRMenu() {
        if (rMenu) rMenu.css({
            "visibility": "hidden"
        });
        $("body").unbind("mousedown", onBodyMouseDown);
    }

    //主UI其他地方点击触发方法，将隐藏右键菜单
    function onBodyMouseDown(event) {
        if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length > 0)) {
            rMenu.css({
                "visibility": "hidden"
            });
        }
    }
    //初始化树菜单
    $.fn.zTree.init($("#treeDemo"), setting, zNodes);
    zTree = $.fn.zTree.getZTreeObj("treeDemo");
    rMenu = $("#rMenu");

});