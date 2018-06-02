function ceateCalBlock() {
	var parent = graph.getDefaultParent();

	graph.getModel().beginUpdate();
	try {
		var v1 = graph.insertVertex(parent, null, 'Calculation', 0, 0, 60, 90,
			'verticalLabelPosition=top;verticalAlign=bottom;fillColor=' + fillColor);
		v1.class = 'block';
		v1.isIOEditable = true;
		v1.setConnectable(false);

		var v11 = graph.insertVertex(v1, null, 'In1', 0, 0, 10, 16,
			'shape=line;align=left;verticalAlign=middle;fontSize=10;routingCenterX=-0.5;' +
			'spacingLeft=12;fontColor=' + fontColor + ';strokeColor=' + strokeColor);
		v11.mid = 'In1';
		v11.geometry.relative = true;
		v11.geometry.offset = new mxPoint(-v11.geometry.width, 10);
		var v12 = v11.clone();
		v12.mid = 'In2';
		v12.value = 'In2';
		v12.geometry.offset = new mxPoint(-v11.geometry.width, 30);
		v1.insert(v12);
		var v13 = v11.clone();
		v13.mid = 'In3';
		v13.value = 'In3';
		v13.geometry.offset = new mxPoint(-v11.geometry.width, 50);
		v1.insert(v13);
		var v14 = v11.clone();
		v14.mid = 'In4';
		v14.value = 'In4';
		v14.geometry.offset = new mxPoint(-v11.geometry.width, 70);
		v1.insert(v14);

		var v15 = v11.clone();
		v15.mid = 'OUT0';
		v15.value = 'OUT';
		v15.geometry.x = 1;
		v15.style = 'shape=line;align=right;verticalAlign=middle;fontSize=10;routingCenterX=0.5;' +
			'spacingRight=12;fontColor=' + fontColor + ';strokeColor=' + strokeColor;
		v15.geometry.offset = new mxPoint(0, 10);
		v1.insert(v15);
	} finally {
		graph.getModel().endUpdate();
	}
}

function changeColor(id, flag) {
	if(flag == "over") {
		document.getElementById(id).style.backgroundColor = "gainsboro";
	} else if(flag == "out") {
		document.getElementById(id).style.backgroundColor = "white";
	}
}

function createCoil() {
	var parent = graph.getDefaultParent();

	graph.getModel().beginUpdate();
	try {
		var v3 = graph.insertVertex(parent, null, 'Coil', 160, 110, 40, 20, 'shape=coil;verticalLabelPosition=top;verticalAlign=bottom;');
		v3.setConnectable(false);
		v3.class = 'coil';
		v3.isIOEditable = true;
		var v11 = graph.insertVertex(v3, null, '', 0, 0, 10, 16,
			'shape=line;align=left;verticalAlign=middle;fontSize=10;routingCenterX=-0.5;' +
			'spacingLeft=-10;spacingTop=-10;fontColor=' + fontColor + ';strokeColor=' + strokeColor);
		v11.geometry.relative = true;
		v11.mid = 'In0';
		// v11.value = 'In0';
		v11.geometry.offset = new mxPoint(-v11.geometry.width + 10, 0);

		var v12 = v11.clone();
		v12.mid = 'OUT0';
		// v12.value = 'OUT0';
		v12.geometry.x = 1;
		v12.style = 'shape=line;align=right;verticalAlign=middle;fontSize=10;routingCenterX=0.5;' +
			'spacingRight=-15;spacingTop=-10;fontColor=' + fontColor + ';strokeColor=' + strokeColor;
		v12.geometry.offset = new mxPoint(-5, 0);
		v3.insert(v12);
		var vlabel = graph.insertVertex(v3, null, '', 1, 1, 0, 0, '', true);
		vlabel.setConnectable(false);
		vlabel.mid = 'Label';
		vlabel.geometry.offset = new mxPoint(-17, -11);
	} finally {
		graph.getModel().endUpdate();
	}
}

function createContact() {
	var parent = graph.getDefaultParent();

	graph.getModel().beginUpdate();
	try {
		var v3 = graph.insertVertex(parent, null, 'Contact', 160, 110, 40, 20, 'shape=contact;verticalLabelPosition=top;verticalAlign=bottom;');
		v3.setConnectable(false);
		v3.class = 'contact';
		v3.isIOEditable = true;
		var v11 = graph.insertVertex(v3, null, '', 0, 0, 10, 16,
			'shape=line;align=left;verticalAlign=middle;fontSize=10;routingCenterX=-0.5;' +
			'spacingLeft=-10;spacingTop=-10;fontColor=' + fontColor + ';strokeColor=' + strokeColor);
		v11.geometry.relative = true;
		v11.mid = 'In0';
		// v11.value = 'In0';
		v11.geometry.offset = new mxPoint(-v11.geometry.width + 10, 0);

		var v15 = v11.clone();
		v15.mid = 'OUT0';
		// v15.value = 'OUT0';
		v15.geometry.x = 1;
		v15.style = 'shape=line;align=right;verticalAlign=middle;fontSize=10;routingCenterX=0.5;' +
			'spacingRight=-15;spacingTop=-10;fontColor=' + fontColor + ';strokeColor=' + strokeColor;
		v15.geometry.offset = new mxPoint(-5, 0);
		v3.insert(v15);
		var vlabel = graph.insertVertex(v3, null, '', 1, 1, 0, 0, '', true);
		vlabel.setConnectable(false);
		vlabel.mid = 'Label';
		vlabel.geometry.offset = new mxPoint(-17, -11);
	} finally {
		graph.getModel().endUpdate();
	}
}

function createPowerRailR() {
	var parent = graph.getDefaultParent();

	graph.getModel().beginUpdate();
	try {
		var v3 = graph.insertVertex(parent, null, 'PowerRailR', 160, 110, 40, 20, 'shape=powerRail;verticalLabelPosition=top;verticalAlign=bottom;');
		v3.setConnectable(false);
		v3.class = 'rail';
		v3.isIOEditable = true;
		var v11 = graph.insertVertex(v3, null, '', 0, 0, 10, 16,
			'shape=line;align=left;verticalAlign=middle;fontSize=10;' +
			'fontColor=' + fontColor + ';strokeColor=' + strokeColor);
		v11.geometry.relative = true;
		v11.mid = 'In0';
		// v11.value = 'In0';
		v11.geometry.offset = new mxPoint(-v11.geometry.width + 10, 10);
	} finally {
		graph.getModel().endUpdate();
	}
}

function createPowerRailL() {
	var parent = graph.getDefaultParent();

	graph.getModel().beginUpdate();
	try {
		var v3 = graph.insertVertex(parent, null, 'PowerRailL', 160, 110, 40, 20, 'shape=powerRail;verticalLabelPosition=top;verticalAlign=bottom;');
		v3.setConnectable(false);
		v3.class = 'rail';
		v3.isIOEditable = true;
		var v15 = graph.insertVertex(v3, null, '', 0, 0, 10, 16,
			'shape=line;align=left;verticalAlign=middle;fontSize=10;routingCenterX=-0.5;' +
			'spacingLeft=-10;spacingTop=-10;fontColor=' + fontColor + ';strokeColor=' + strokeColor);
		v15.geometry.relative = true;
		v15.mid = 'OUT0';
		// v15.value = 'OUT0';
		v15.geometry.x = 1;
//		v15.style = 'shape=line;align=right;verticalAlign=middle;fontSize=10;routingCenterX=0.5;' +
//			'spacingRight=-15;spacingTop=-10;fontColor=' + fontColor + ';strokeColor=' + strokeColor;
		v15.geometry.offset = new mxPoint(-v3.geometry.width + 10, 10);
		v3.insert(v15);
	} finally {
		graph.getModel().endUpdate();
	}
}