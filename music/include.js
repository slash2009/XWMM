
// -----------------------------------------
// MUSIC include.js
//------------------------------------------ 

Ext.BLANK_IMAGE_URL = '../extjs/resources/images/default/s.gif';

function updateMusicAlbum() {

	var record = Ext.getCmp('albumGrid').getSelectionModel().getSelected();
	
		Ext.MessageBox.show({
		title: 'Please wait',
		msg: 'Saving changes',
		progressText: 'Checking changes...',
		width:300,
		progress:true,
		closable:false,
		animEl: 'samplebutton'
	});
	
	var f = function(v){
        return function(){
		if(v == 30){
            Ext.MessageBox.hide();
        }else{
            var i = v/29;
			if (v == 1) {
				myText = 'Checking changes...';
				if (standardInfo.getForm().isDirty()) {
					updateXBMCTables(standardInfo.form, 'album', AlbumGrid.getSelectionModel().getSelected().data.albumid);
					myText = 'updating Album info'
				}
			};
            if (v == 19) {
				if ((extraInfo.getForm().isDirty()) || (albumDescription.getForm().isDirty())) {
//					ValidateAlbuminfo(record);
					updateXBMCTables(extraInfo.form, 'albuminfo', AlbumGrid.getSelectionModel().getSelected().data.albumid);
					updateXBMCTables(albumDescription.form, 'albuminfo', AlbumGrid.getSelectionModel().getSelected().data.albumid);
					myText = 'updating Extra info'
				}					
			};
			Ext.MessageBox.updateProgress(i, myText);
        }
        };
    };
    for(var i = 1; i < 31; i++){
        setTimeout(f(i), i*100);
    }
}
	
function ValidateAlbuminfo (record) {
	// check if record exists otherwise create it
	// AlbumInfoStore.reload();
	// if (AlbumInfoStore.find('idAlbum',record.data.albumid,0,false,false) == -1) {
	if (record.data.scraperInfo = false) {
		var inputUrl = '/xbmcCmds/xbmcHttp?command=execmusicdatabase(INSERT INTO albuminfo (idAlbum, iYear, idGenre) VALUES ("'+record.data.albumid+'"," '+record.data.year+'", "'+record.data.genre+'"))';		
		XBMCExecSql(inputUrl);
		record.data.scraperInfo = true
	}
}

function getMusicCoverList(String, r) {
	
	var result = [];
	if (String == "" || String == undefined ) return result;
	
	if (String.match("<thumb><thumb>") == null) {
		String = '<test>'+String+'</test>'
	};
	String = String.replace(/\n/g,"");

	if (window.DOMParser)
	 {
	  parser=new DOMParser();
	  xmlDoc=parser.parseFromString(String,"text/xml");
	 }
	else // Internet Explorer
	 {
	  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
	  xmlDoc.async="false";
	  xmlDoc.loadXML(String)
	 } 
	 
	 var MasterUrl = getTagAttribute(xmlDoc.documentElement, 'url');
	 if (MasterUrl == null){ MasterUrl = ""};
	 for (var i=0 ; i < xmlDoc.documentElement.childNodes.length; i++) {
		var downloadUrl = MasterUrl + xmlDoc.getElementsByTagName("thumb")[i].childNodes[0].nodeValue;
		var previewUrl = xmlDoc.getElementsByTagName("thumb")[i].getAttribute("preview");
		if (previewUrl == "" || previewUrl == null) { previewUrl = downloadUrl}
			else { previewUrl = MasterUrl + previewUrl};
		// need to change preview url for impawards links
		if (previewUrl.match("impaward") != null) {previewUrl = previewUrl.replace(/posters\//g,"thumbs/imp_")};
		
		result.push([previewUrl, downloadUrl, "Remote", ""]);
	}
	 return result
}

function GetAlbumDetails(r) {

	var jsonResponse = xbmcJsonRPC('{"jsonrpc": "2.0", "method": "AudioLibrary.GetAlbumDetails", "params": {"albumid": '+r.data.albumid+', "properties": ["title", "genre", "year", "rating", "theme", "mood", "style", "type", "description", "albumlabel"]}, "id": 1}');

	mergeJson(r.data, jsonResponse.albumdetails);

	r.data.currentThumbnail = r.data.currentThumbnail.replace(/image:\/\//g, "").slice(0,-1);
	r.data.details = true;
}
