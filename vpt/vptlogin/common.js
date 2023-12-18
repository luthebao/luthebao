//处理键盘事件  
function doKey(e){
	var ev = e || window.event;//获取event对象  
	var obj = ev.target || ev.srcElement;//获取事件源  
	var t = obj.type || obj.getAttribute('type');//获取事件源类型
	if(ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea" && t != "application/x-shockwave-flash"){  
		return false;  
	}  
}  
//禁止后退键 作用于Firefox、Opera  
document.onkeypress=doKey;  
//禁止后退键  作用于IE、Chrome、Safari
document.onkeydown=doKey;

//获取区服
function getNavAreaId() {
	var url = location.href;
	r = url.match(/^[^\d]+(\d{1,3})[^\d]+/);

	return r && r[1] ? r[1] : 1;
}

//每半小时更新一次
function getTimeVer(){
	var date = new Date();
	return Math.floor(date.getTime() / 1800000);
}