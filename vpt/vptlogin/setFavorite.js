//当浏览器关闭时让用户选择是否添加到收藏夹以及桌面快捷方式
//2010-1-5
//by cld

COOKIE_NAME_BOOKMARK = "bookMark";
COOKIE_VALUE_BOOKMARK = "true";
COOKIE_NAME_SHORTCUT = "shortcut";
COOKIE_VALUE_SHORTCUT = "true";
COOKIE_EXPIRE_DAYS = 100; //cookie过期时间100天
MC_TITLE = "魔力学堂";
MC_URL = window.location.href;

//为String类增加一个trim()方法
String.prototype.trim = function() 
{ 
	return this.replace(/(^\s*)|(\s*$)/g, ""); 
} 

//设置收藏夹
function addBookmark(){
	var _cookieValue = getCookie(COOKIE_NAME_BOOKMARK); 
	if(_cookieValue != COOKIE_VALUE_BOOKMARK){
		if(confirm("您要将魔力学堂加入收藏夹吗？")){
			window.external.AddFavorite(MC_URL,MC_TITLE);
		}
	}else{
		//alert("bookmark added");
	}
	
	//无论用户是否选择加入收藏夹，都将信息保存到cookie中，下次不再弹出
	setCookie(COOKIE_NAME_BOOKMARK,COOKIE_VALUE_BOOKMARK);
}

//设置桌面快捷方式
function addShortCut(){
	var _cookieValue = getCookie(COOKIE_NAME_SHORTCUT); 
	if(_cookieValue != COOKIE_VALUE_SHORTCUT){
		if(confirm("您要将魔力学堂添加到桌面快捷方式吗？（您可能需要启用ActiveX来完成此项功能）")){
			//设置cookie
			setCookie(COOKIE_NAME_SHORTCUT,COOKIE_VALUE_SHORTCUT);
			
			//设置快捷方式
			var WshShell = new ActiveXObject("WScript.Shell"); 
			var DesktopPath = WshShell.SpecialFolders("Desktop"); 
    		var myShortcut = WshShell.CreateShortcut(DesktopPath +'\\'+MC_TITLE+".lnk");     
    		myShortcut.TargetPath = MC_URL;     
    		myShortcut.IconLocation = WshShell.ExpandEnvironmentStrings("%windir%\\SYSTEM\\SHELL32.DLL,46"); //ICON图标，可选 
    		myShortcut.Save(); 
		}
	}else{
		//alert("shortcut added");
	}
}

//设定Cookie值
function setCookie(name, value) 
{ 
	var date=new Date(); 
	date.setTime(date.getTime()+COOKIE_EXPIRE_DAYS*24*3600*1000); 
	document.cookie = name + "=" + value + ";expires=" + date.toGMTString();
}

//取得cookie值
function getCookie(name) 
{ 
	var cookies = document.cookie.split(";");
	for(var i=0;i<cookies.length;i++){
		var singleCookie = cookies[i].split("=");
		var cookieName = singleCookie[0];
		var cookieValue = singleCookie[1];
		if(cookieName != undefined && cookieName != "") cookieName = cookieName.trim();
		if(cookieValue != undefined && cookieValue != "") cookieValue = cookieValue.trim();
		
		if(name == cookieName){
			return cookieValue;
		}
	}
	return "";
	
}



