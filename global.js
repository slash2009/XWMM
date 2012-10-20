
var myVersion = '2.0.9'

function mergeJson(object1, object2) {
	var i;
	for (i in object2)	
		object1[i]=object2[i];
}

function removeSpace(string) {
	string = string.replace(/^\s*|\s*$/g,'');
	return string;
}

var menuBar = new Ext.Toolbar({
	region: "north",
	height: 30,
	items: [{
		xtype: 'tbspacer'
		},{
			xtype: 'tbbutton',
			text: 'Movies',
			width: 60,
			menu: [{
				text: 'Movies List',
				iconCls: 'silk-grid',
				handler: function(){window.location = '../movies/index.html'}
			},{
				text: 'Movies by Genre',
				iconCls: 'silk-grid',
				handler: function(){window.location = '../movies/moviegenre.html'}
			},{
				text: 'Most recent',
				iconCls: 'silk-grid',
				handler: function(){window.location = '../movies/movierecent.html'}
			}]			
		},{
			xtype: 'tbspacer'
		},{
			xtype: 'tbbutton',
			text: ' TV-Shows ',
			width: 60,
			handler: function(){window.location = '../tvshows/index.html'}
		},{
			xtype: 'tbspacer'
		},{
			xtype: 'tbbutton',
			text: 'Music',
			width: 60,
			menu: [{
				text: 'Artist / Album',
				iconCls: 'silk-grid',
				handler: function(){window.location = '../music/index.html'}
			},{
				text: 'Genre / Album',
				iconCls: 'silk-grid',
				handler: function(){window.location = '../music/albumgenres.html'}
			},{
				text: 'Year / Album',
				iconCls: 'silk-grid',
				handler: function(){window.location = '../music/yearalbum.html'}
			}]	
		},{
			xtype: 'tbspacer'
		},{
			xtype: 'tbbutton',
			text: 'Files',
			width: 60,
			handler: function(){window.location = '../files/index.html'}
	}]
})


Number.prototype.unsign = function(bytes) {
  return this >= 0 ? this : this - Number.MIN_VALUE*2;
};

function parseXBMCXml(xmlString) {

	var tempTable = xmlString.replace(/<\/thumb>/g, ";");
	tempTable = tempTable.replace(/<([^>]+)>/g,'');
	tempTable = tempTable.split(";");
	var x = tempTable.pop();
	return tempTable;
}

// Credit to Fiasco from the xbmc forum
function FindCRC(data) {
  var CRC=0xffffffff;
  data = data.toLowerCase();
  for (var j=0; j<data.length; j++) {
    var c = data.charCodeAt(j);
    CRC ^= c << 24;
    for(var i = 0; i<8; i++) {
        if(CRC.unsign(8) & 0x80000000) {
          CRC = (CRC << 1) ^ 0x04C11DB7;
        } else{
          CRC <<= 1;
        }
     }
  }
  if ( CRC < 0 ) CRC = CRC>>>0;
  var temp = CRC.toString(16);
  if (temp.length < 8) { return "0"+temp}
	else return CRC.toString(16);
};

function copyXBMCVideoThumb(thumb, r, element, type) {

	var src = 'special://profile/Thumbnails/Video/'+thumb.substring(0,1)+'/'+thumb+'.tbn';
	var dst = 'special://xbmc/web/XWMM/cache/Video/'+thumb.substring(0,1)+'/'+thumb+'.tbn';
	var inputUrl = '/xbmcCmds/xbmcHttp?command=FileCopy('+src+';'+dst+')';
	var temp = '';
	Ext.Ajax.request({
		url: inputUrl,
		//async: false,
		method: 'GET',
		success: function (t){
			// if (type == 'season') {
				// if (t.responseText.substr(11,5) == 'Error'){temp = '../images/nobanner.png'}
					// else {temp = '../cache/Video/'+thumb.substring(0,1)+'/'+thumb+'.tbn'};
				// r.data.seasonCover = temp;
				// element.el.dom.src = r.data.seasonCover
			// }
			// else {
				if (t.responseText.substr(11,5) == 'Error'){temp = '../images/nobanner.png'}
					else {temp = '../cache/Video/'+thumb.substring(0,1)+'/'+thumb+'.tbn'};
				r.data.ShowCover = temp;
				element.el.dom.src = r.data.ShowCover
			//};
		},
		failure: function(t){},
		timeout: 2000
	})
};

var responseFinale = [];
var movieTable = [];
var currentShowPath;
var selectedMovie;
var currentRecord;
var currentMovie;
var DetailsFlag;
var detailPanel;

var VideoFlagsPanel = new Ext.Panel({
	border: false,
	defaults:{xtype:'container'},
	items: [{
		id: 'videocodec',
		width:84,
		height:31,
		autoEl: {tag: 'img', src: "../images/flags/default.png"}
	},{
		width:84,
		height:31,
		id: 'resolution',
		autoEl: {tag: 'img', src: "../images/flags/defaultscreen.png"}
	},{
		id: 'aspect',
		width:48,
		height:31,
		autoEl: {tag: 'img', src: "../images/flags/default.png"}
	}]
});

var AudioFlagsPanel = new Ext.Panel({
	border: false,
	defaults:{xtype:'container', width: 64, height: 44},
	items: [{
		id: 'audiocodec',
		autoEl: {tag: 'img', src: "../images/flags/defaultsound.png"}
	},{
		id: 'audiochannels',
		autoEl: {tag: 'img', src: "../images/flags/0c.png"}
	}]
});

function findResolution(iWidth) {

if (iWidth == 0)
	return "defaultscreen";
else if (iWidth < 721)
    return "480";
  // 960x540
else if (iWidth < 961)
    return "540";
  // 1280x720
else if (iWidth < 1281)
    return "720";
  // 1920x1080
else 
    return "1080";

}

function findAspect(vAspect) {
if (vAspect == 0)
	return "default";
if (vAspect < 1.4)
	return "1.33";
else if (vAspect < 1.7)
	return "1.66";
else if (vAspect < 1.8)
	return "1.78";
else if (vAspect < 1.9)
	return "1.85";
else if (vAspect < 2.3)
	return "2.20";
else 
	return "2.35";
}


var savingMessage = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});


