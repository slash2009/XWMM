// -----------------------------------------
// movierecent.js
// last modified : 30-11-2011
//
//------------------------------------------

var MovieRecord = Ext.data.Record.create([
   {name: 'idMovie', mapping: 'movieid'},       //idMovie
   {name: 'strFilename', mapping: 'file'},  //strFilename
   //{name: 'strGenre', mapping: 'field:nth(3)'},       //strGenre
   {name: 'Movietitle', mapping: 'title'},  //c00
   //{name: 'strPath', mapping: 'field:nth(5)'},        //strPath
   {name: 'Moviegenres', mapping: 'genre', convert: genreConvert},  //c14
   //{name: 'idFile', mapping: 'field:nth(7)'},
   {name: 'watched', mapping: 'playcount'},
   {name: 'MovieRelease', mapping: 'year'},
   {name: 'streamdetails'}, // required for htmlexport
   //{name: 'idSet', mapping: 'field:nth(10)'},
   {name: 'strSet', mapping: 'set'}
]);

function genreConvert(v, record) {
    return record.genre.join(' / ');
}

var storeMovie = new Ext.data.GroupingStore({
    sortInfo: {field: 'Movietitle', direction: 'ASC'},
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams : {'jsonrpc': '2.0', 'method': 'VideoLibrary.GetRecentlyAddedMovies', 'params': {'properties': ['title', 'genre', 'year', 'playcount', 'file', 'set', 'streamdetails']},'id': 1}
    }),
    reader: new Ext.data.JsonReader({
        root:'result.movies'
        }, MovieRecord)
});

// grid with list of movies
Moviegrid = new Ext.grid.GridPanel({
    cm: MoviecolModel,
    id: 'Moviegrid',
    enableHdMenu: false,
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

