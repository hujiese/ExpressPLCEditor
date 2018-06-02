//图形语言编辑器的初始化操作
// If connect preview is not moved away then getCellAt is used to detect the cell under
// the mouse if the mouse is over the preview shape in IE (no event transparency), ie.
// the built-in hit-detection of the HTML document will not be used in this case.
mxConnectionHandler.prototype.movePreviewAway = false;
mxConnectionHandler.prototype.waypointsEnabled = true;
mxGraph.prototype.resetEdgesOnConnect = false;
mxConstants.SHADOWCOLOR = '#C0C0C0';
var joinNodeSize = 7;
var strokeWidth = 2;

// Replaces the port image
mxConstraintHandler.prototype.pointImage = new mxImage('/images/dot.gif', 10, 10);

// Enables guides
mxGraphHandler.prototype.guidesEnabled = true;

// Alt disables guides
mxGuide.prototype.isEnabledForEvent = function (evt) {
	return !mxEvent.isAltDown(evt);
};

// Enables snapping waypoints to terminals
mxEdgeHandler.prototype.snapToTerminals = true;
// Enables connections along the outline
//mxConnectionHandler.prototype.outlineConnect = true;
//mxEdgeHandler.prototype.manageLabelHandle = true;
//mxEdgeHandler.prototype.outlineConnect = true;
//mxCellHighlight.prototype.keepOnTop = true;

// Enable rotation handle
mxVertexHandler.prototype.rotationEnabled = false;

// Uses the shape for resize previews
mxVertexHandler.prototype.createSelectionShape = function (bounds) {
	var key = this.state.style[mxConstants.STYLE_SHAPE];
	var stencil = mxStencilRegistry.getStencil(key);
	var shape = null;

	if (stencil != null) {
		shape = new mxShape(stencil);
		shape.apply(this.state);
	} else {
		shape = new this.state.shape.constructor();
	}

	shape.outline = true;
	shape.bounds = bounds;
	shape.stroke = mxConstants.HANDLE_STROKECOLOR;
	shape.strokewidth = this.getSelectionStrokeWidth();
	shape.isDashed = this.isSelectionDashed();
	shape.isShadow = false;

	return shape;
};

//显示导出xml窗口
function showModalWindow(graph, title, content, width, height) {
	var background = document.createElement('div');
	background.style.position = 'absolute';
	background.style.left = '0px';
	background.style.top = '0px';
	background.style.right = '0px';
	background.style.bottom = '0px';
	background.style.background = 'black';
	mxUtils.setOpacity(background, 50);
	document.body.appendChild(background);

	if (mxClient.IS_IE) {
		new mxDivResizer(background);
	}

	var x = Math.max(0, document.body.scrollWidth / 2 - width / 2);
	var y = Math.max(10, (document.body.scrollHeight ||
		document.documentElement.scrollHeight) / 2 - height * 2 / 3);
	var wnd = new mxWindow(title, content, x, y, width, height, false, true);
	wnd.setClosable(true);

	// Fades the background out after after the window has been closed
	wnd.addListener(mxEvent.DESTROY, function (evt) {
		graph.setEnabled(true);
		mxEffects.fadeOut(background, 50, true,
			10, 30, true);
	});

	graph.setEnabled(false);
	graph.tooltipHandler.hide();
	wnd.setVisible(true);
};

var graph;

var count = 0;
var vx = new Array();
var style;
// Switch for black background and bright styles
var invert = false;
var labelBackground;
var fontColor;
var strokeColor;
var fillColor;
var rubberband;
var keyHandler;
var editor;
var model;

function main(container) {
	// Assigns some global constants for general behaviour, eg. minimum
	// size (in pixels) of the active region for triggering creation of
	// new connections, the portion (100%) of the cell area to be used
	// for triggering new connections, as well as some fading options for
	// windows and the rubberband selection.
	mxConstants.MIN_HOTSPOT_SIZE = 16;
	mxConstants.DEFAULT_HOTSPOT = 1;
	// Defines a custom stencil via the canvas API as defined here:
	// http://jgraph.github.io/mxgraph/docs/js-api/files/util/mxXmlCanvas2D-js.html
	function CustomShape() {
		mxShape.call(this);
	};
	mxUtils.extend(CustomShape, mxShape);
	// Replaces existing actor shape
	mxCellRenderer.registerShape('customShape', CustomShape);

	// Loads the stencils into the registry
	var req = mxUtils.load('/xml/stencils.xml');
	var root = req.getDocumentElement();
	var shape = root.firstChild;

	while (shape != null) {
		if (shape.nodeType == mxConstants.NODETYPE_ELEMENT) {
			mxStencilRegistry.addStencil(shape.getAttribute('name'), new mxStencil(shape));
		}

		shape = shape.nextSibling;
	};
	mxEvent.disableContextMenu(container);

	editor = new mxEditor()
	//graph = new mxGraph(container);
	graph = editor.graph;
	model = graph.getModel()
	graph.view.scale = 1;
	graph.setPanning(true);
	graph.setConnectable(true);
	graph.setConnectableEdges(true);
	graph.setDisconnectOnMove(false);
	graph.foldingEnabled = false;

	//Maximum size
	graph.maximumGraphBounds = new mxRectangle(0, 0, 1300, 650)
	graph.border = 50;

	// Panning handler consumed right click so this must be
	// disabled if right click should stop connection handler.
	graph.panningHandler.isPopupTrigger = function () {
		return false;
	};

	// Enables return key to stop editing (use shift-enter for newlines)
	graph.setEnterStopsCellEditing(true);

	// Adds rubberband selection
	//	new mxRubberband(graph);
	rubberband = new mxRubberband(graph);
	keyHandler = new mxKeyHandler(graph);

	// Alternative solution for implementing connection points without child cells.
	// This can be extended as shown in portrefs.html example to allow for per-port
	// incoming/outgoing direction.
	graph.getAllConnectionConstraints = function (terminal) {
		var geo = (terminal != null) ? this.getCellGeometry(terminal.cell) : null;

		if ((geo != null ? !geo.relative : false) &&
			this.getModel().isVertex(terminal.cell) &&
			this.getModel().getChildCount(terminal.cell) == 0) {
			return [new mxConnectionConstraint(new mxPoint(0, 0.5), false),
			new mxConnectionConstraint(new mxPoint(1, 0.5), false)
			];
		}

		return null;
	};

	// Makes sure non-relative cells can only be connected via constraints
	graph.connectionHandler.isConnectableCell = function (cell) {
		if (this.graph.getModel().isEdge(cell)) {
			return true;
		} else {
			var geo = (cell != null) ? this.graph.getCellGeometry(cell) : null;

			return (geo != null) ? geo.relative : false;
		}
	};
	mxEdgeHandler.prototype.isConnectableCell = function (cell) {
		return graph.connectionHandler.isConnectableCell(cell);
	};

	// Installs a popupmenu handler using local function (see below).
	graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
		return createPopupMenu(graph, menu, cell, evt);
	};

	// Adds a special tooltip for edges
	graph.setTooltips(true);

	var getTooltipForCell = graph.getTooltipForCell;
	graph.getTooltipForCell = function (cell) {
		var tip = '';

		if (cell != null) {
			var src = this.getModel().getTerminal(cell, true);

			if (src != null) {
				tip += this.getTooltipForCell(src) + ' ';
			}

			var parent = this.getModel().getParent(cell);

			if (this.getModel().isVertex(parent)) {
				tip += this.getTooltipForCell(parent) + '.';
			}

			tip += getTooltipForCell.apply(this, arguments);

			var trg = this.getModel().getTerminal(cell, false);

			if (trg != null) {
				tip += ' ' + this.getTooltipForCell(trg);
			}
		}

		return tip;
	};

	if (invert) {
		container.style.backgroundColor = 'black';

		// White in-place editor text color
		mxCellEditorStartEditing = mxCellEditor.prototype.startEditing;
		mxCellEditor.prototype.startEditing = function (cell, trigger) {
			mxCellEditorStartEditing.apply(this, arguments);

			if (this.textarea != null) {
				this.textarea.style.color = '#FFFFFF';
			}
		};

		mxGraphHandler.prototype.previewColor = 'white';
	}

	// Sets the graph container and configures the editor
	editor.setGraphContainer(container);
	editor.addAction('export', function (editor, cell) {
		var textarea = document.createElement('textarea');
		textarea.style.width = '400px';
		textarea.style.height = '400px';
		var enc = new mxCodec(mxUtils.createXmlDocument());
		var node = enc.encode(editor.graph.getModel());
		textarea.value = mxUtils.getPrettyXml(node);
		console.log(textarea.value);
		showModalWindow(graph, 'XML', textarea, 410, 440);
	});

	editor.addAction('importXML', function (editor, cell) {
		var layout = new mxFastOrganicLayout(graph);
		graph.getModel().beginUpdate();
		try {
			// Loads the mxGraph file format (XML file)
			var req = mxUtils.load('/xml/fileio');
			var root = req.getDocumentElement();
			var dec = new mxCodec(root.ownerDocument);
			dec.decode(root, graph.getModel());
			// Gets the default parent for inserting new cells. This
			// is normally the first child of the root (ie. layer 0).
			var parent = graph.getDefaultParent();

			// Executes the layout
			layout.execute(parent);
		} finally {
			// Updates the display
			graph.getModel().endUpdate();
		}
	});

	//增加编辑功能
	editor.addAction('editCellName', function(editor, cell) {
		var pouClass = editor.graph.getSelectionCell().class;
		if(pouClass !== 'block') {
			$('#editPouInputs').attr("disabled", "disabled");
			$('#editPouOutputs').attr("disabled", "disabled");
		} else {
			$('#editPouInputs').removeAttr("disabled");
			$('#editPouOutputs').removeAttr("disabled");
		}

		var isEdit = editor.graph.getSelectionCell().isIOEditable;
		console.log('editor graph ... ');
		editPouDlg.show();
		$('#editPouInputs').val(''); //清空输入框
		$('#editPouOutputs').val(''); //清空输出框
		PouInputsSelectStateStore.data = [];
		PouOutputsSelectStateStore.data = [];
		var pouName = editor.graph.getSelectionCell().value;
		$('#editPouName').val(pouName);
		console.log((pouName));
		var children = editor.graph.getSelectionCell().children;
		console.log(children);
		var inputCount = 0;
		var outputCount = 0;
		for(var i = 0; i < children.length; i++) {
			if(children[i].mid[0] === 'I') {
				var inputTempInfo = {
					name: "",
					mid: ""
				};
				inputTempInfo.name = children[i].value;
				inputTempInfo.mid = children[i].mid;
				PouInputsSelectStateStore.data[inputCount] = inputTempInfo;
				inputCount++;
			}
			if(children[i].mid[0] === 'O') {
				var outputTempInfo = {
					name: "",
					mid: ""
				};
				outputTempInfo.name = children[i].value;
				outputTempInfo.mid = children[i].mid;
				PouOutputsSelectStateStore.data[outputCount] = outputTempInfo;
				outputCount++;
				console.log(outputTempInfo);
			}
		}
		PouInputsFilteringSelect.startup();
		PouOutputsFilteringSelect.startup();
	});

	editPouOk.onClick = function() {
		console.log('editor graph  ... ');
		//		graph.refresh();
		var newPouName = $('#editPouName').val().trim();
		var selectInputName = dijit.byId('PouInputsSelect').get('displayedValue');
		var selectOuntputName = dijit.byId('PouOutputsSelect').get('displayedValue');
		var newInputName = $('#editPouInputs').val().trim();
		var newOutputName = $('#editPouOutputs').val().trim();
		console.log('newPouName: ', newPouName);
		console.log('selectInputName: ', selectInputName);
		console.log('selectOuntputName: ', selectOuntputName);
		console.log('newInputName: ', newInputName);
		console.log('newOutputName: ', newOutputName);
		var inputFlag = true;
		var outputFlag = true;

		if(!newPouName) {
			//输入为空，警告
			alert('请输入POU名!');
		} else {
			editor.graph.getSelectionCell().value = newPouName;
			//输入不为空，直接赋值
			var children = editor.graph.getSelectionCell().children;
			var len = children.length;
			if(newInputName) {
				//遍历，防止重复命名
				for(var i = 0; i < len; i++) {
					if(children[i].mid[0] === 'I' && children[i].value === newInputName) {
						inputFlag = false;
						alert('已经存在相同输入名，请重新命名输入!');
						break;
					}
				}

				if(inputFlag) {
					for(var i = 0; i < len; i++) {
						if(children[i].mid[0] === 'I' && children[i].value === selectInputName) {
							children[i].value = newInputName;
						}
					}
				}
			}

			if(newOutputName) {
				//遍历，防止重复命名
				for(var i = 0; i < len; i++) {
					if(children[i].mid[0] === 'O' && children[i].value === newOutputName) {
						outputFlag = false;
						alert('已经存在相同输出名，请重新命名输出!');
						break;
					}
				}

				if(outputFlag) {
					for(var i = 0; i < len; i++) {
						if(children[i].mid[0] === 'O' && children[i].value === selectOuntputName) {
							children[i].value = newOutputName;
						}
					}
				}
			}
			graph.refresh();
			$('#editPouInputs').val(''); //清空输入框
			$('#editPouOutputs').val(''); //清空输出框
			if(inputFlag && outputFlag) {
				editPouDlg.hide();
				console.log('editor graph ok ! ');
			}

		}
	}

	function editBlock() {
		console.log('Edit IO ...');
		//1.获取原始输入输出数量并显示，原始输入输出框内容不可以修改
		var pou = editor.graph.getSelectionCell();
		var len = pou.children.length;
		var inputNum = 0; //原始输入数量
		var outputNum = 0; //原始输出数量
		var inputIOArray = new Array(); //保存输入IO
		var outputIOArray = new Array(); //保存输出IO
		console.log(pou.children);
		for(var i = 0; i < len; i++) {
			console.log('---------children---------', pou.children[i].mid);
			if(pou.children[i].mid[0] === 'I') {
				++inputNum;
				console.log('children', pou.children[i].mid);
				var cellInputItem = {
					'mid': pou.children[i].mid,
					'number': parseInt(pou.children[i].mid.split('n')[1]),
					'value': pou.children[i].value,
					'offset': pou.children[i].geometry.offset.y
				}
				inputIOArray.push(cellInputItem);
			}
			if(pou.children[i].mid[0] === 'O') {
				++outputNum;
				var cellOutputItem = {
					'mid': pou.children[i].mid,
					'number': parseInt(pou.children[i].mid.split('T')[1]),
					'value': pou.children[i].value,
					'offset': pou.children[i].geometry.offset.y
				}
				outputIOArray.push(cellOutputItem);
			}
		}
		$('#pouInputsIONum').val(inputNum);
		$('#pouOutputsIONum').val(outputNum);
		editPouIONumDlg.show();

		editIONumPouOk.onClick = function() {
			var newInputNum = 0; //新的输入数量
			var newOutputNum = 0; //新的输出数量
			//2.用户输入新的输入输出框
			newInputNum = $('#editPouInputsIONum').val().trim();
			newOutputNum = $('#editPouOutputsIONum').val().trim();
			//a.如果新的输入输出框为空，那么不修改,使用原先的IO数量
			if(newInputNum || newOutputNum) {
				if(!newInputNum) {
					newInputNum = inputNum;
				}
				if(!newOutputNum) {
					newOutputNum = outputNum;
				}
				//b.输入输出框框输入数字必须大于1小于8，输入输出框如果没有填写，则按照原始io数量计算
				if((newInputNum >= 1 && newInputNum <= 8) && (newOutputNum >= 1 && newOutputNum <= 8)) {
					console.log('newInputNum', newInputNum);
					console.log('inputNum', inputNum);
					//c.如果输入框输入内容比原始输入IO大，那么与输出IO数量比较
					if(newInputNum > inputNum) {
						var newId = "";
						var newVal = "";
						var newNum = 0;
						var newOffset = 0;
						//1)如果输入IO数量比输出IO大，那么根据输入IO数量增加POU的长度
						//2)如果输出IO数量比输入IO大，那么只增加IO数量，不增加POU长度
						if(newInputNum >= newOutputNum) {
							if(inputNum > outputNum) {
								pou.geometry.height = pou.geometry.height + 20 * (newInputNum - inputNum);
							} else {
								pou.geometry.height = pou.geometry.height + 20 * (newInputNum - outputNum);
							}
						}
						//新增newInputNum - inputNum个输入
						console.log(newInputNum - inputNum);
						if(inputNum === 1) {
							newNum = inputIOArray[0].number;
							newOffset = inputIOArray[0].offset;
						} else {
							newNum = inputIOArray[0].number;
							newOffset = inputIOArray[0].offset;
							//遍历所有的数组元素，获取number最大的那个，创建Id = number + 1标号，赋值value为number + 1，同时获取height最大值，赋值height为height + 20
							for(var j = 0; j < inputNum - 1; j++) {
								if(newNum < inputIOArray[j + 1].number) {
									newNum = inputIOArray[j + 1].number;
								}

								if(newOffset < inputIOArray[j + 1].offset) {
									newOffset = inputIOArray[j + 1].offset;
								}
							}
						}
						for(var i = 0; i < newInputNum - inputNum; i++) {
							newNum = newNum + 1;
							newId = 'In' + newNum;
							newVal = 'In' + newNum;
							newOffset = newOffset + 20;
							console.log(newOffset);
							//插入该输入IO到图形中
							var v11 = graph.insertVertex(pou, null, null, 0, 0, 10, 16,
								'shape=line;align=left;verticalAlign=middle;fontSize=10;routingCenterX=-0.5;' +
								'spacingLeft=12;fontColor=' + fontColor + ';strokeColor=' + strokeColor);
							v11.geometry.relative = true;
							v11.mid = newId;
							v11.value = newVal;
							v11.geometry.offset = new mxPoint(-v11.geometry.width, newOffset);
						}
						graph.refresh();
						//d.如果输入框输入内容比原始输入IO小，那么与输出IO数量比较
					} else {
						//1)如果比输出IO大，则根据输入IO数量减小POU的长度
						//2)如果比输出IO小，那么只减少IO数量，不减少POU长度
						if(newInputNum >= newOutputNum) {
							pou.geometry.height = pou.geometry.height - 20 * (inputNum - newInputNum);
						}
						for(var i = 0; i < inputNum - newInputNum; i++) {
							for(var j = 0; j < pou.children.length; j++) {
								if(pou.children[j].mid === inputIOArray[inputNum - i - 1].mid) {
									var index = pou.getIndex(pou.children[j]);
									console.log(index);
									var cell = pou.remove(index);
									graph.refresh(cell);
								}
							}
						}
						graph.refresh();
					}

					//e.如果输出框输入内容比原始输出IO大，那么与输入IO数量比较
					if(newOutputNum > outputNum) {
						var newId = "";
						var newVal = "";
						var newNum = 0;
						var newOffset = 0;
						//1)如果输出IO数量比输入IO大，那么根据输出IO数量增加POU的长度
						//2)如果输出IO数量比输入IO小，那么只增加IO数量，不增加POU长度
						if(newOutputNum >= newInputNum) {
							var temp;
							if(outputNum > inputNum) {
								pou.geometry.height = pou.geometry.height + 20 * (newOutputNum - outputNum);
							} else {
								pou.geometry.height = pou.geometry.height + 20 * (newOutputNum - inputNum);
							}

						}
						//新增newInputNum - inputNum个输入
						console.log(newOutputNum - outputNum);
						//遍历所有的数组元素，获取number最大的那个，创建Id = number + 1标号，赋值value为number + 1，同时获取height最大值，赋值height为height + 20
						if(outputNum === 1) {
							newNum = outputIOArray[0].number;
							newOffset = outputIOArray[0].offset;
						} else {
							newNum = outputIOArray[0].number;
							newOffset = outputIOArray[0].offset;
							for(var j = 0; j < outputNum - 1; j++) {
								if(newNum < outputIOArray[j + 1].number) {
									newNum = outputIOArray[j + 1].number;
								}

								if(newOffset < outputIOArray[j + 1].offset) {
									newOffset = outputIOArray[j + 1].offset;
								}
							}
						}

						for(var i = 0; i < newOutputNum - outputNum; i++) {
							newNum = newNum + 1;
							newId = 'OUT' + newNum;
							newVal = 'OUT' + newNum;
							newOffset = newOffset + 20;
							console.log(newOffset);
							//插入该输入IO到图形中
							var v11 = graph.insertVertex(pou, null, null, 0, 0, 10, 16,
								'shape=line;align=right;verticalAlign=middle;fontSize=10;routingCenterX=0.5;' +
								'spacingRight=12;fontColor=' + fontColor + ';strokeColor=' + strokeColor);
							v11.geometry.relative = true;
							v11.geometry.x = 1;
							v11.mid = newId;
							v11.value = newVal;
							v11.geometry.offset = new mxPoint(0, newOffset);
						}
						graph.refresh();
						//f.如果输出框输入内容比原始输出IO小，那么与输入IO数量比较
					} else {
						//1)如果比输入IO大，则根据输出IO数量减小POU的长度
						//2)如果比输入IO小，那么只减少IO数量，不减少POU长度
						if(newOutputNum >= newInputNum) {
							pou.geometry.height = pou.geometry.height - 20 * (outputNum - newOutputNum);
						}
						for(var i = 0; i < outputNum - newOutputNum; i++) {
							for(var j = 0; j < pou.children.length; j++) {
								if(pou.children[j].mid === outputIOArray[outputNum - i - 1].mid) {
									var index = pou.getIndex(pou.children[j]);
									console.log(index);
									var cell = pou.remove(index);
									graph.refresh(cell);
								}
							}
						}
						graph.refresh();
					}
					editPouIONumDlg.hide();
				} else {
					alert('输入输出端口数量必须在1-8之间!');
				}
			}
		}
	}

	function editCoil() {
		console.log('editCoil...');
		editCoilDlg.show();
	}

	editCoilOk.onClick = function() {
		var radioVal = '';
		var radios = $("#showCoilType :radio"); //获取RadioButton值
		for(var i in radios) {
			if(radios[i].checked) {
				radioVal = radios[i].value;
				console.log(radioVal);
				break;
			}
		}
		var cell = editor.graph.getSelectionCell();
		var length = cell.children.length;
		for(var i = 0; i < length; i++) {
			if(cell.children[i].mid === 'Label') {
				cell.children[i].value = radioVal;
				graph.refresh(cell);
				break;
			}
		}
		editCoilDlg.hide();

	}

	function editContact() {
		console.log('editContact...');
		editContactDlg.show();
	}

	editContactOk.onClick = function() {
		var radioVal = '';
		var radios = $("#showContactType :radio"); //获取RadioButton值
		for(var i in radios) {
			if(radios[i].checked) {
				radioVal = radios[i].value;
				console.log(radioVal);
				break;
			}
		}
		var cell = editor.graph.getSelectionCell();
		var length = cell.children.length;
		for(var i = 0; i < length; i++) {
			if(cell.children[i].mid === 'Label') {
				cell.children[i].value = radioVal;
				graph.refresh(cell);
				break;
			}
		}
		editContactDlg.hide();

	}

	function editRail() {
		console.log('editRail...');
	}

	editor.addAction('edit', function(editor, cell) {
		var cellType = editor.graph.getSelectionCell().class;
		var isCellEditable = editor.graph.getSelectionCell().isIOEditable;
		if(isCellEditable === true || isCellEditable === 1) {
			if(cellType === 'block') {
				editBlock();
			} else if(cellType === 'coil') {
				editCoil();
			} else if(cellType === 'contact') {
				editContact();
			} else if(cellType === 'rail') {
				editRail();
			}
		} else {
			alert('该模块不支持编辑!');
		}
	});
	
	//保存文件
	function save(contents) {
		var params = {
			name: str,
			content: contents
		};
		//ctrl + s 保存文件
		$.ajax({
			url: "http://localhost:3000/file/saveFile",
			type: "post",
			dataType: "json",
			data: params,
			success: function (response) {
				console.log(response.message);
			},
			error: function () {
				console.log('save file fail !');
			}
		});
	}

	// Function to create the entries in the popupmenu
	function createPopupMenu(graph, menu, cell, evt) {
		if (cell != null) {
			menu.addItem('复制', '/images/copy.png', function () {
				editor.execute('copy');
			});
			menu.addItem('剪切', '/images/cut.png', function () {
				editor.execute('cut');
			});
			menu.addItem('编辑', '/images/copy.png', function () {
				editor.execute('edit');
			});
			menu.addItem('编辑模块名称', '/images/copy.png', function () {
				editor.execute('editCellName');
			});
			menu.addSeparator();
			menu.addItem('删除', '/images/delete2.png', function () {
				editor.execute('delete');
			});
		} else {
			menu.addItem('粘贴', '/images/paste.png', function () {
				editor.execute('paste');
			});
			menu.addSeparator();
			menu.addItem('撤销', '/images/undo.png', function () {
				editor.execute('undo');
			});
			menu.addItem('重做', '/images/redo.png', function () {
				editor.execute('redo');
			});
			menu.addSeparator();
			menu.addItem('展示', '/images/camera.png', function () {
				editor.execute('show');
				// console.log(svg);
			});
			menu.addSeparator();
			menu.addItem('导出', '/images/export1.png', function () {
				editor.execute('export');
			});
			menu.addItem('导入XML', '/images/group.png', function () {
				editor.execute('importXML');
			});
			menu.addSeparator();
			menu.addItem('放大', '/images/zoom_in.png', function () {
				editor.execute('zoomIn');
			});
			menu.addItem('缩小', '/images/zoom_out.png', function () {
				editor.execute('zoomOut');
			});
			menu.addItem('还原', '/images/view_1_1.png', function () {
				editor.execute('actualSize');
			});
			menu.addSeparator();
			menu.addItem('保存', '/images/check.png', function () {
				var enc = new mxCodec(mxUtils.createXmlDocument());
				var node = enc.encode(editor.graph.getModel());
				//var content = mxUtils.getPrettyXml(node);
				save(mxUtils.getPrettyXml(node));
			});
		}
	};

	labelBackground = (invert) ? '#000000' : '#FFFFFF';
	fontColor = (invert) ? '#FFFFFF' : '#000000';
	strokeColor = (invert) ? '#C0C0C0' : '#000000';
	fillColor = (invert) ? 'none' : '#FFFFFF';

	style = graph.getStylesheet().getDefaultEdgeStyle();
	delete style['endArrow'];
	style['strokeColor'] = strokeColor;
	style['labelBackgroundColor'] = labelBackground;
	style['edgeStyle'] = 'wireEdgeStyle';
	style['fontColor'] = fontColor;
	style['fontSize'] = '9';
	style['movable'] = '0';
	style['strokeWidth'] = strokeWidth;
	//style['rounded'] = '1';

	// Sets join node size
	style['startSize'] = joinNodeSize;
	style['endSize'] = joinNodeSize;

	style = graph.getStylesheet().getDefaultVertexStyle();
	style['gradientDirection'] = 'south';
	//style['gradientColor'] = '#909090';
	style['strokeColor'] = strokeColor;
	//style['fillColor'] = '#e0e0e0';
	style['fillColor'] = 'none';
	style['fontColor'] = fontColor;
	style['fontStyle'] = '1';
	style['fontSize'] = '12';
	style['resizable'] = '0';
	style['rounded'] = '0';
	style['strokeWidth'] = strokeWidth;

	// Starts connections on the background in wire-mode
	var connectionHandlerIsStartEvent = graph.connectionHandler.isStartEvent;
	//	graph.connectionHandler.isStartEvent = function(me) {
	//		return checkbox.checked || connectionHandlerIsStartEvent.apply(this, arguments);
	//	};

	// Avoids any connections for gestures within tolerance except when in wire-mode
	// or when over a port
	var connectionHandlerMouseUp = graph.connectionHandler.mouseUp;
	graph.connectionHandler.mouseUp = function (sender, me) {
		if (this.first != null && this.previous != null) {
			var point = mxUtils.convertPoint(this.graph.container, me.getX(), me.getY());
			var dx = Math.abs(point.x - this.first.x);
			var dy = Math.abs(point.y - this.first.y);

			if (dx < this.graph.tolerance && dy < this.graph.tolerance) {
				// Selects edges in non-wire mode for single clicks, but starts
				// connecting for non-edges regardless of wire-mode
				if (this.graph.getModel().isEdge(this.previous.cell)) {
					this.reset();
				}

				return;
			}
		}

		connectionHandlerMouseUp.apply(this, arguments);
	};
	//获取该Html的文件名
	var str = window.location.href;
	str = str.substring(str.lastIndexOf("/") + 1);
	str = str.substring(0, str.lastIndexOf("."));
	console.log(str);
	$.ajax({
		url: "http://localhost:3000/file/loadGraph",
		type: "post",
		dataType: "json",
		async: false,
		data: {
			name: str
		},
		success: function (response) {
			console.log(response.proName, response.fileType);
			var layout = new mxFastOrganicLayout(graph);
			graph.getModel().beginUpdate();
			try {
				// Loads the mxGraph file format (XML file)
				var req = mxUtils.load(response.resource + '/' + str + '.' + response.fileType);
				var root = req.getDocumentElement();
				//var root = response.message;
				var dec = new mxCodec(root.ownerDocument);

				dec.decode(root, graph.getModel());
				// Gets the default parent for inserting new cells. This
				// is normally the first child of the root (ie. layer 0).
				var parent = graph.getDefaultParent();

				// Executes the layout
				layout.execute(parent);
				console.log('ok');
			} finally {
				// Updates the display
				graph.getModel().endUpdate();
			}
		},
		error: function () {
			console.log('load file fail !');
		}
	});
};

//------------------------------------------------------
// <!-- Updates connection points before the routing is called.否则连线会十分僵硬，不灵活-->
// Computes the position of edge to edge connection points.
mxGraphView.prototype.updateFixedTerminalPoint = function (edge, terminal, source, constraint) {
	var pt = null;

	if (constraint != null) {
		pt = this.graph.getConnectionPoint(terminal, constraint);
	}

	if (source) {
		edge.sourceSegment = null;
	} else {
		edge.targetSegment = null;
	}

	if (pt == null) {
		var s = this.scale;
		var tr = this.translate;
		var orig = edge.origin;
		var geo = this.graph.getCellGeometry(edge.cell);
		pt = geo.getTerminalPoint(source);

		// Computes edge-to-edge connection point
		if (pt != null) {
			pt = new mxPoint(s * (tr.x + pt.x + orig.x),
				s * (tr.y + pt.y + orig.y));

			// Finds nearest segment on edge and computes intersection
			if (terminal != null && terminal.absolutePoints != null) {
				var seg = mxUtils.findNearestSegment(terminal, pt.x, pt.y);

				// Finds orientation of the segment
				var p0 = terminal.absolutePoints[seg];
				var pe = terminal.absolutePoints[seg + 1];
				var horizontal = (p0.x - pe.x == 0);

				// Stores the segment in the edge state
				var key = (source) ? 'sourceConstraint' : 'targetConstraint';
				var value = (horizontal) ? 'horizontal' : 'vertical';
				edge.style[key] = value;

				// Keeps the coordinate within the segment bounds
				if (horizontal) {
					pt.x = p0.x;
					pt.y = Math.min(pt.y, Math.max(p0.y, pe.y));
					pt.y = Math.max(pt.y, Math.min(p0.y, pe.y));
				} else {
					pt.y = p0.y;
					pt.x = Math.min(pt.x, Math.max(p0.x, pe.x));
					pt.x = Math.max(pt.x, Math.min(p0.x, pe.x));
				}
			}
		}
		// Computes constraint connection points on vertices and ports
		else if (terminal != null && terminal.cell.geometry.relative) {
			pt = new mxPoint(this.getRoutingCenterX(terminal),
				this.getRoutingCenterY(terminal));
		}

	}

	edge.setAbsoluteTerminalPoint(pt, source);
};

//-------------------------------------------------------------------
// <!--Overrides methods to preview and create new edges.否则连线会十分僵硬-->
// Sets source terminal point for edge-to-edge connections.
mxConnectionHandler.prototype.createEdgeState = function (me) {
	var edge = this.graph.createEdge();

	if (this.sourceConstraint != null && this.previous != null) {
		edge.style = mxConstants.STYLE_EXIT_X + '=' + this.sourceConstraint.point.x + ';' +
			mxConstants.STYLE_EXIT_Y + '=' + this.sourceConstraint.point.y + ';';
	} else if (this.graph.model.isEdge(me.getCell()) && !mxEvent.isRightMouseButton(me.getEvent())) {
		var scale = this.graph.view.scale;
		var tr = this.graph.view.translate;
		var pt = new mxPoint(this.graph.snap(me.getGraphX() / scale) - tr.x,
			this.graph.snap(me.getGraphY() / scale) - tr.y);
		edge.geometry.setTerminalPoint(pt, true);
	}

	return this.graph.view.createState(edge);
};

// Uses right mouse button to create edges on background (see also: lines 67 ff)
mxConnectionHandler.prototype.isStopEvent = function (me) {
	return me.getState() != null || mxEvent.isRightMouseButton(me.getEvent());
};

// Updates target terminal point for edge-to-edge connections.
mxConnectionHandlerUpdateCurrentState = mxConnectionHandler.prototype.updateCurrentState;
mxConnectionHandler.prototype.updateCurrentState = function (me) {
	mxConnectionHandlerUpdateCurrentState.apply(this, arguments);

	if (this.edgeState != null) {
		this.edgeState.cell.geometry.setTerminalPoint(null, false);

		if (this.shape != null && this.currentState != null &&
			this.currentState.view.graph.model.isEdge(this.currentState.cell)) {
			var scale = this.graph.view.scale;
			var tr = this.graph.view.translate;
			var pt = new mxPoint(this.graph.snap(me.getGraphX() / scale) - tr.x,
				this.graph.snap(me.getGraphY() / scale) - tr.y);
			this.edgeState.cell.geometry.setTerminalPoint(pt, false);
		}
	}
};

// Updates the terminal and control points in the cloned preview.
mxEdgeSegmentHandler.prototype.clonePreviewState = function (point, terminal) {
	var clone = mxEdgeHandler.prototype.clonePreviewState.apply(this, arguments);
	clone.cell = clone.cell.clone();

	if (this.isSource || this.isTarget) {
		clone.cell.geometry = clone.cell.geometry.clone();

		// Sets the terminal point of an edge if we're moving one of the endpoints
		if (this.graph.getModel().isEdge(clone.cell)) {
			// TODO: Only set this if the target or source terminal is an edge
			clone.cell.geometry.setTerminalPoint(point, this.isSource);
		} else {
			clone.cell.geometry.setTerminalPoint(null, this.isSource);
		}
	}

	return clone;
};

var mxEdgeHandlerConnect = mxEdgeHandler.prototype.connect;
mxEdgeHandler.prototype.connect = function (edge, terminal, isSource, isClone, me) {
	var result = null;
	var model = this.graph.getModel();
	var parent = model.getParent(edge);

	model.beginUpdate();
	try {
		result = mxEdgeHandlerConnect.apply(this, arguments);
		var geo = model.getGeometry(result);

		if (geo != null) {
			geo = geo.clone();
			var pt = null;

			if (model.isEdge(terminal)) {
				pt = this.abspoints[(this.isSource) ? 0 : this.abspoints.length - 1];
				pt.x = pt.x / this.graph.view.scale - this.graph.view.translate.x;
				pt.y = pt.y / this.graph.view.scale - this.graph.view.translate.y;

				var pstate = this.graph.getView().getState(
					this.graph.getModel().getParent(edge));

				if (pstate != null) {
					pt.x -= pstate.origin.x;
					pt.y -= pstate.origin.y;
				}

				pt.x -= this.graph.panDx / this.graph.view.scale;
				pt.y -= this.graph.panDy / this.graph.view.scale;
			}

			geo.setTerminalPoint(pt, isSource);
			model.setGeometry(edge, geo);
		}
	} finally {
		model.endUpdate();
	}

	return result;
};

//------------------------------------------------------------------------------------
// <!--Adds in-place highlighting for complete cell area (no hotspot).鼠标滑过连线时会高亮连线-->

mxConnectionHandlerCreateMarker = mxConnectionHandler.prototype.createMarker;
mxConnectionHandler.prototype.createMarker = function () {
	var marker = mxConnectionHandlerCreateMarker.apply(this, arguments);

	// Uses complete area of cell for new connections (no hotspot)
	marker.intersects = function (state, evt) {
		return true;
	};

	// Adds in-place highlighting
	mxCellHighlightHighlight = mxCellHighlight.prototype.highlight;
	marker.highlight.highlight = function (state) {
		if (this.state != state) {
			if (this.state != null) {
				this.state.style = this.lastStyle;

				// Workaround for shape using current stroke width if no strokewidth defined
				this.state.style['strokeWidth'] = this.state.style['strokeWidth'] || '1';
				this.state.style['strokeColor'] = this.state.style['strokeColor'] || 'none';

				if (this.state.shape != null) {
					this.state.view.graph.cellRenderer.configureShape(this.state);
					this.state.shape.redraw();
				}
			}

			if (state != null) {
				this.lastStyle = state.style;
				state.style = mxUtils.clone(state.style);
				state.style['strokeColor'] = '#00ff00';
				state.style['strokeWidth'] = '3';

				if (state.shape != null) {
					state.view.graph.cellRenderer.configureShape(state);
					state.shape.redraw();
				}
			}

			this.state = state;
		}
	};

	return marker;
};

mxEdgeHandlerCreateMarker = mxEdgeHandler.prototype.createMarker;
mxEdgeHandler.prototype.createMarker = function () {
	var marker = mxEdgeHandlerCreateMarker.apply(this, arguments);

	// Adds in-place highlighting when reconnecting existing edges
	marker.highlight.highlight = this.graph.connectionHandler.marker.highlight.highlight;

	return marker;
}

//-----------------------------------------------------------------------
// <!--Adds oval markers for edge-to-edge connections.线和线交叉互相连接时创建交点-->

mxGraphGetCellStyle = mxGraph.prototype.getCellStyle;
mxGraph.prototype.getCellStyle = function (cell) {
	var style = mxGraphGetCellStyle.apply(this, arguments);

	if (style != null && this.model.isEdge(cell)) {
		style = mxUtils.clone(style);

		if (this.model.isEdge(this.model.getTerminal(cell, true))) {
			style['startArrow'] = 'oval';
		}

		if (this.model.isEdge(this.model.getTerminal(cell, false))) {
			style['endArrow'] = 'oval';
		}
	}

	return style;
};

//-------------------------------------------------------------------------
// <!--Imlements a custom resistor shape. Direction currently ignored here.-->
function ResistorShape() { };
ResistorShape.prototype = new mxCylinder();
ResistorShape.prototype.constructor = ResistorShape;

ResistorShape.prototype.redrawPath = function (path, x, y, w, h, isForeground) {
	var dx = w / 16;

	if (isForeground) {
		path.moveTo(0, h / 2);
		path.lineTo(2 * dx, h / 2);
		path.lineTo(3 * dx, 0);
		path.lineTo(5 * dx, h);
		path.lineTo(7 * dx, 0);
		path.lineTo(9 * dx, h);
		path.lineTo(11 * dx, 0);
		path.lineTo(13 * dx, h);
		path.lineTo(14 * dx, h / 2);
		path.lineTo(16 * dx, h / 2);

		path.end();
	}
};

mxCellRenderer.registerShape('resistor', ResistorShape);

//-------------------------------------------------------------------------
// <!--Imlements a custom resistor shape. Direction currently ignored here.-->
mxEdgeStyle.WireConnector = function (state, source, target, hints, result) {
	// Creates array of all way- and terminalpoints
	var pts = state.absolutePoints;
	var horizontal = true;
	var hint = null;

	// Gets the initial connection from the source terminal or edge
	if (source != null && state.view.graph.model.isEdge(source.cell)) {
		horizontal = state.style['sourceConstraint'] == 'horizontal';
	} else if (source != null) {
		horizontal = source.style['portConstraint'] != 'vertical';

		// Checks the direction of the shape and rotates
		var direction = source.style[mxConstants.STYLE_DIRECTION];

		if (direction == 'north' || direction == 'south') {
			horizontal = !horizontal;
		}
	}

	// Adds the first point
	// TODO: Should move along connected segment
	var pt = pts[0];

	if (pt == null && source != null) {
		pt = new mxPoint(state.view.getRoutingCenterX(source), state.view.getRoutingCenterY(source));
	} else if (pt != null) {
		pt = pt.clone();
	}

	var first = pt;

	// Adds the waypoints
	if (hints != null && hints.length > 0) {
		// FIXME: First segment not movable
		for (var i = 0; i < hints.length; i++) {
			horizontal = !horizontal;
			hint = state.view.transformControlPoint(state, hints[i]);

			if (horizontal) {
				if (pt.y != hint.y) {
					pt.y = hint.y;
					result.push(pt.clone());
				}
			} else if (pt.x != hint.x) {
				pt.x = hint.x;
				result.push(pt.clone());
			}
		}
	} else {
		hint = pt;
	}

	// Adds the last point
	pt = pts[pts.length - 1];

	// TODO: Should move along connected segment
	if (pt == null && target != null) {
		pt = new mxPoint(state.view.getRoutingCenterX(target), state.view.getRoutingCenterY(target));
	}

	if (horizontal) {
		if (pt.y != hint.y && first.x != pt.x) {
			result.push(new mxPoint(pt.x, hint.y));
		}
	} else if (pt.x != hint.x && first.y != pt.y) {
		result.push(new mxPoint(hint.x, pt.y));
	}
};

mxStyleRegistry.putValue('wireEdgeStyle', mxEdgeStyle.WireConnector);

// This connector needs an mxEdgeSegmentHandler
mxGraphCreateHandler = mxGraph.prototype.createHandler;
mxGraph.prototype.createHandler = function (state) {
	var result = null;

	if (state != null) {
		if (this.model.isEdge(state.cell)) {
			var style = this.view.getEdgeStyle(state);

			if (style == mxEdgeStyle.WireConnector) {
				return new mxEdgeSegmentHandler(state);
			}
		}
	}

	return mxGraphCreateHandler.apply(this, arguments);
};