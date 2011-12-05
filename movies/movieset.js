

//------------ Movie Sets ----------------

var MovieSetcolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'idSet', hidden: true},
		{header: "Set Name", dataIndex: 'strSet', width: 200}
    ]);

var MovieSetRecord = Ext.data.Record.create([
   {name: 'idSet', mapping: 'field:nth(1)'},		
   {name: 'strSet', mapping: 'field:nth(2)'}	
]);

var MovieSetStore = new Ext.data.GroupingStore({
	sortInfo: {field: 'strSet', direction: "ASC"},
	id: 'moviesetstore',
	reader: new Ext.data.JsonXBMCReader({
		root:'data'	       
       }, MovieSetRecord),
	url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idSet, strSet FROM sets)' 
});

//------- Movies in a Set

var MoviesInSetcolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'idMovie', hidden: true},
		{header: "Movie Title", dataIndex: 'c00', width: 200}
    ]);

var MoviesInSetRecord = Ext.data.Record.create([
   {name: 'idMovie', mapping: 'field:nth(1)'},		
   {name: 'c00', mapping: 'field:nth(2)'}	
]);

var MoviesInSetStore = new Ext.data.GroupingStore({
	sortInfo: {field: 'c00', direction: "ASC"},
	id: 'moviesinsetstore',
	autoLoad: false,
	reader: new Ext.data.JsonXBMCReader({
		root:'data'	       
       }, MoviesInSetRecord),
 
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
		{header: "#", dataIndex: 'idSet', hidden: true},
		{header: "Set Name", width: 200, editor: new Ext.form.TextField({allowBlank: false}),dataIndex: 'strSet'}
	],
	clicksToEdit: 1,
	title: 'Sets',
	enableDragDrop: false,
	stripeRows: true,
	selModel: new Ext.grid.RowSelectionModel({
		singleSelect: true,
		listeners : {
			rowselect: function(sm, row, rec) {
				MoviesInSetStore.proxy.conn.url = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select movie.idMovie, c00 FROM setlinkmovie JOIN movie ON setlinkmovie.idMovie = movie.idMovie WHERE idSet = '+rec.data.idSet+')';
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