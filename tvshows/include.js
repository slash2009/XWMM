
// -----------------------------------------
// TV SHOW include.js
//------------------------------------------ 

Ext.BLANK_IMAGE_URL = '../extjs/resources/images/default/s.gif';
var responseFinale = [];
var movieTable = [];
var selectedMovie;
var currentRecord;
var currentEpisode;
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

	if (currentEpisode.data.watched == "") {
		setXBMCwatched(currentEpisode.data.idFile);
		currentEpisode.data.watched ="1";
		EpisodeGrid.getView().refresh();
	}
};

function setUnwatched() {

	if (currentEpisode.data.watched != "") {
		setXBMCunwatched(currentEpisode.data.idFile);
		currentEpisode.data.watched = "";
		EpisodeGrid.getView().refresh();
	}
};

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
				if (EpisodedetailPanel.getForm().isDirty()) {
					updateXBMCTables(EpisodedetailPanel, 'episode');
					myText = 'updating Episode info';
				};
			};
               if (v == 10) {
				if (TVShowdetailPanel.getForm().isDirty()) {
					updateXBMCTables(TVShowdetailPanel, 'tvshow');
					myText = 'updating TV Show info';
						//need commit here
				};
			};
			if (v == 20) {
				if (Ext.getCmp('showgenres').isDirty()) {
					updateXBMCGenreTvshow();		
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

function movieGenreChange(sm){
	var sel = sm.getSelections();
	var strTemp = "";
	for (var i = 0; i < sel.length; i++) {
		//currentRecord.data.selectedGenre.push(sel[i].data.idGenre);
		if (strTemp == ""){strTemp = sel[i].data.label}
			else{ strTemp = strTemp+' / '+sel[i].data.label};
	}
	selectedTvShow.data.genre = strTemp;

	Ext.getCmp('genreString').setValue(strTemp)
}

function updateTvShowForms(r) {

	tvshowStars.updateSrc(r);
	Ext.getCmp('tvshowcover').updateSrc(r.data.thumbnail);
	var myForm = Ext.getCmp('tvShowdetailPanel');
	
	myForm.getForm().loadRecord(r)
}

function updateEpisodeForms(r) {

	//console.log(r.data.EpisodeTitle,' -- ',r.data.EpisodeSeason);
	episodeStars.updateSrc(r);
	
	EpisodedetailPanel.getForm().loadRecord(r);
	
	Ext.getCmp('videocodec').getEl().dom.src = "../images/flags/"+r.data.streamDetails.video[0].codec+".png";
	Ext.getCmp('aspect').getEl().dom.src = "../images/flags/"+findAspect(r.data.streamDetails.video[0].aspect)+".png";
	Ext.getCmp('resolution').getEl().dom.src = "../images/flags/"+findResolution(r.data.streamDetails.video[0].width)+".png";	
	
	Ext.getCmp('audiochannels').getEl().dom.src = "../images/flags/"+r.data.streamDetails.audio[0].channels+"c.png";
	Ext.getCmp('audiocodec').getEl().dom.src = "../images/flags/"+r.data.streamDetails.audio[0].codec+".png";
	Ext.getCmp('filedetailPanel').getForm().loadRecord(r)
}

function updateXBMCGenreTvshow(){

	var modifiedGenre = Genregrid.getSelectionModel().getSelections();
	
	//update current.selected genres
	var currentTVShow = Ext.getCmp('tvshowgrid').getSelectionModel().getSelected();
	
	currentTVShow.data.selectedGenre = modifiedGenre;
	
	idShow = currentTVShow.data.idShow;

	// remove any existing genre for the movie idMovie
	var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(DELETE FROM genrelinktvshow WHERE idShow='+idShow+')';
	Ext.Ajax.request({
		url: inputUrl,
		method: 'GET',
		async: false,
		success: function (t){},
		failure: function(t){},
		timeout: 2000
	});	
	// insert selected genres 
	for (var i = 0; i < modifiedGenre.length; i++){
		var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(INSERT INTO genrelinktvshow (idGenre, idShow) VALUES ('+modifiedGenre[i].data.idGenre+','+idShow+'))';
		Ext.Ajax.request({
			url: inputUrl,
			method: 'GET',
			//async: false,
			success: function (t){},
			failure: function(t){},
			timeout: 2000
		});
	}
}
		
var Checkgenre = new Ext.grid.CheckboxSelectionModel({
	dataIndex:'idGenre',
	alwaysSelectOnCheck: 'true',
	header: false,
	listeners: {
		selectionchange: function(sm) {
			genresFlag = true
			var bt = Ext.getCmp('savebutton');
			bt.enable()
		}
	}
})

function checkWateched(val) {
 if (val > 0)
	return '<img src=../images/icons/checked.png>';
}


var episodecolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'episode', width: 30},
		{header: "title", dataIndex: 'title', width: 130},
		{header: "W", dataIndex: 'playcount', width: 25, renderer: checkWateched}
    ]);
	
var tvShowcolModel = new Ext.grid.ColumnModel([
		{header: "Title", width: 155, dataIndex: 'title'},
		{header: "", dataIndex: 'playcount', width: 25, renderer: checkWateched}
    ]);

var seasoncolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'season', hidden: true},
		{header: "Season", width: 115, dataIndex: 'label'}
    ]);
	
//Ext.BLANK_IMAGE_URL = 'extjs/resources/../images/stars/default/s.gif';