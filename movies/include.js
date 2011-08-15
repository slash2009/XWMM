
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
		Moviegrid.getView().refresh();
};

function setUnwatched() {
		setXBMCunwatched(currentRecord.data.idFile);
		currentRecord.data.watched = "";
		Moviegrid.getView().refresh();
};

function updateXBMCAll() {

	// if (Ext.getCmp('moviegenres').isDirty()) {
		// console.log('test 2');
		// updateXBMCGenreMovie();
	// };

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
					updateXBMCTables(MoviedetailPanel, 'movie');
					myText = 'updating movie info';
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

function LoadAllMoviesdetails(){
	//storeMovieDetails.load();
	//storegenre.load();
	storeVideoFlags.load();
	storeAudioFlags.load();
}

function updateAllForms(r) {

	Ext.getCmp('MoviedetailPanel').getForm().loadRecord(r);
	Ext.getCmp('filedetailPanel').getForm().loadRecord(r);

	Ext.getCmp('movierating').updateSrc(r);
	Ext.getCmp('fanart').updateSrc(r);
	Ext.getCmp('cover').updateSrc(r);
	
	
	Ext.getCmp('videocodec').getEl().dom.src = "../images/flags/"+r.data.strVideoCodec+".png";
	Ext.getCmp('aspect').getEl().dom.src = "../images/flags/"+findAspect(r.data.fVideoAspect)+".png";
	Ext.getCmp('resolution').getEl().dom.src = "../images/flags/"+findResolution(r.data.iVideoWidth)+".png";	

	Ext.getCmp('audiochannels').getEl().dom.src = "../images/flags/"+r.data.iAudioChannels+"c.png";
	Ext.getCmp('audiocodec').getEl().dom.src = "../images/flags/"+r.data.strAudioCodec+".png";
}

function GetMovieDetails(r){

	var inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select c01, c02, c03, c04, c05, c06, c07, c09, c10, c11, c15, c18, c12, c19,  c20, c08 from movie where idMovie='+r.data.idMovie+')';
	Ext.Ajax.request({
		url: inputUrl,
		method: 'GET',
		async: false,
		success: function(resp,opt) {		
			Ext.getCmp('cover').updateSrc(r);
			XBMCgetMoviesFields(resp,r);	
			GetVideoStreams(r);
			GetAudioStreams(r);
			updateAllForms(r);
			r.data.details = true;
		},
		failure: function(t){},
		timeout: 2000
	});	

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
}

function movieGenreChange(sm){

	var sel = sm.getSelections();
	var strTemp = "";
	for (var i = 0; i < sel.length; i++) {
		if (strTemp == ""){strTemp = sel[i].data.strGenre}
			else{ strTemp = strTemp+' / '+sel[i].data.strGenre};
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
		var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(INSERT INTO genrelinkmovie (idGenre, idMovie) VALUES ('+modifiedGenre[i].data.idGenre+','+idMovie+'))';
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

// Query XBMC DB genrelinkmovie
function GetMovieGenres(record){
	if (record.data.genres == undefined){
		// get movie genre once
			var inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idGenre FROM genrelinkmovie where idmovie='+record.data.idMovie+')'
			Ext.Ajax.request({
				url: inputUrl,
				method: 'GET',
				async: false,
				success: function (t){
						var responseArr = TrimXbmcXml(t);
						responseArr = responseArr.split("<record>");
						//first field is always empty
						responseArr.remove("");
						for (var i = 0; i < responseArr.length; i++) {
							responseArr[i]= storegenre.findExact('idGenre',responseArr[i],0,false,false)
						};		
						record.data.genres = responseArr;
						updateGenreGrid(record.data.genres);
				},
				failure: function(t){},
				timeout: 2000
			});
	}
	else{updateGenreGrid(record.data.genres)};
}

function checkWatched(val) {
 if ((val != "" ) && (val != "0"))
	return '<img src=../images/icons/checked.png>';

}

function checkSet(val) {
 if ((val != "" ) && (val != "0"))
	return '<img src=../images/icons/set.png>';

}

function updateGenreGrid(t){

	
	Genregrid.getSelectionModel().clearSelections(false);
	Genregrid.getSelectionModel().selectRows(t, true);

	var bt = Ext.getCmp('savebutton');
	bt.disable();
	genresFlag = false
}

var MoviecolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'idMovie', hidden: true, width: 30},
		{header: "Title", dataIndex: 'Movietitle', width: 215},
		{header: "Description", dataIndex: 'Moviedescr', hidden: true},
		{header: "Duration", dataIndex: 'Movieduration', hidden: true},
		{header: "Director", dataIndex: 'Moviedirector', hidden: true},
		{header: "Rating", dataIndex: 'c05', hidden: true},
		{header: "Genre", dataIndex: 'strGenre', hidden: true},
		{header: "Studio", dataIndex: 'c18', hidden: true},
		{header: "Release", dataIndex: 'c07', hidden: true},
		{header: "file", dataIndex: 'idFile', hidden: true},
		{header: "", dataIndex: 'idSet', width: 25, hidden: false, renderer: checkSet},
		{header: "", dataIndex: 'watched', width: 25, hidden: false, renderer: checkWatched}
    ]);