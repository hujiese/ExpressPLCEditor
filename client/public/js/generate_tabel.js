//动态生成表格，用于图形编程语言的工具栏生成
$(function(){
	var blocks = [
	'功能块',
	'线圈',
	'触点',
	'电源导轨（左）',
	'电源导轨（右）',
	'tr1',
	'tr2',
	'tr3',
	'tr4',
	'tr5'
];

var createpous = ['ceateCalBlock', 'createCoil', 'createContact','createPowerRailL', 'createPowerRailR'];
var images = ['/images/BLOCK.png', '/images/COIL.png', '/images/CONTACT.png','/images/POWERRAIL.png', '/images/POWERRAIR.png'];
var tap = "<table border='0'  cellspacing='0' width='160' height='80'>";
//var over = 'over';
//var out = 'out';
for(var i = 0; i < blocks.length / 2; i++) {
	//<tr align="center" ondblclick="ceateCalBlock()" onmouseover="changeColor('tr0','over')" id="tr0" onmouseout="changeColor('tr0','out')">
	tap += '<tr align="center" ondblclick="' + createpous[i] + '()" onmouseover="changeColor(&quot;' + blocks[i + blocks.length / 2] + '&quot;,' + '&quot;over&quot;' + ')" id=' + blocks[i + blocks.length / 2] + ' onmouseout="changeColor(&quot;' + blocks[i + blocks.length / 2] + '&quot;,' + '&quot;out&quot;' + ')">';

	tap += "<td width='20%'>";
	tap += "<img src='" + images[i] + "' />";
	tap += "</td>";
	tap += "<td align='left'>";
	tap += blocks[i];
	tap += "</td>";
	tap += "</tr>";
}

tap += "</table>";

var temp = document.getElementById("general");
temp.innerHTML = tap;
});
