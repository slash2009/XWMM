
Ext.ns('Movie');

var MovieRecord = Ext.data.Record.create([
   {name: 'idMovie'},
   {name: 'strFilename'},
   {name: 'strGenre'},
   {name: 'Movietitle'},
   //{name: 'strPath', mapping: 'field:nth(5)'},		//strPath
   {name: 'Moviegenres'},
   //{name: 'idFile', mapping: 'field:nth(7)'},
   {name: 'watched'},
   //{name: 'idSet', mapping: 'field:nth(9)'},
   {name: 'strSet'},
   {name: 'MovieRelease'}
]);

var tempMovieRecord = Ext.data.Record.create([
   {name: 'idMovie', mapping: 'movieid'},
   {name: 'strFilename', mapping: 'file'},
   {name: 'Movietitle', mapping: 'title'},
   {name: 'Moviegenres', mapping: 'genre', convert: genreConvert},
   {name: 'watched', mapping: 'playcount'},
   {name: 'strSet', mapping: 'set'},
   {name: 'MovieRelease', mapping: 'year'}
]);

function genreConvert(v, record) {
	return record.genre.join(' / ')
}

var storeMovie = new Ext.data.GroupingStore( {
	sortInfo: {field: 'Movietitle', direction: "ASC"},
	groupField: 'strGenre',
	proxy: new Ext.data.XBMCProxy({
		url: "/jsonrpc",
	}),
});

var tempMovieStore = new Ext.data.Store( {
	sortInfo: {field: 'Movietitle', direction: "ASC"},
	autoLoad: true,
	listeners: {
		'load': function(records) {
				var genres = [];
				for (var i = 0; i < records.data.length; i++) {
					genres = records.data.items[i].data.Moviegenres.split(" / ");
					for (var j = 0; j < genres.length; j++) {
						var record = new MovieRecord({
							idMovie: records.data.items[i].data.idMovie,
							strFilename: records.data.items[i].data.strFilename,
							strGenre: genres[j],
							Movietitle: records.data.items[i].data.Movietitle,
							Moviegenres: records.data.items[i].data.Moviegenres,
							watched: records.data.items[i].data.watched,
							strSet: records.data.items[i].data.strSet,
							MovieRelease: records.data.items[i].data.MovieRelease
		  				});
						storeMovie.add(record);
					}
				}
				storeMovie.commitChanges();
			}
   },
	proxy: new Ext.data.XBMCProxy({
		url: "/jsonrpc",
		xbmcParams :{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovies", "params": {"properties": ["title", "genre", "year", "playcount", "file", "set"]},"id": 1}
	}),
	reader: new Ext.data.JsonReader({
		root: 'result.movies'
	}, tempMovieRecord)
});

//storeMovie.load();

// grid with list of movies
Moviegrid = new Ext.grid.GridPanel({
	cm: MoviecolModel,
	id: 'Moviegrid',
	enableDragDrop: false,
	stripeRows: true,
	loadMask: true,
	viewconfig: {forceFit: true},
	view: new Ext.grid.GroupingView({
		forceFit:true,
		startCollapsed: true,
		// enableGrouping: false,
		enableGroupingMenu : false,
		//enableNoGroups: false,
		groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'}),
	sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
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
