
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
		if (strTemp == ""){strTemp = sel[i].data.strGenre}
			else{ strTemp = strTemp+' / '+sel[i].data.strGenre};
	}
	currentRecord.data.ShowGenre = strTemp;
	Ext.getCmp('showgenres').setValue(strTemp)
}

function updateTvShowForms(r) {

	Ext.getCmp('tvshowrating').updateSrc(r);
	Ext.getCmp('tvshowcover').updateSrc(r);
	Ext.getCmp('seasoncover').updateSrc(r, -1);
	var myForm = Ext.getCmp('tvShowdetailPanel');
	myForm.getForm().loadRecord(r);
}

function updateEpisodeForms(r) {

	//console.log(r.data.EpisodeTitle,' -- ',r.data.EpisodeSeason);
	Ext.getCmp('episoderating').updateSrc(r);			
	Ext.getCmp('seasoncover').updateSrc(r, r.data.EpisodeSeason);
	Ext.getCmp('episodedetailPanel').getForm().loadRecord(r);
	Ext.getCmp('videocodec').getEl().dom.src = "../images/flags/"+r.data.strVideoCodec+".png";
	Ext.getCmp('aspect').getEl().dom.src = "../images/flags/"+findAspect(r.data.fVideoAspect)+".png";
	Ext.getCmp('resolution').getEl().dom.src = "../images/flags/"+findResolution(r.data.iVideoWidth)+".png";	
	Ext.getCmp('audiochannels').getEl().dom.src = "../images/flags/"+r.data.iAudioChannels+"c.png";
	Ext.getCmp('audiocodec').getEl().dom.src = "../images/flags/"+r.data.strAudioCodec+".png"
	Ext.getCmp('filedetailPanel').getForm().loadRecord(r);
}

function GettvShowDetails(r){

	//setXBMCResponseFormat();

	var inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT c01, c04, c05, c06, c08, c11, c12, c14, strPath FROM tvshow JOIN tvshowlinkpath ON (tvshow.idShow = tvshowlinkpath.idShow) JOIN path ON (tvshowlinkpath.idPath = path.idPath) WHERE tvshow.idShow='+r.data.idShow+')';
	Ext.Ajax.request({
		url: inputUrl,
		method: 'GET',
		async: false,
		success: function(resp,opt) {
			XBMCTVShowgetFields(resp, r);
			currentShowPath = r.data.ShowPath;			
			updateTvShowForms(r);
			r.data.details = true			
		},
		failure: function(resp,opt) {},
		timeout: 2000
	});
}

function GetepisodeDetails(r) {

	//setXBMCResponseFormat();

	var conn = new Ext.data.Connection();
	conn.request({
		//url: "/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT c00, c01, c03, c04, c05, c10, strPath, strFilename, episode.idFile FROM episode JOIN files ON (episode.idFile = files.idFile)  JOIN path ON (files.idPath = path.idPath) where episode.idEpisode="+r.data.idEpisode+")",
		url: "/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT c00, c01, c03, c04, c05, c10, strPath, strFilename, idFile, playCount FROM episodeview WHERE idEpisode="+r.data.idEpisode+")",
		success: function(resp,opt) {
			XBMCEpisodegetFields(resp, r);
			GetVideoStreams(r);
			GetAudioStreams(r);		
			updateEpisodeForms(r);
		},
		failure: function(resp,opt) {}
	});
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

// Query XBMC DB genrelinktvshow
function GetTvshowGenres(record){
	if (record.data.selectedGenre == undefined){
		// get movie genre once
			var inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idGenre FROM genrelinktvshow where idShow='+record.data.idShow+')'
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
						record.data.selectedGenre = responseArr;
						updateGenreGrid(record.data.selectedGenre);
				},
				failure: function(t){},
				timeout: 2000
			});
	}
	else{updateGenreGrid(record.data.selectedGenre)};
}

function updateGenreGrid(t){
	
	Genregrid.getSelectionModel().clearSelections(false);
	Genregrid.getSelectionModel().selectRows(t, true);

	var bt = Ext.getCmp('savebutton');
	bt.disable()
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

 if (val != "")
	return '<img src=../images/icons/checked.png>';
}

function checkWatechedInt(val) {

 if (val != "0")
	return '<img src=../images/icons/checked.png>';
}

var episodecolModel = new Ext.grid.ColumnModel([
		{header: "id", dataIndex: 'idEpisode', hidden: true},
		{header: "#", width: 7, dataIndex: 'EpisodeNumber'},
		{header: "Title", width: 115, dataIndex: 'EpisodeTitle'},
		{header: "Season", dataIndex: 'EpisodeSeason', hidden: true},
		{header: "W", dataIndex: 'watched', width: 25, renderer: checkWateched}
    ]);
	
var tvShowcolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'idShow', hidden: true},
		{header: "Title", width: 155, dataIndex: 'ShowTitle'},
		{header: "Genre", dataIndex: 'Showgenres', hidden: true},
		{header: "", dataIndex: 'watched', width: 25, renderer: checkWatechedInt}
    ]);

var GenrecolModel = new Ext.grid.ColumnModel([
		Checkgenre,
		{header: "#", dataIndex: 'idGenre', hidden: true},
		{header: "Genre", width: 200, dataIndex: 'strGenre'}
    ]);
	
//Ext.BLANK_IMAGE_URL = 'extjs/resources/../images/stars/default/s.gif';