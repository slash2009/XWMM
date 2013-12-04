
// -----------------------------------------
// TV SHOW include.js
//------------------------------------------ 

Ext.BLANK_IMAGE_URL = '../extjs/resources/images/default/s.gif';
var responseFinale = [];
var movieTable = [];
var selectedMovie;
var currentRecord;
var currentMovie;
var genresFlag;
var detailPanel;


var gridContextMenu = new Ext.menu.Menu({
	items: [
		{ text: 'Mark as watched', handler: setWatched },
		{ text: 'Mark as unwatched', handler: setUnwatched }		
	]
});

function setWatched() {
	if (selectedEpisode.data.watched == "") {
		setXBMCwatched(selectedEpisode.data.idFile);
		selectedEpisode.data.watched ="1";
		EpisodeGrid.getView().refresh();
	}
}

function setUnwatched() {
	if (selectedEpisode.data.watched != "") {
		setXBMCunwatched(selectedEpisode.data.idFile);
		selectedEpisode.data.watched = "";
		EpisodeGrid.getView().refresh()
	}
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
	});
	var f = function(v){
        return function(){
		if(v == 30){
            Ext.MessageBox.hide();
        }else{
            var i = v/29;
			if (v == 1) {
				myText = 'Checking changes...';
				if (EpisodedetailPanel.getForm().isDirty()) {
					updateXBMCTables(EpisodedetailPanel.getForm(), 'episode', EpisodeGrid.getSelectionModel().getSelected().data.episodeid);
					myText = 'updating Episode info';
				}
			}
               if (v == 10) {
				if (TVShowdetailPanel.getForm().isDirty()) {
					updateXBMCTables(TVShowdetailPanel.getForm(), 'tvshow', TvShowGrid.getSelectionModel().getSelected().data.tvshowid);
					myText = 'updating TV Show info';
						//need commit here
				}
			}
			if (v == 20) {
				if (Ext.getCmp('genreString').isDirty()) {
					updateXBMCGenreTvshow();		
					myText = 'updating Genres'
				}
			}
			Ext.MessageBox.updateProgress(i, myText);
        }
        }
    };
    for(var i = 1; i < 31; i++){
        setTimeout(f(i), i*100);
    }
}

function movieGenreChange(sm){

	var sel = sm.getSelections();
	var strTemp = "";
	for (var i = 0; i < sel.length; i++) {
		if (strTemp == ""){strTemp = sel[i].data.label}
			else{ strTemp = strTemp+' / '+sel[i].data.label};
	}
	selectedTvShow.data.genre = strTemp;
	Ext.getCmp('genreString').setValue(strTemp)
}

function updateTvShowForms(r) {

	tvshowStars.updateSrc(r);
	Ext.getCmp('tvshowcover').updateSrc(r.data.banner)
	//Ext.getCmp('seasoncover').updateSrc(r, -1);
	var myForm = Ext.getCmp('tvShowdetailPanel');
	myForm.getForm().loadRecord(r)
}

function updateEpisodeForms(r) {

	episodeStars.updateSrc(r);
	//Ext.getCmp('seasoncover').updateSrc(r, r.data.EpisodeSeason);
	
	Ext.getCmp('episodedetailPanel').getForm().loadRecord(r);
	
	if (r.data.streamdetails != null) {
		Ext.getCmp('videocodec').getEl().dom.src = "../images/flags/"+r.data.streamdetails.video[0].codec+".png";
		Ext.getCmp('aspect').getEl().dom.src = "../images/flags/"+findAspect(r.data.streamdetails.video[0].aspect)+".png";
		Ext.getCmp('resolution').getEl().dom.src = "../images/flags/"+findResolution(r.data.streamdetails.video[0].width)+".png";			
		Ext.getCmp('audiochannels').getEl().dom.src = "../images/flags/"+r.data.streamdetails.audio[0].channels+"c.png";
		Ext.getCmp('audiocodec').getEl().dom.src = "../images/flags/"+r.data.streamdetails.audio[0].codec+".png";
	}
	Ext.getCmp('filedetailPanel').getForm().loadRecord(r);
}

function GettvShowDetails(r){

	var jsonResponse = xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.GetTvShowDetails", "params": {"tvshowid": '+r.data.tvshowid+', "properties": ["title", "genre", "year", "rating",  "plot", "playcount", "studio", "mpaa",  "premiered", "votes", "fanart", "thumbnail", "file", "episodeguide" ]}, "id": 1}');

	mergeJson(r.data, jsonResponse.tvshowdetails);
	
	//fix up some data retrieved
	r.data.fanart = jsonResponse.tvshowdetails.fanart.replace(/image:\/\//g, "").slice(0,-1);
	r.data.thumbnail = jsonResponse.tvshowdetails.thumbnail.replace(/image:\/\//g, "").slice(0,-1);
	updateTvShowForms(r);
	r.data.details = true
}

function updateXBMCGenreTvshow(){
	var parmArray = [];
	var jsParam = '';
	var modifiedGenre = Genregrid.getSelectionModel().getSelections();
	
	//update current.selected genres
	var currentTVShow = Ext.getCmp('tvshowgrid').getSelectionModel().getSelected();
	
	currentTVShow.data.selectedGenre = modifiedGenre;
	tvshowid = currentTVShow.data.tvshowid;

	for (var i = 0; i < modifiedGenre.length; i++){
		parmArray[i] = modifiedGenre[i].data.label;
	}
	if (parmArray.length == 1) {
		jsParam = '"' + parmArray[0] + '"';
		}
	else {
		jsParam = '"' + parmArray.join('","') + '"';
		}
	xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.SetTVShowDetails", "params": {"tvshowid": '+tvshowid+', "genre": ['+jsParam+']}, "id": 1}');
}

// Query XBMC DB genrelinktvshow
function GetTvshowGenres(record){
	var responseArr = [];
	var myGenres = record.data.TVGenre.split('/');
	
	for (var i = 0; i < myGenres.length; i++) {
		responseArr[i]= storegenre.findExact('label',removeSpace(myGenres[i]),0,false,false)
	}
	updateGenreGrid(responseArr)
}


function checkWatched(val) {
    if (val != "")
    {
        return '<img src=../images/icons/checked.png>';
    }

    return "";
}

function checkWatechedInt(val) {
    if (val != "0")
    {
        return '<img src=../images/icons/checked.png>';
    }

    return "";
}

var episodecolModel = new Ext.grid.ColumnModel([
	{header: "#", dataIndex: 'episode', width: 30},
	{header: "title", dataIndex: 'title', width: 130},
	{header: "W", dataIndex: 'playcount', width: 25, renderer: checkWatched}
]);
	
var tvShowcolModel = new Ext.grid.ColumnModel([
	{header: "Title", width: 155, dataIndex: 'title'},
	{header: "W", dataIndex: 'playcount', width: 25, renderer: checkWatched}
]);

var seasoncolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'season', hidden: true},
		{header: "Season", width: 115, dataIndex: 'label'}
    ]);
	
//Ext.BLANK_IMAGE_URL = 'extjs/resources/../images/stars/default/s.gif';
