
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
	})
	var f = function(v){
        return function(){
		if(v == 30){
            Ext.MessageBox.hide();
        }else{
            var i = v/29;
			if (v == 1) {
				myText = 'Checking changes...';
				updateExtraAlbuminfo(record)
				myText = 'updating album info';
			};
            if (v == 15) {
				updateStandardAlbuminfo(record)	
					myText = 'saving'
			};
			Ext.MessageBox.updateProgress(i, myText);
        }
        };
    };
    for(var i = 1; i < 31; i++){
        setTimeout(f(i), i*100);
    }
}
	
function updateExtraAlbuminfo (record) {
	if (Ext.getCmp('scrapertype').isDirty() || Ext.getCmp('scraperlabel').isDirty() || Ext.getCmp('scraperextgenre').isDirty() || Ext.getCmp('scraperstyles').isDirty() || Ext.getCmp('scrapermoods').isDirty() || Ext.getCmp('scraperthemes').isDirty()) {
		// check if record exists otherwise create it
		if (AlbumInfoStore.find('idAlbum',record.data.idAlbum,0,false,false) == -1) {
			var inputUrl = '/xbmcCmds/xbmcHttp?command=execmusicdatabase(INSERT INTO albuminfo (idAlbum, iYear, idGenre) VALUES ("'+record.data.idAlbum+'"," '+record.data.iYear+'", "'+record.data.idGenre+'"))';		
			XBMCExecSql(inputUrl);	
		}
		
		record.data.strMoods = Ext.getCmp('scrapermoods').getValue();
		record.data.strStyles = Ext.getCmp('scraperstyles').getValue();
		record.data.strThemes = Ext.getCmp('scraperthemes').getValue();
		record.data.strLabel = Ext.getCmp('scraperlabel').getValue();
		record.data.strType = Ext.getCmp('scrapertype').getValue();
		updateXBMCAlbumScraperInfo(record)
	}
}

function updateStandardAlbuminfo(record)	 {

	if (Ext.getCmp('albumratingfield').isDirty() || Ext.getCmp('albumreviewfield').isDirty()) {
		record.data.iRating = Ext.getCmp('albumratingfield').getValue();
		record.data.strReview = Ext.getCmp('albumreviewfield').getValue();
		updateXBMCAlbumInfo(record)
	};
	
	if (Ext.getCmp('albumartistfield').isDirty() || Ext.getCmp('albumtitlefield').isDirty() || Ext.getCmp('albumgenrefield').isDirty() || Ext.getCmp('albumyearfield').isDirty()) {
		//get the Artist id from combobox
		var x = ArtistStore.findExact('strArtist', Ext.getCmp('albumartistfield').getValue(),0, false, false);
		record.data.idArtist = ArtistStore.getAt(x).data.idArtist;
		record.data.strArtist = Ext.getCmp('albumartistfield').getValue();
		
		//get the Genre id from combobox
		var x = GenreStore.findExact('strGenre', Ext.getCmp('albumgenrefield').getValue(),0, false, false);
		record.data.idGenre = GenreStore.getAt(x).data.idGenre;
		record.data.strGenre = Ext.getCmp('albumgenrefield').getValue();
		
		record.data.strAlbum = Ext.getCmp('albumtitlefield').getValue();
		record.data.iYear = Ext.getCmp('albumyearfield').getValue();		
		
		updateXBMCAlbum(record);
		//update Album store
		AlbumStore.remove(record);
		AlbumStore.add(record);
		AlbumGrid.getStore().reload()

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

	var jsonResponse = xbmcJsonRPC('{"jsonrpc": "2.0", "method": "AudioLibrary.GetAlbumDetails", "params": {"albumid": '+r.data.albumid+', "properties": ["title", "genre", "year", "rating", "theme", "mood", "style", "type", "description"]}, "id": 1}');

	mergeJson(r.data, jsonResponse.albumdetails);

	r.data.details = true;

    var inputUrl = '/xbmcCmds/xbmcHttp?command=querymusicdatabase(SELECT idAlbumInfo, iYear, genre.strGenre, strExtraGenres, strLabel, strImage from albuminfo JOIN genre ON albuminfo.idGenre = genre.idGenre WHERE idAlbum = '+r.data.albumid+')';
    var resp = "";
	Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
		async: false,
        success: function (t){
			resp = t;
			},
        failure: function (t){},
		timeout: 2000
    });

	var temp = resp.responseText.replace(/<\/record>/g, "");
	temp = temp.replace(/<record>/g, "");
	temp = temp.replace(/<recordset>/g, "");
	temp = temp.replace(/<\/recordset>/g, "");
	temp = temp.replace(/<html>/g, "");
	temp = temp.replace(/<\/html>/g, "");
	temp = temp.replace(/<\/field>/g, "");
	temp = temp.split("<field>");

	r.data.idAlbumInfo = temp[1];
	r.data.iYearScraper = temp[2];
	r.data.strGenreScraper = temp[3];
	r.data.strExtraGenres = temp[4];	
	//r.data.strMoods = temp[5];
	//r.data.strStyles = temp[6];
	//r.data.strThemes = temp[7];
	//r.data.strReview = temp[8];
	r.data.strLabel = temp[5];
	//r.data.strType = temp[10];
	r.data.MusicCoverUrl = getMusicCoverList(temp[6], r)
}