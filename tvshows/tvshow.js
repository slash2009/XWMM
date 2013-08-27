// -----------------------------------------
// tvshow.js
// last modified : 31-12-2009
// 
//------------------------------------------ 

Ext.ns('TVShow');

var tvShowRecord = Ext.data.Record.create([
   {name: 'title'},	{name: 'TVGenre', mapping: 'genre', convert: genreConvert}, {name: 'year'}, {name: 'plot'}, {name: 'fanart', mapping: 'art', convert: fanartConvert},
   {name: 'banner', mapping: 'art', convert: bannerConvert}, {name: 'tvshowid'}, {name: 'studio'}, {name: 'episode'}, {name: 'rating'}, {name: 'premiered'}, {name: 'tvshowid'},
   {name: 'playcount'}, {name: 'watchedepisodes'}
]);

var seasonRecord = Ext.data.Record.create([
   {name: 'season'}, {name: 'label'}, {name: 'thumbnail', convert: thumbConvert}
]);

var episodeRecord = Ext.data.Record.create([
	{name: 'episode'}, {name: 'title'}, {name: 'rating', convert: ratingConvert}, {name: 'plot'}, {name: 'firstaired'}, {name: 'director'},
	{name: 'streamdetails'}, {name: 'playcount'}, {name: 'episodeid'}
]);

var tvshowStars = new Ext.ux.XbmcStars ({
	border: 0,
	width: 96,
	height:27
});

var episodeStars = new Ext.ux.XbmcStars ({
	width: 72,
	height:20
});

var TVShowCover = new Ext.ux.XbmcImages({
	id: 'tvshowcover',
	cls: 'center-align',
	border: 0,
	width: 380,
	height:70,
	autoEl: {tag: 'img', src: "../images/nobanner.png"}
});

var SeasonCover = new Ext.ux.XbmcImages({
	id: 'seasoncover',
	cls: 'center-align',
	border: 0,
	width: 160,
	height:231,
	autoEl: {tag: 'img', src: "../images/nobanner.png"}
});

function genreConvert(v, record) {
	return record.genre.join(' / ')
}

function thumbConvert(v, record) {
	if (record.thumbnail == undefined){return "";}
	return record.thumbnail.replace(/image:\/\//g, "").slice(0,-1)
}

function bannerConvert(v, record) {
	if (v.banner == undefined){return "";}
	return v.banner.replace(/image:\/\//g, "").slice(0,-1)
}

function fanartConvert(v, record) {
	if (v.fanart == undefined){return "";}
	return v.fanart.replace(/image:\/\//g, "").slice(0,-1)
}


function ratingConvert(v, record) {
	return v.toFixed(1);
}

var storeTvshow = new Ext.data.Store({
	sortInfo: {field: 'title', direction: "ASC"},
	proxy: new Ext.data.XBMCProxy({
		url: "/jsonrpc",
		xbmcParams : {"jsonrpc": "2.0", "method": "VideoLibrary.GetTVShows", "params": {"properties": [ "title", "genre", "year", "rating", "plot","studio", "mpaa", "playcount", "episode", "imdbnumber", "premiered", "votes", "lastplayed", "art", "file", "watchedepisodes" ]},"id": 1}
	}),
	reader: new Ext.data.JsonReader({
		root:'result.tvshows'	       
		}, tvShowRecord)
});


var storeSeason = new Ext.data.Store({
	sortInfo: {field: 'season', direction: "ASC"},
	proxy: new Ext.data.XBMCProxy({
		url: "/jsonrpc"
	}),
	reader: new Ext.data.JsonReader({
		root:'result.seasons'	       
	}, seasonRecord)
});

var storeEpisode = new Ext.data.Store({
	sortInfo: {field: 'episode', direction: "ASC"},
	proxy: new Ext.data.XBMCProxy({
		url: "/jsonrpc"
	}),
	reader: new Ext.data.JsonReader({
		root:'result.episodes'	       
	}, episodeRecord)
})

var TVShowdetailPanel = new Ext.FormPanel({
	region: 'north',
	id: 'tvShowdetailPanel',
	trackResetOnLoad: true,
	title: "<div align='center'>TV Show details</div>",
	defaults:{hideLabels:true, border:false},
	items: [{
		layout: 'column',
		bodyStyle:'padding:5px',
		items:[{
			columnWidth:0.70,
			layout: 'form',
			items:[	TVShowCover]
			},{
			columnWidth : 0.30,
			layout: 'form',
			items: [tvshowStars]
		}]
		},{
		layout:'column',
		frame:true,
		labelWidth:50,
		bodyStyle:'padding:5px',
		items:[{
			columnWidth:0.50,
			layout: 'form',
			labelWidth: 65,
			defaults: {	xtype:'textfield',
				width: 170,
				listeners:{'change' : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
			},
			items: [{
				fieldLabel: 'Title',
				name: 'title',
				XBMCName: 'c00',
				allowBlank: false
			},{
				fieldLabel: 'Genres',
				name: 'TVGenre',
				XBMCName: 'c08',
				readOnly: true,
				id: 'genreString'
			},{
				fieldLabel: 'First aired',
				XBMCName: 'c05',
				name: 'premiered'
			},{
				fieldLabel: 'Channel',
				XBMCName: 'c14',
				name: 'studio'
			}]

		},{ 
			columnWidth:0.50,
			defaults:{ xtype:'container', 
				width: 260,
				listeners:{'change' : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}},
			items: [{
				xtype:'textarea',
				fieldLabel: 'Description',
				name: 'plot',
				XBMCName: 'c01',
				height: 100
			}]
		}]

	}]
})

var EpisodedetailPanel = new Ext.FormPanel({
	//width: 600,
	region: 'center',
	id: 'episodedetailPanel',
	trackResetOnLoad : true,
	title: "<div align='center'>Movie details</div>",
	defaults:{hideLabels:true, border:false}, 
	layout:'table',
	layoutConfig: {columns:2},
	defaults: {frame:true, labelWidth: 60},
	items:[{
		layout: 'form',
		width : 370,
		defaults: {	xtype:'textfield',
			width: 275,
			listeners:{'change' : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
		},
		items: [{
			fieldLabel: 'Title',
			name: 'title',
			XBMCName: 'c00',
			allowBlank: false
		},{
			fieldLabel: 'Aired',
			name: 'firstaired',
			XBMCName: 'c05'
		},{
			xtype:'textarea',
			fieldLabel: 'Description',
			name: 'plot',
			XBMCName: 'c01',
			height: 145
		},{
			fieldLabel: 'Director',
			name: 'director',
			XBMCName: 'c10'
		},{
			fieldLabel: 'Rating',
			name: 'rating',
			XBMCName: 'c03'
		}]
	},{
		width:170,
		items: [episodeStars, SeasonCover]
	},{
		items: [VideoFlagsPanel]
	},{
		items: [AudioFlagsPanel]
	}]
})

// grid with list of movies
TvShowGrid = new Ext.grid.GridPanel({
	cm: tvShowcolModel,
	id: 'tvshowgrid',
	title: 'TV Shows List',
	enableDragDrop: false,
	stripeRows: true,
	viewconfig: {forceFit: true},
	sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
	height: 300,
	store: storeTvshow
});

SeasonGrid = new Ext.grid.GridPanel({
	cm: seasoncolModel,
	title: 'Seasons',
	enableDragDrop: false,
	stripeRows: true,
	viewconfig: {forceFit: true},
	sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
	height: 300,
	store: storeSeason
});

EpisodeGrid = new Ext.grid.GridPanel({
	cm: episodecolModel,
	frame: true,
	rowspan: 2,
	height: 600,
	loadMask: true,
	title: 'Episodes List',
	enableDragDrop: false,
	viewconfig: {forceFit: true},
	sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
	listeners:{
        rowcontextmenu:{stopEvent:true, fn:function(grid, rowIndex, e) {
            gridContextMenu.showAt(e.getXY());    
            e.stopEvent();
            return false;
        }}
	},
	store: storeEpisode
});

var fileDetailsPanel = new Ext.FormPanel({
	id: 'filedetailPanel',
	title: 'Other details',
	labelWidth:50,
	frame: true,
	bodyStyle:'padding:5px',
	defaults: {width: 140, xtype: 'textfield'},
	items: [{
		fieldLabel: 'Name',
		name: 'strFilename',
		readOnly: true,
		XBMCName: 'c00'
	},{
		fieldLabel: 'Directory',
		name: 'strPath',
		readOnly: true,
		XBMCName: 'c05'
	}]
})

//Main Panel
TVShow.Mainpanel = Ext.extend(Ext.Panel, {
	initComponent: function() {
		Ext.applyIf(this, {
			frame: true,
			title: 'TV Shows List',
			width: 1250,
			height: 700,
			loadMask: true,
			layout: 'border',
			renderTo: Ext.getBody(),
		items: [{		
			xtype: 'panel',
			region:'east',
			margins:'5 5 5 5',
			split:true,
			width: 225,
			items: [{
				layout:'accordion',
				height: 500,
				items:[
					Genregrid,
					actorGrid,
					fileDetailsPanel
				]
			}]	
		},
			menuBar,
		{
			xtype : 'panel',
			region: "west",
			width: 450,
			layout: {type: 'table',	columns: 2},
			defaults: {frame:true, width:225},
			//width: 450,
			items: [
				TvShowGrid,
				EpisodeGrid,
				SeasonGrid
			]
		},{
			xtype: 'panel',
			region: "center",
			id: 'mainpanel',
			buttons: [{
				disabled: true,
				text:'Save',
				id: 'savebutton',
				handler: function(e){
					updateXBMCAll();
					this.disable();
				}
			},{
				text:'Cancel',
				handler: function(){
					updateGenreGrid(currentRecord.data.genres)
				}
			}],
			items: [
				TVShowdetailPanel,
				EpisodedetailPanel
			]
		}
		]
		})
			
		TVShow.Mainpanel.superclass.initComponent.call(this);
	},
	
	initEvents: function() {
		TVShow.Mainpanel.superclass.initEvents.call(this);
		
		var currentShow = TvShowGrid.getSelectionModel();
		currentShow.on('rowselect', this.tvShowSelect, this);
		
		var currentSeason = SeasonGrid.getSelectionModel();
		currentSeason.on('rowselect', this.seasonSelect, this);
		
		var currentEpisode = EpisodeGrid.getSelectionModel();
		currentEpisode.on('rowselect', this.episodeSelect, this);
	},

	tvShowSelect: function(sm, rowIdx, r) {

		selectedTvShow = r
		var myTvShow = r.data.tvshowid;
		TVShowdetailPanel.setTitle("<div align='center'>"+r.data.title+" ( "+r.data.episode+" Episodes / "+r.data.watchedepisodes+" watched )</div>");
		EpisodedetailPanel.setTitle("<div align='center'>Select Episode</div>");
		
		SeasonGrid.setTitle("<div align='center'> "+r.data.title+" Seasons</div>");

		GetTvshowGenres(selectedTvShow);
		
		GettvShowDetails(r);
		updateTvShowForms(r);
		// corriger ici le refresh de la grille des genres
		
		//storegenre.selectFromString(r.data.genre);
		storeSeason.proxy.conn.xbmcParams = {"jsonrpc": "2.0", "method": "VideoLibrary.GetSeasons", "params": {"tvshowid": myTvShow, "properties": [ "season", "thumbnail"]},"id": 1};
		storeSeason.load();

	},
	
	seasonSelect: function(sm, rowIdx, r) {

		selectedSeason = r
		var mySeason = r.data.season;
		var myTvShow = selectedTvShow.data.tvshowid;
		
		EpisodedetailPanel.setTitle("<div align='center'> Season "+mySeason+" / Select Episode</div>");
		SeasonCover.updateSrc(r.data.thumbnail);
		EpisodedetailPanel.getForm().reset();
		//Ext.getCmp('episodedetailPanel').getForm().reset(); does not work

		storeEpisode.proxy.conn.xbmcParams = {"jsonrpc": "2.0", "method": "VideoLibrary.GetEpisodes", "params": {"tvshowid": myTvShow, "season": mySeason, "properties": [ "episode", "title", "rating", "plot", "firstaired", "director", "streamdetails", "playcount"]},"id": 1};
		storeEpisode.load();
		
		storeActor.proxy.conn.xbmcParams = {"jsonrpc": "2.0", "method": "VideoLibrary.GetTVshowDetails", "params": {"tvshowid": myTvShow, "properties": ["cast"]},"id": 1};
		storeActor.load();
	},
	
	episodeSelect: function(sm, rowIdx, r) {		

		selectedEpisode = r;
		var mySeason = selectedSeason.data.season;
		//GetepisodeDetails(r);
		EpisodedetailPanel.setTitle("<div align='center'> Season "+mySeason+" / Episode "+r.data.episode+"</div>");
		updateEpisodeForms(r)
	}

	
});
Ext.reg('Mainpanel', TVShow.Mainpanel);
