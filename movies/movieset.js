

//------------ Movie Sets ----------------

var MovieSetcolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'setid', hidden: true},
		{header: "Set Name", dataIndex: 'set', width: 200}
    ]);

var MovieSetRecord = Ext.data.Record.create([
   {name: 'set', mapping: 'label'},		
   {name: 'setid'}	
]);

var MovieSetStore = new Ext.data.Store({
	sortInfo: {field: 'set', direction: "ASC"},
	id: 'moviesetstore',
	proxy: new Ext.data.XBMCProxy({
		url: "/jsonrpc",
		xbmcParams : {"jsonrpc": "2.0", "method": "VideoLibrary.GetMovieSets", "params": {}, "id": 1}
	}),
	reader: new Ext.data.JsonReader({
		root:'result.sets'	       
		}, MovieSetRecord)
});


//------- Movies in a Set

var MoviesInSetcolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'movieid', hidden: true},
		{header: "Movie Title", dataIndex: 'movieinset', width: 200}
    ]);

var MoviesInSetRecord = Ext.data.Record.create([
   {name: 'idmovie'},		
   {name: 'movieinset', mapping: 'label'}	
]);

var MoviesInSetStore = new Ext.data.Store({
	//sortInfo: {field: 'set', direction: "ASC"},
	id: 'moviesinsetstore',
	proxy: new Ext.data.XBMCProxy({
		url: "/jsonrpc"
	}),
	reader: new Ext.data.JsonReader({
		root:'result.setdetails.items.movies'	       
		}, MoviesInSetRecord)
});


var MovieInSetGrid = new Ext.grid.GridPanel({
	width:250,
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
        editor.startEditing(0)
}

function onDeleteMovieSet() {
    var rec = MovieSetMgmtGrid.getSelectionModel().getSelected();
    if (!rec) {return false;}

	removeXBMCMovieSet(rec);
	MovieSetStore.remove(rec)
}

var MovieSetEditor = new Ext.ux.grid.RowEditor({
	saveText: 'Update',
	listeners: {
		afteredit: function(roweditor, changes, record, rowIndex) {
			if (record.data.idSet == -1) {
				AddXBMCNewMovieSet(record);
				MovieSetStore.reload()
			}
			else {
				updateXBMCMovieSetString(record);
				MovieSetStore.reload()
			}							
 		}
	}
});

var MovieSetMgmtGrid = new Ext.grid.GridPanel({
	id: 'moviesetmgmtgrid',
	width: 250,
	height: 290,
	columns: [
		{header: "#", dataIndex: 'setid', hidden: true},
		{header: "Set Name", width: 200, editor: new Ext.form.TextField({allowBlank: false}),dataIndex: 'set'}
	],
	clicksToEdit: 1,
	title: 'Sets',
	enableDragDrop: false,
	stripeRows: true,
	selModel: new Ext.grid.RowSelectionModel({
		singleSelect: true,
		listeners : {
			rowselect: function(sm, row, rec) {
				MoviesInSetStore.proxy.conn.xbmcParams = {"jsonrpc": "2.0", "method": "VideoLibrary.GetMovieSetDetails", "params": {"setid": rec.data.setid, "properties": ["title", "thumbnail"]}, "id": 1};
				MoviesInSetStore.load();
			}
		}
	}),
	plugins: [MovieSetEditor],
	store: MovieSetStore,
	tbar: [{
		text: 'Add',
		iconCls: 'silk-add',
		handler: onAddMovieSet
	}, '-', {
		text: 'Delete',
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
			winMovieSet.hide()
        }
    }]
});