// -----------------------------------------
// movie.js
// last modified : 04-08-2010
// 
//------------------------------------------ 

var MovieRecord = Ext.data.Record.create([
   {name: 'title'},	{name: 'genre'},{name: 'year'}, {name: 'rating'},	
   {name: 'director'}, {name: 'trailer'}, {name: 'tagline'}, {name: 'plot'}, {name: 'studio'},
   {name: 'plotoutline'}, {name: 'originaltitle'}, {name: 'playcount', type: 'int'}, {name: 'writer'},
   {name: 'set'}, {name: 'plot'}, {name: 'plotoutline'}, {name: 'tagline'}, {name: 'mpaa'}, {name: 'thumbnail'}, {name: 'file'}, {name: 'fanart'},
   {name: 'streamDetails'}, {name: 'movieid'}, {name: 'file'}, {name: 'runtime'}
]);

var storeMovie = new Ext.ux.XbmcStore({
	sortInfo: {field: 'title', direction: "ASC"},
	reader: new Ext.data.JsonReader({
		root:'movies'	       
       }, MovieRecord),
	xbmcParams: '{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovies", "params": {"fields": ["title", "genre", "year", "rating", "director", "trailer", "tagline", "plot", "plotoutline", "originaltitle", "playcount", "writer", "studio", "mpaa", "country", "imdbnumber", "premiered", "productioncode", "runtime", "set", "streamDetails", "top250", "votes", "fanart", "thumbnail", "file" ]}, "id": 1}'
});

storeMovie.loadXbmc();

// grid with list of movies
Moviegrid = new Ext.grid.GridPanel({
	cm: MoviecolModel,
	id: 'Moviegrid',
	enableDragDrop: false,
	stripeRows: true,
	viewconfig: {forceFit: true},
	selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
	height: 480,
	split: true,
	listeners:{
        rowcontextmenu:{stopEvent:true, fn:function(grid, rowIndex, e) {
            gridContextMenu.showAt(e.getXY());    
            e.stopEvent();
            return false;
        }}	
	},
	store: storeMovie
}); 
