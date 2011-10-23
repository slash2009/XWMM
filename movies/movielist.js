// -----------------------------------------
// movie.js
// last modified : 04-08-2010
// 
//------------------------------------------ 

var MovieRecord = Ext.data.Record.create([
   {name: 'idMovie', mapping: 'movieid'},		//idMovie
   {name: 'strFilename', mapping: 'file'},	//strFilename
   //{name: 'strGenre', mapping: 'field:nth(3)'},		//strGenre
   {name: 'Movietitle', mapping: 'title'},	//c00
   //{name: 'strPath', mapping: 'field:nth(5)'},		//strPath
   {name: 'Moviegenres', mapping: 'genre'},	//c14
   //{name: 'idFile', mapping: 'field:nth(7)'},
   {name: 'watched', mapping: 'playcount'},
   {name: 'MovieRelease', mapping: 'year'},
   {name: 'streamdetails'}, // required for htmlexport
   //{name: 'idSet', mapping: 'field:nth(10)'},
   {name: 'strSet', mapping: 'set'}
]);

var storeMovie = new Ext.ux.XbmcGroupingStore({
	sortInfo: {field: 'Movietitle', direction: "ASC"},
	xbmcParams: '{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovies", "params": {"properties": ["title", "genre", "year", "playcount", "file", "set", "streamdetails"]},"id": 1}',
	reader: new Ext.data.JsonReader({
		root:'movies'	       
		}, MovieRecord)
});

storeMovie.loadXbmc();


// grid with list of movies
Moviegrid = new Ext.grid.GridPanel({
	cm: MoviecolModel,
	id: 'Moviegrid',
	enableDragDrop: false,
	stripeRows: true,
	loadMask: true,
	viewconfig: {forceFit: true},
	selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
	region: 'west',
	width: 285,
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
