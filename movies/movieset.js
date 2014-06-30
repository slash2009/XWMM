//------------ Movie All Sets (including orphans) ----------------

var MovieSetRecord = Ext.data.Record.create([
   {name: 'idSet', mapping: 'setid', type: 'int'},
   {name: 'strSet', mapping: 'title'}
]);

var MovieSetStore = new Ext.data.GroupingStore({
    sortInfo: {field: 'strSet', direction: 'ASC'},
    //autoLoad: true,
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {'jsonrpc': '2.0', 'method': 'VideoLibrary.GetMovieSets', 'params': {'properties': ['title']},'id': 1}
    }),
    reader: new Ext.data.JsonReader({
        root: 'result.sets'
    }, MovieSetRecord)
});

var MoviesInSetcolModel = new Ext.grid.ColumnModel([
        {header: '#', dataIndex: 'idMovie', hidden: true},
        {header: 'Movie Title', dataIndex: 'movieinset', width: 200}
    ]);


var MoviesInSetRecord = Ext.data.Record.create([
   {name: 'idMovie', mapping: 'movieid'},
   {name: 'movieinset', mapping: 'title'}
]);


var MoviesInSetStore = new Ext.data.GroupingStore({
    sortInfo: {field: 'movieinset', direction: 'ASC'},
    id: 'moviesinsetstore',
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {'jsonrpc': '2.0', 'method': 'VideoLibrary.GetMovieSetDetails', 'params': {'setid': 2147483647, 'movies': {'properties': ['title']} }, 'id': 1} //dummy ID will be replaced by selected setid when set selected
    }),
    reader: new Ext.data.JsonReader({
        root:'result.setdetails.movies'
       }, MoviesInSetRecord)
});


var MovieInSetGrid = new Ext.grid.GridPanel({
    width:230,
    height: 290,
    cm: MoviesInSetcolModel,
    title: 'Movies in Set',
    enableDragDrop: false,
    disableSelection : true,
    store: MoviesInSetStore,
    viewConfig: {forceFit: true}
});

// ----- Movie Set Management Window

function onAddMovieSet(btn, ev) {
        var u = new MovieSetMgmtGrid.store.recordType({
                strSet: 'New Set',
        idSet: '-1' // flag as new record
        });
        editor.stopEditing();
        MovieSetStore.insert(0, u);
        editor.startEditing(0);
}

function onDeleteMovieSet() {
    var rec = MovieSetMgmtGrid.getSelectionModel().getSelected();
    if (!rec) {return false;}


    MovieSetStore.remove(rec);
    MoviesInSetStore.each( function (movieRecord)
        {
            xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.SetMovieDetails", "params": {"movieid": '+ movieRecord.data.idMovie +', "set": ""}, "id": 1}');
        }, this);
    MovieSetStore.reload();
}

var MovieSetEditor = new Ext.ux.grid.RowEditor({
    saveText: 'Update',
    listeners: {
        afteredit: function(roweditor, changes, record, rowIndex) {
            if (record.data.idSet === -1) {
                //should add a bubble to tell user to add movies in the set
            }
            else {
                MoviesInSetStore.each( function (movieRecord)
                    {
                        xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.SetMovieDetails", "params": {"movieid": '+ movieRecord.data.idMovie +', "set": "'+ changes.strSet +'"}, "id": 1}');
                    }, this);
                MovieSetStore.reload();
            }
        }
    }
});

var MovieSetMgmtGrid = new Ext.grid.GridPanel({
    id: 'moviesetmgmtgrid',
    width: 250,
    height: 290,
    columns: [
        {header: '#', dataIndex: 'idSet', hidden: true},
        {header: 'Set Name', width: 200, editor: new Ext.form.TextField({allowBlank: false}),dataIndex: 'strSet'}
    ],
    clicksToEdit: 1,
    title: 'Sets',
    enableDragDrop: false,
    stripeRows: true,
    selModel: new Ext.grid.RowSelectionModel({
        singleSelect: true,
        listeners : {
        rowselect: function(sm, row, rec) {
                MoviesInSetStore.proxy.conn.xbmcParams = {'jsonrpc': '2.0', 'method': 'VideoLibrary.GetMovieSetDetails', 'params': {'setid': rec.data.idSet, 'movies': {'properties': ['title']} }, 'id': 1};
                MoviesInSetStore.load();
            }
        }
    }),
    plugins: [MovieSetEditor],
    store: MovieSetStore,
    tbar: [{
        text: 'Add',
        //disabled: 'true', //disabled as no method of adding new sets via JSON currently
        iconCls: 'silk-add',
        handler: onAddMovieSet
    }, '-', {
        text: 'Delete',
        //disabled: 'true', //disabled as no method of deleting sets via JSON currently
        iconCls: 'silk-delete',
        handler: onDeleteMovieSet
    }, '-'],
    viewConfig: {forceFit: true}
});

var winMovieSet = new Ext.Window({
    layout:'table',
    layoutConfig: {columns:2},
    title: 'Movie Set Management',
    width:500,
    height:300,
    closeAction:'hide',
    plain: true,
    items: [
        MovieSetMgmtGrid, MovieInSetGrid
    ],
    buttons: [{
        text: 'Close',
        handler: function(){
            winMovieSet.hide();
        }
    }]
});
