
// -----------------------------------------
// Actors include.js
//------------------------------------------ 

// ------------ Actor in Movies information -------------

var ActorMoviecolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'idMovie', hidden: true},
		{header: "Movie Title", dataIndex: 'c00', width: 200},
		{header: "Role", dataIndex: 'strRole', width: 200}
    ]);

var ActorMovieRecord = Ext.data.Record.create([
   {name: 'idMovie', mapping: 'field:nth(1)'},
   {name: 'c00', mapping: 'field:nth(2)'},
   {name: 'strRole', mapping: 'field:nth(3)'},
   {name: 'idActor', mapping: 'field:nth(4)'}
]);

var ActorMovieStore = new Ext.data.Store({
	storeId: 'actormoviestore',
	sortInfo: {field: 'idMovie', direction: "ASC"},
	reader: new Ext.data.JsonXBMCReader({
		root:'data'	       
       }, ActorMovieRecord),
	autoLoad: false,
	url: '/' 
});

ActorMovieGrid = new Ext.grid.GridPanel({
	cm: ActorMoviecolModel,
	id: 'actormovieGrid',
	title: 'Role in Movies',
	enableDragDrop: false,
	stripeRows: true,
	viewconfig: {forceFit: true},
	selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
	split: true,
	height: 310,
	tbar: [{
		text: 'Add',
		iconCls: 'silk-add',
		handler: onAddActorMovie
	}, '-', {
		text: 'Delete',
		iconCls: 'silk-delete',
		handler: onDeleteActorMovie
	}, '-'],
	store: ActorMovieStore
}); 

// ------------ Actor in TV Show information -------------

var ActorTvshowcolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'idShow', hidden: true},
		{header: "TV Show Title", dataIndex: 'c00', width: 200},
		{header: "Role", dataIndex: 'strRole', width: 200}
    ]);

var ActorTvshowRecord = Ext.data.Record.create([
   {name: 'idShow', mapping: 'field:nth(1)'},
   {name: 'c00', mapping: 'field:nth(2)'},
   {name: 'strRole', mapping: 'field:nth(3)'},
   {name: 'idActor', mapping: 'field:nth(4)'}
]);

var ActorTvshowStore = new Ext.data.Store({
	storeId: 'actortvshowstore',
	sortInfo: {field: 'idShow', direction: "ASC"},
	reader: new Ext.data.JsonXBMCReader({
		root:'data'	       
       }, ActorTvshowRecord),
	autoLoad: false,
	url: '/' 
});

ActorTvshowGrid = new Ext.grid.GridPanel({
	cm: ActorTvshowcolModel,
	id: 'actortvshowGrid',
	title: 'Role in TV Shows',
	enableDragDrop: false,
	stripeRows: true,
	viewconfig: {forceFit: true},
	selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
	split: true,
	height: 310,
	tbar: [{
		text: 'Add',
		iconCls: 'silk-add',
		handler: onAddActorTVShow
	}, '-', {
		text: 'Delete',
		iconCls: 'silk-delete',
		handler: onDeleteActorTVShow
	}, '-'],
	store: ActorTvshowStore
});

// ------------ Actor in Episodes information -------------

var ActorEpisodecolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'idEpisode', hidden: true},
		{header: "TV Show", dataIndex: 'TVShow', width: 150},
		{header: "Episode Title", dataIndex: 'c00', width: 200},
		{header: "Role", dataIndex: 'strRole', width: 120}
    ]);

var ActorEpisodeRecord = Ext.data.Record.create([
   {name: 'idEpisode', mapping: 'field:nth(1)'},
   {name: 'c00', mapping: 'field:nth(2)'},
   {name: 'strRole', mapping: 'field:nth(3)'},
   {name: 'idActor', mapping: 'field:nth(4)'},
   {name: 'TVShow', mapping: 'field:nth(5)'}
]);

var ActorEpisodeStore = new Ext.data.Store({
	storeId: 'actorepisodestore',
	sortInfo: {field: 'c00', direction: "ASC"},
	reader: new Ext.data.JsonXBMCReader({
		root:'data'	       
       }, ActorEpisodeRecord),
	autoLoad: false,
	url: '/' 
});

ActorEpisodeGrid = new Ext.grid.GridPanel({
	cm: ActorEpisodecolModel,
	id: 'actorepisodeGrid',
	title: 'Role in Episodes',
	enableDragDrop: false,
	stripeRows: true,
	viewconfig: {forceFit: true},
	selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
	region: 'center',
	split: true,
	height: 310,
	tbar: [{
		text: 'Add',
		iconCls: 'silk-add',
		handler: onAddActorEpisode
	}, '-', {
		text: 'Delete',
		iconCls: 'silk-delete',
		handler: onDeleteActorEpisode
	}, '-'],
	store: ActorEpisodeStore
});


// ------------ Actor information -------------

var ActorPicture = new Ext.Container ({
	id: 'actorpicture',
	border: 0,
	// width: 96,
	height:300,
	autoEl: {tag: 'img', src: "../images/DefaultArtist.png"},
	updateSrc :function(r){
		if (r.data.strThumb == "")	{
			this.el.dom.src = "../images/DefaultArtist.png"
		}
		else {
			var thumb =  r.data.strThumb.replace(/<\/thumb>/g, "");
			thumb = thumb.replace(/<thumb>/g, "");
			var thumbCrc = FindCRC("actor"+r.data.strActor);
			//console.log(r.data.strActor,' - ',thumbCrc);
			this.el.dom.src = "../../vfs/special://masterprofile/Thumbnails/Video/"+thumbCrc.substring(0,1)+"/"+thumbCrc+".tbn";
		}
	}
});

var ActorcolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'idActor', hidden: true},
		{header: "Actor", dataIndex: 'strActor', width: 200}
    ]);

var ActorRecord = Ext.data.Record.create([
   {name: 'idActor', mapping: 'field:nth(1)'},
   {name: 'strActor', mapping: 'field:nth(2)'},
   {name: 'strThumb', mapping: 'field:nth(3)'}
]);

var ActorStore = new Ext.data.Store({
	sortInfo: {field: 'strActor', direction: "ASC"},
	reader: new Ext.data.JsonXBMCReader({
		root:'data'	       
       }, ActorRecord),
	listeners: {
        beforeload: function(){ setXBMCResponseFormat() }
    },
	url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idActor, strActor, strThumb FROM actors)' 
});

ActorGrid = new Ext.grid.GridPanel({
	cm: ActorcolModel,
	id: 'actorGrid',
	title: 'Manage Actors',
	enableDragDrop: false,
	stripeRows: true,
	viewconfig: {forceFit: true},
	selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
	region: 'center',
	height: 620,
	loadMask:true,
	//split: true,
	tbar: [{
		text: 'Add',
		iconCls: 'silk-add',
		handler: onAddActor
	}, '-', {
		text: 'Delete',
		iconCls: 'silk-delete',
		handler: onDeleteActor
	}, '-'],
	store: ActorStore
}); 

// ----------------- General functions --------------------------

function onAddActor(btn, ev) {
	Ext.Msg.alert('This feature is not implemented');
}


function onDeleteActor() {
    var rec = ActorGrid.getSelectionModel().getSelected();
    if (( ActorMovieStore.getCount() !=0  || ActorTvshowStore.getCount() != 0) || ActorEpisodeStore.getCount() !=0 ) {
		Ext.Msg.alert('Error', 'this Actor is still in use');
	}
	else {
	ActorGrid.store.remove(rec);
	removeXbmcActor(rec)
	}
}

function onAddActorEpisode(btn, ev) {
	Ext.Msg.alert('This feature is not implemented');
}

function onDeleteActorEpisode() {
    var rec = ActorEpisodeGrid.getSelectionModel().getSelected();
	
	ActorEpisodeGrid.store.remove(rec);
	removeXbmcActorEpisode(rec)
}

function onAddActorTVShow(btn, ev) {
	Ext.Msg.alert('This feature is not implemented');
}

function onDeleteActorTVShow() {
    var rec = ActorTvshowGrid.getSelectionModel().getSelected();
	
	ActorTvshowGrid.store.remove(rec);
	removeXbmcActorTVShow(rec)
}

function onAddActorMovie(btn, ev) {
	Ext.Msg.alert('This feature is not implemented');
}

function onDeleteActorMovie() {
    var rec = ActorMovieGrid.getSelectionModel().getSelected();
	
	ActorMovieGrid.store.remove(rec);
	removeXbmcActorMovie(rec)
}