
// -----------------------------------------
// tvshow.js
// last modified : 31-12-2009
// 
//------------------------------------------ 

Ext.ns('TVShow');

var tvShowRecord = Ext.data.Record.create([
   {name: 'idShow', mapping: 'field:nth(1)'},		
   {name: 'ShowTitle', mapping: 'field:nth(2)'},	//c00
   {name: 'Showgenres', mapping: 'field:nth(3)'},	//c08
   {name: 'totalCount', mapping: 'field:nth(4)'},
   {name: 'watchedCount', mapping: 'field:nth(5)'},
   {name: 'watched', mapping: 'field:nth(6)'}
]);

var episodeRecord = Ext.data.Record.create([
	{name: 'idEpisode', mapping: 'field:nth(1)'},		
	{name: 'EpisodeTitle', mapping: 'field:nth(2)'},	//c00
	{name: 'EpisodeSeason', type: 'int', mapping: 'field:nth(3)'},	//c12
	{name: 'EpisodeNumber', type: 'int', mapping: 'field:nth(4)'},
	{name: 'watched', type: 'int', mapping: 'field:nth(5)'}
]);

var TVShowstars = new Ext.Container ({
	id: 'tvshowrating',
	border: 0,
	width: 96,
	height:27,
	autoEl: {tag: 'img', src: "../images/stars/0.png"},
	updateSrc :function(r){
		if (r.data.details)	{
			this.el.dom.src = r.data.ShowStars
		}
		else {
			var value = Math.round(r.data.ShowRating);
			r.data.ShowStars =  '../images/stars/'+value+'.png';
			this.el.dom.src = r.data.ShowStars;
		}
	}
});

var EpisodeStars = new Ext.Container ({
	id: 'episoderating',
	border: 0,
	width: 72,
	height:20,
	autoEl: {tag: 'img', src: "../images/stars/0.png"},
		updateSrc :function(r){
		if (r.data.details)	{
			this.el.dom.src = r.data.EpisodeRatingStars
		}
		else {
			var value = Math.round(r.data.EpisodeRating);
			r.data.EpisodeRatingStars =  '../images/stars/'+value+'.png';
			this.el.dom.src = r.data.EpisodeRatingStars;
		}
	}

});

var TVShowCover = new Ext.Container ({
	id: 'tvshowcover',
	cls: 'center-align',
	border: 0,
	width: 380,
	height:70,
	autoEl: {tag: 'img', src: "../images/nobanner.png"},
	updateSrc :function(r){
		if (r.data.details)	{
			this.el.dom.src = '../../vfs/'+ r.data.cover;
		}
		else {	
			thumbCrc = FindCRC(r.data.ShowPath);
			r.data.cover = 'special://masterprofile/Thumbnails/Video/'+thumbCrc.substring(0,1)+'/'+thumbCrc+'.tbn';
			this.el.dom.src = '../../vfs/'+ r.data.cover;
			// this.el.dom.src = '../../vfs/special://masterprofile/Thumbnails/Video/'+thumbCrc.substring(0,1)+'/'+thumbCrc+'.tbn';
			// r.data.cover = this.el.dom.src
			//copyXBMCVideoThumb(thumbCrc,r, this, "cover");			
		}
	}
});

var SeasonCover = new Ext.Container ({
	id: 'seasoncover',
	cls: 'center-align',
	border: 0,
	width: 160,
	height:231,
	autoEl: {tag: 'img', src: "../images/defaultMovieCover.jpg"},
	updateSrc :function(r, season){
		
		var selectedTVShow = Ext.getCmp('tvshowgrid').getSelectionModel().getSelected();

		if (season == -1) {
			if (selectedTVShow.data.allseason == undefined) {
				thumbCrc = FindCRC("season"+selectedTVShow.data.ShowPath+"* All Seasons");
				this.el.dom.src = '../../vfs/special://masterprofile/Thumbnails/Video/'+thumbCrc.substring(0,1)+'/'+thumbCrc+'.tbn';
				selectedTVShow.data.allSeason = this.el.dom.src;
				//copyXBMCVideoBanner(thumbCrc, selectedTVShow, this, season)
			}
			else {this.el.dom.src = selectedTVShow.data.allSeason}
			}
		else {
			if (selectedTVShow.data.seasonCover == undefined){selectedTVShow.data.seasonCover =[]};
			if (selectedTVShow.data.seasonCover[season] == undefined) {
				thumbCrc = FindCRC("season"+selectedTVShow.data.ShowPath+"Season "+season);
				this.el.dom.src = '../../vfs/special://masterprofile/Thumbnails/Video/'+thumbCrc.substring(0,1)+'/'+thumbCrc+'.tbn';
				selectedTVShow.data.seasonCover[season] = this.el.dom.src;
				//copyXBMCVideoBanner(thumbCrc, selectedTVShow, this, season)
			}
			else {this.el.dom.src = selectedTVShow.data.seasonCover[season]}
		}	
	}
});

TVShow.Store = function(config) {
	var config = config || {};
	Ext.applyIf(config, {
		sortInfo: {field: 'ShowTitle', direction: "ASC"},
		reader: new Ext.data.JsonXBMCReader({
			root:'data'	       
       }, tvShowRecord)
	});
	TVShow.Store.superclass.constructor.call(this, config)
};
Ext.extend(TVShow.Store, Ext.data.GroupingStore);

TVShow.EpiStore = function(config) {
	var config = config || {};
	Ext.applyIf(config, {
		sortInfo: {field: 'EpisodeNumber', direction: "ASC"},
		groupField: 'EpisodeSeason',
		reader: new Ext.data.JsonXBMCReader({
			root:'data'	       
       }, episodeRecord)
	});
	TVShow.EpiStore.superclass.constructor.call(this, config)
};
Ext.extend(TVShow.EpiStore, Ext.data.GroupingStore);

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
			items: [TVShowstars]
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
				name: 'ShowTitle',
				XBMCName: 'c00',
				allowBlank: false
			},{
				fieldLabel: 'Genre',
				name: 'ShowGenre',
				XBMCName: 'c08',
				readOnly: true,
				id: 'showgenres'
			},{
				fieldLabel: 'First aired',
				XBMCName: 'c05',
				name: 'showAired'
			},{
				fieldLabel: 'Channel',
				XBMCName: 'c14',
				name: 'showChannel'
			}]

		},{ 
			columnWidth:0.50,
			defaults:{xtype:'container', width: 260},
			items: [{
				xtype:'textarea',
				fieldLabel: 'Description',
				name: 'ShowDescr',
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
			name: 'EpisodeTitle',
			XBMCName: 'c00',
			allowBlank: false
		},{
			fieldLabel: 'Aired',
			name: 'EpisodeAired',
			XBMCName: 'c05'
		},{
			xtype:'textarea',
			fieldLabel: 'Description',
			name: 'EpisodeDescr',
			XBMCName: 'c01',
			height: 145
		},{
			fieldLabel: 'Director',
			name: 'EpisodeDirector',
			XBMCName: 'c10'
		},{
			fieldLabel: 'Rating',
			name: 'EpisodeRating',
			XBMCName: 'c03'
		}]
	},{
		width:170,
		items: [EpisodeStars, SeasonCover]
	},{
		items: [VideoFlagsPanel]
	},{
		items: [AudioFlagsPanel]
	}]
})

// grid with list of movies
tvShowGrid = new Ext.grid.GridPanel({
	cm: tvShowcolModel,
	id: 'tvshowgrid',
	title: 'TV Shows List',
	enableDragDrop: false,
	stripeRows: true,
	viewconfig: {forceFit: true},
	sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
	region: 'west',
	//height: 180,
	width: 200,
	split: true,
	store: new TVShow.Store({
	storeId: 'gridtvshowstore',
	url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select tvshow.idShow, tvshow.c00, tvshow.c08, counts.totalcount, counts.watchedcount, counts.totalcount=counts.watchedcount from tvshow join tvshowlinkpath on tvshow.idShow=tvshowlinkpath.idShow join path on path.idpath=tvshowlinkpath.idPath left outer join (    select tvshow.idShow as idShow,count(1) as totalcount,count(files.playCount) as watchedcount from tvshow     join tvshowlinkepisode on tvshow.idShow = tvshowlinkepisode.idShow JOIN episode on episode.idEpisode = tvshowlinkepisode.idEpisode     join files on files.idFile = episode.idFile     group by tvshow.idShow) counts on tvshow.idShow = counts.idShow)'
	})
});

EpisodeGrid = new Ext.grid.GridPanel({
	cm: episodecolModel,
	id: 'episodegrid',
	loadMask: true,
	title: 'Episodes List',
	enableDragDrop: false,
	viewconfig: {forceFit: true},
	view: new Ext.grid.GroupingView({
		forceFit:true,
		startCollapsed: true,
		//enableGrouping: false,
		enableGroupingMenu : false,
		//enableNoGroups: false,
		groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'}),
	sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
	region: 'center',
	listeners:{
        rowcontextmenu:{stopEvent:true, fn:function(grid, rowIndex, e) {
            gridContextMenu.showAt(e.getXY());    
            e.stopEvent();
            return false;
        }}
	},
	split: true,
	store: new TVShow.EpiStore({
		storeId: 'gridepisodestore',
		listeners:{
			load: function() {
				if (currentRecord.data.details == undefined){
					GetTvshowGenres(currentRecord);
					GettvShowDetails(currentRecord);
				}
				else {
					updateTvShowForms(currentRecord);
					updateGenreGrid(currentRecord.data.selectedGenre);
					Ext.getCmp('filedetailPanel').getForm().loadRecord(currentRecord);
				}
				storeActor.proxy.conn.url = "/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT strActor, strRole FROM actorlinktvshow JOIN actors ON (actorlinktvshow.idActor = actors.idActor) where idShow ="+currentRecord.data.idShow+")";
				storeActor.load();
			}
		},
		url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT idEpisode, c00, c12, c13, playCount FROM episodeview WHERE idShow=-1)' 
	})
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
			layout: 'border',
			split: true,
			items: [
				tvShowGrid,
				EpisodeGrid
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
		var currentShow = Ext.getCmp('tvshowgrid').getSelectionModel();
		currentShow.on('rowselect', this.tvShowSelect, this);
		
		var currentEpisode = Ext.getCmp('episodegrid').getSelectionModel();
		currentEpisode.on('rowselect', this.episodeSelect, this);
	},

	tvShowSelect: function(sm, rowIdx, r) {

		TVShowdetailPanel.setTitle("<div align='center'>"+r.data.ShowTitle+" ( "+r.data.totalCount+" Episodes / "+r.data.watchedCount+" watched )</div>");
		selectedMovie = r.data.idShow;
		currentRecord = r;

		//Ext.StoreMgr.get('gridepisodestore').proxy.conn.url = "/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT episode.idEpisode, episode.c00, episode.c12, episode.c13, episode.playCount FROM episode JOIN tvshowlinkepisode ON (episode.idEpisode = tvshowlinkepisode.idEpisode) where tvshowlinkepisode.idShow="+r.data.idShow+")";
		Ext.StoreMgr.get('gridepisodestore').proxy.conn.url= "/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idEpisode, c00, c12, c13, playCount FROM episodeview WHERE idShow="+r.data.idShow+")"; 
		Ext.StoreMgr.get('gridepisodestore').load();
		
		//EpisodedetailPanel.getForm().reset();
		EpisodedetailPanel.setTitle("<div align='center'>Select Episode</div>");
			
	},
	
	episodeSelect: function(sm, rowIdx, r) {		
		r.data.EpisodeShowPath = currentShowPath;
		currentEpisode = r;
		EpisodedetailPanel.setTitle("<div align='center'> Season "+r.data.EpisodeSeason+" / Episode "+r.data.EpisodeNumber+"</div>");
		if (r.data.details == undefined){
			GetepisodeDetails(r);
		}
		else {updateEpisodeForms(r)};
	}

	
});
Ext.reg('Mainpanel', TVShow.Mainpanel);
