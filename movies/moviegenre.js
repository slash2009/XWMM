
Ext.ns('Movie');

var MovieRecord = Ext.data.Record.create([
   {name: 'idMovie', mapping: 'field:nth(1)'},		//idMovie
   {name: 'strFilename', mapping: 'field:nth(2)'},	//strFilename
   {name: 'strGenre', mapping: 'field:nth(3)'},		//strGenre
   {name: 'Movietitle', mapping: 'field:nth(4)'},	//c00
   {name: 'strPath', mapping: 'field:nth(5)'},		//strPath
   {name: 'Moviegenres', mapping: 'field:nth(6)'},	//c14
   {name: 'idFile', mapping: 'field:nth(7)'},
   {name: 'watched', mapping: 'field:nth(8)'},
   {name: 'idSet', mapping: 'field:nth(9)'},
   {name: 'strSet', mapping: 'field:nth(10)'},
   {name: 'MovieRelease', mapping: 'field:nth(11)'}
]);

var storeMovie = new Ext.data.GroupingStore({
	sortInfo: {field: 'Movietitle', direction: "ASC"},
	groupField: 'strGenre',
	reader: new Ext.data.JsonXBMCReader({
          // records will have a "record" tag
		root:'data'	       
       }, MovieRecord),
	url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select movie.idMovie, strFilename, strGenre, c00, strPath, c14, movie.idFile, playCount, sets.idSet, strSet, c07 FROM movie JOIN files ON (movie.idFile = files.idFile) Join path ON (files.idPath = path.idPath) LEFT OUTER Join genrelinkmovie ON (genrelinkmovie.idMovie = movie.idMovie) LEFT OUTER JOIN genre ON (genrelinkmovie.idGenre = genre.idGenre) LEFT OUTER JOIN setlinkmovie ON movie.idMovie = setlinkmovie.idMovie LEFT OUTER JOIN sets ON setlinkmovie.idSet = sets.idSet)' 
});

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
