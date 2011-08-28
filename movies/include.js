
// -----------------------------------------
// MOVIE include.js
//------------------------------------------ 

Ext.BLANK_IMAGE_URL = '../extjs/resources/images/default/s.gif';
var selectedMovie;
var currentRecord;
var currentMovie;

// context menu to set watched or unwatched
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

// saving changes
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
					updateXBMCTables(MoviedetailPanel, 'movie');
					myText = 'updating movie info';
				};
			};
            if (v == 15) {
					updateXBMCGenreMovie();		
					myText = 'updating Genres'
			};
			Ext.MessageBox.updateProgress(i, myText);
        }
        };
    };
    for(var i = 1; i < 31; i++){
        setTimeout(f(i), i*100);
    }
}

// refresh form on item selection
function updateAllForms(r) {

	Ext.getCmp('MoviedetailPanel').getForm().loadRecord(r);
	Ext.getCmp('filedetailPanel').getForm().loadRecord(r);

	Ext.getCmp('movierating').updateSrc(r);
	Ext.getCmp('fanart').updateSrc(r.data.fanart);
	Ext.getCmp('cover').updateSrc(r.data.thumbnail);
	
	Ext.getCmp('videocodec').getEl().dom.src = "../images/flags/"+r.data.streamDetails.video[0].codec+".png";
	Ext.getCmp('aspect').getEl().dom.src = "../images/flags/"+findAspect(r.data.streamDetails.video[0].aspect)+".png";
	Ext.getCmp('resolution').getEl().dom.src = "../images/flags/"+findResolution(r.data.streamDetails.video[0].width)+".png";	
	
	Ext.getCmp('audiochannels').getEl().dom.src = "../images/flags/"+r.data.streamDetails.audio[0].channels+"c.png";
	Ext.getCmp('audiocodec').getEl().dom.src = "../images/flags/"+r.data.streamDetails.audio[0].codec+".png";
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

// update movie genre field when a genre is selected (manually or when movie is selected)
function movieGenreChange(sm){

	var sel = sm.getSelections();
	var strTemp = "";
	for (var i = 0; i < sel.length; i++) {
		if (strTemp == ""){strTemp = sel[i].data.label}
			else{ strTemp = strTemp+' / '+sel[i].data.label}
	}
	currentRecord.data.genre = strTemp;

	Ext.getCmp('genreString').setValue(strTemp)
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


