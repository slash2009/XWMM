
// -----------------------------------------
// MOVIE include.js
//------------------------------------------ 

Ext.BLANK_IMAGE_URL = '../extjs/resources/images/default/s.gif';
var responseFinale = [];
var movieTable = [];
var selectedMovie;
var currentRecord;
var currentMovie;
var DetailsFlag;
var genresFlag;
var detailPanel;


var gridContextMenu = new Ext.menu.Menu({
	items: [
		{ text: 'Mark as watched', handler: setWatched },
		{ text: 'Mark as unwatched', handler: setUnwatched }		
	]
});

function setWatched() {
		setXBMCwatched(currentRecord.data.idFile);
		currentRecord.data.watched ="1";
		Moviegrid.getView().refresh()
};

function setUnwatched() {
		setXBMCunwatched(currentRecord.data.idFile);
		currentRecord.data.watched = "";
		Moviegrid.getView().refresh()
};


function updateXBMCSet(item) {
	var currentMovie = currentRecord; //Moviegrid.getSelectionModel().getSelected();
	if (item.value == "") {
	// remove existing record in setlinkmovie
		myId = "";
		var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(DELETE FROM setlinkmovie WHERE idMovie = "'+currentMovie.data.idMovie+'")';
	}
	else {
		var myId = MovieSetStore.getAt(MovieSetStore.findExact('strSet', item.value)).data.idSet;
		if (item.value != item.originalValue) {
			if (item.originalValue == "") {
				// Add new record in setlinkmovie
				var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(INSERT INTO setlinkmovie (idSet, idMovie) VALUES ('+myId+','+currentMovie.data.idMovie+'))';				
			}
			else {
				// modify existing record in setlinkmovie
				var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(INSERT INTO setlinkmovie (idSet, idMovie) VALUES ("'+record.data.idMovie+'"))';
			}

		}
	}
	XBMCExecSql(inputUrl);
	item.IsDirty = false;
	item.originalValue = item.getValue();
	currentMovie.data.idSet = myId;
	currentMovie.data.strSet = item.value;
	Moviegrid.getView().refresh()
}

function updateXBMCAll() {

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
				if (MoviedetailPanel.getForm().isDirty()) {
					updateXBMCTables(MoviedetailPanel.getForm(), 'movie');
					myText = 'updating movie info';
				};
				if (Ext.getCmp('moviesetcombo').isDirty()) {
					updateXBMCSet(Ext.getCmp('moviesetcombo'));
					myText = 'updating Sets'
				} 
				if (fileDetailsPanel.getForm().isDirty()) {
					updateXBMCTables(fileDetailsPanel.getForm(), 'movie');
					myText = 'updating additional info';
				};
			};
            if (v == 15) {
				if (Ext.getCmp('moviegenres').isDirty()) {				
					updateXBMCGenreMovie();		
					myText = 'updating Genres'
				};
			};
			Ext.MessageBox.updateProgress(i, myText);
        }
        };
    };
    for(var i = 1; i < 31; i++){
        setTimeout(f(i), i*100);
    }
}

// function LoadAllMoviesdetails(){
	// storeVideoFlags.load();
	// storeAudioFlags.load();
// }

function updateAllForms(r) {

	Ext.getCmp('MoviedetailPanel').getForm().loadRecord(r);
	Ext.getCmp('filedetailPanel').getForm().loadRecord(r);

	Ext.getCmp('movierating').updateSrc(r);
	Ext.getCmp('fanart').updateSrc(r.data.fanart);
	Ext.getCmp('cover').updateSrc(r.data.thumbnail);
	
	if (r.data.streamdetails != null) {
		if (r.data.streamdetails.video != null) {
			Ext.getCmp('videocodec').getEl().dom.src = "../images/flags/"+r.data.streamdetails.video[0].codec+".png";
			Ext.getCmp('aspect').getEl().dom.src = "../images/flags/"+findAspect(r.data.streamdetails.video[0].aspect)+".png";
			Ext.getCmp('resolution').getEl().dom.src = "../images/flags/"+findResolution(r.data.streamdetails.video[0].width)+".png"
		}
		
		if (r.data.streamdetails.audio != null) {
			Ext.getCmp('audiochannels').getEl().dom.src = "../images/flags/"+r.data.streamdetails.audio[0].channels+"c.png";
			Ext.getCmp('audiocodec').getEl().dom.src = "../images/flags/"+r.data.streamdetails.audio[0].codec+".png"
		}
	}
}

function GetMovieDetails(r){

	var jsonResponse = xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovieDetails", "params": {"movieid": '+r.data.idMovie+', "properties": ["title", "genre", "year", "rating", "director", "trailer", "tagline", "plot", "plotoutline", "originaltitle", "playcount", "writer", "studio", "mpaa", "country", "imdbnumber", "premiered", "productioncode", "runtime", "streamdetails", "top250", "votes", "set", "fanart", "thumbnail", "file", "sorttitle"]}, "id": 1}');

	mergeJson(r.data, jsonResponse.moviedetails);

		var inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select c20, c08 from movie where idMovie='+r.data.idMovie+')';
	Ext.Ajax.request({
		url: inputUrl,
		method: 'GET',
		async: false,
		success: function(resp,opt) {		
			XBMCgetMoviesFields(resp,r);	
		},
		failure: function(t){},
		timeout: 2000
	});	
	
	updateAllForms(r);
	r.data.details = true;
}

function updateXBMCMovieDetails() {

	var changedData = new Array();
	var itemsList = Ext.getCmp('MoviedetailPanel').form.items.items;
	for (var i = 0; i < itemsList.length; i++){
		f = itemsList[i];
		if(f.isDirty()){
			var data = f.getName()+' : '+f.getValue();
			changedData.push(data);
		}
	}
	// also check additional fields
	itemsList = Ext.getCmp('filedetailPanel').form.items.items;
	for (var i = 0; i < itemsList.length; i++){
		f = itemsList[i];
		if(f.isDirty()){
			var data = f.getName()+' : '+f.getValue();
			changedData.push(data);
		}
	}
}

function movieGenreChange(sm){
	var sel = sm.getSelections();
	var strTemp = "";
	for (var i = 0; i < sel.length; i++) {
		if (strTemp == ""){strTemp = sel[i].data.label}
			else{ strTemp = strTemp+' / '+sel[i].data.label};
	}
	currentRecord.data.Moviegenres = strTemp;
	Ext.getCmp('moviegenres').setValue(strTemp)

}
	
function updateXBMCGenreMovie(){

	var modifiedGenre = Genregrid.getSelectionModel().getSelections();
	
	currentRecord.data.selectedGenre = modifiedGenre;
	
	idMovie = currentRecord.data.idMovie;

	// remove any existing genre for the movie idMovie
	var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(DELETE FROM genrelinkmovie WHERE idMovie='+idMovie+')';
	Ext.Ajax.request({
		url: inputUrl,
		method: 'GET',
		async: true,
		success: function (t){},
		failure: function(t){},
		timeout: 2000
	});	
	// remove associated records from StoreMovie
	// insert selected genres 
	for (var i = 0; i < modifiedGenre.length; i++){
		var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(INSERT INTO genrelinkmovie (idGenre, idMovie) VALUES ('+modifiedGenre[i].data.genreid+','+idMovie+'))';
		Ext.Ajax.request({
			url: inputUrl,
			method: 'GET',
			async: true,
			success: function (t){},
			failure: function(t){},
			timeout: 2000
		});
	// add associated records from StoreMovie
	}
}

function GetMovieGenres(record){
	var responseArr = [];
	var myGenres = record.data.Moviegenres.split('/');
	
	for (var i = 0; i < myGenres.length; i++) {
		responseArr[i]= storegenre.findExact('label',removeSpace(myGenres[i]),0,false,false)
	};	
	updateGenreGrid(responseArr);
}

function checkWatched(val) {
 if ((val != "" ) && (val != "0"))
	return '<img src=../images/icons/checked.png>'

}

function checkSet(val) {
 if ((typeof(val[0]) != "undefined" ))
	return '<img src=../images/icons/set.png>'
}

var MoviecolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'idMovie', hidden: true, width: 30},
		{header: "Title", dataIndex: 'Movietitle', width: 210},
		{header: "S", dataIndex: 'strSet', width: 26, hidden: false, renderer: checkSet},
		{header: "Genre", dataIndex: 'strGenre', hidden: true},
		{header: "W", dataIndex: 'watched', width: 26, hidden: false, renderer: checkWatched},
		
    ]);