require(["dijit/Dialog","dojo/domReady!"], function ( Dialog) {
    var myDialog = new Dialog({
        title: "关于Express PLC Editor",
        style: "width: 300px",
        content: '<div id="about" class="menu-content" style="background:#f0f0f0;padding:10px;text-align:left"> <img src="images/logo.png" style="width:258px;height:178px"> <p style="font-size:14px;color:#00;text-align: center;">OpenPLC 编辑器v2.0</p><p style="font-size:14px;color:#00;text-align: center;">Made by 胡杰</p></div>'
    });
    
	about.onClick =  function(){
        myDialog.show();
	}
});