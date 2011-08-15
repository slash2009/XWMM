

// -----------------------------------------
// movie.js
// last modified : 03-03-2010
// 
//------------------------------------------ 

var MovieRecord = Ext.data.Record.create([
   {name: 'idMovie', type: 'int', mapping: 'field:nth(1)'},		//idMovie
   {name: 'strFilename', mapping: 'field:nth(2)'},	//strFilename
   {name: 'strGenre', mapping: 'field:nth(3)'},		//strGenre
   {name: 'Movietitle', mapping: 'field:nth(4)'},	//c00
   {name: 'strPath', mapping: 'field:nth(5)'},		//strPath
   {name: 'Moviegenres', mapping: 'field:nth(6)'},	//c14
   {name: 'idFile', mapping: 'field:nth(7)'},
   {name: 'watched', mapping: 'field:nth(8)'},
   {name: 'idSet', mapping: 'field:nth(10)'},
   {name: 'strSet', mapping: 'field:nth(11)'}
]);

var storeMovie = new Ext.data.GroupingStore({
	sortInfo: {field: 'idMovie', direction: "DESC"},
	reader: new Ext.data.JsonXBMCReader({
          // records will have a "record" tag
		root:'data'	       
       }, MovieRecord),
	listeners: {
        beforeload: function(){ setXBMCResponseFormat() }
    },
	url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select movieview.idMovie, strFilename, c10, c00, strPath, c14, idFile, playCount, sets.idSet, strSet FROM movieview LEFT OUTER JOIN setlinkmovie ON movieview.idMovie = setlinkmovie.idMovie LEFT OUTER JOIN sets ON setlinkmovie.idSet = sets.idSet)' 
});


// grid with list of movies
Moviegrid = new Ext.grid.GridPanel({
	cm: MoviecolModel,
	id: 'Moviegrid',
	enableDragDrop: false,
	stripeRows: true,
	viewconfig: {forceFit: true},
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

