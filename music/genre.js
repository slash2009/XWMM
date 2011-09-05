
var musicGenreRecord = Ext.data.Record.create([	
   {name: 'genreid'},
   {name: 'label'},
]);

var Checkgenre = new Ext.grid.CheckboxSelectionModel({
	dataIndex:'idGenre',
	alwaysSelectOnCheck: 'true',
	header: false,
	listeners: {
		selectionchange: function(sm) {
			movieGenreChange(sm);
			var bt = Ext.getCmp('savebutton');
			bt.enable();
		}
	}
});

var GenrecolModel = new Ext.grid.ColumnModel([
		Checkgenre,
		{header: "#", dataIndex: 'genreid', hidden: true},
		{header: "Genre", dataIndex: 'label'}
]);

function movieGenreChange(sm){
	var sel = sm.getSelections();
	var strTemp = "";
	for (var i = 0; i < sel.length; i++) {
		if (strTemp == ""){strTemp = sel[i].data.label}
			else{ strTemp = strTemp+' / '+sel[i].data.label}
	}
	currentRecord.data.genre = strTemp;

	Ext.getCmp('genreString').setValue(strTemp)
}

var GenreStore = new Ext.ux.XbmcStore({
	id: 'storegenre',
	sortInfo: {field: 'label', direction: "ASC"},
	xbmcParams: '{"jsonrpc": "2.0", "method": "AudioLibrary.GetGenres", "params": {},"id": 1}',
	reader: new Ext.data.JsonReader({
		root:'genres'	       
	}, musicGenreRecord),
		selectFromString :function(string){ // select genre rows according to movie genre field 
		var myArray = string.split('/');
		Genregrid.getSelectionModel().clearSelections(false);
		for (var i = 0; i < myArray.length; i++) {
			var index = GenreStore.findExact('label',removeSpace(myArray[i]),0,false,false);
			Genregrid.getSelectionModel().selectRow(index, true);
		}
	}

});
//GenreStore.loadXbmc();

var editor = new Ext.ux.grid.RowEditor({
	saveText: 'Update',
	listeners: {
		afteredit: function(roweditor, changes, record, rowIndex) {
			if (record.data.idGenre == -1) {
				AddXBMCNewMusicGenre(record);
				GenreStore.reload();
			}
			else {
				updateXBMCMusicGenreString(record);
				GenreStore.reload();
			}
								
 		 }
	}
});


//grid for Genres mgmt
var GenreMgmtGrid = new Ext.grid.GridPanel({
			id: 'genremgmtgrid',
			columns: [
				{header: "#", dataIndex: 'idGenre', hidden: true},
				{header: "Genre", width: 200, editor: new Ext.form.TextField({allowBlank: false}),dataIndex: 'strGenre'}
			],
			clicksToEdit: 1,
			title: 'Genre Management',
			enableDragDrop: false,
			//sm : Checkgenre,
			stripeRows: true,
			plugins: [editor],
			store: GenreStore,
			tbar: [{
				text: 'Add',
				iconCls: 'silk-add',
				handler: onAdd
			}, '-', {
				text: 'Delete',
				iconCls: 'silk-delete',
				handler: onDelete
			}, '-'],
			viewConfig: {
				forceFit: true
			}
}); 

function onAdd(btn, ev) {
        var u = new GenreMgmtGrid.store.recordType({
            	strGenre: 'New Genre',
		idGenre: '-1' // flag as new record
        });
        editor.stopEditing();
        GenreMgmtGrid.store.insert(0, u);
        editor.startEditing(0);
}


function onDelete() {
    var rec = GenreMgmtGrid.getSelectionModel().getSelected();
    if (!rec) {return false;}
    
	if (checkXBMCGenreUsed(rec)){
		Ext.Msg.alert('Error', 'this genre is still in use');
		console.log('cannot remove');
	}
	else {
		removeXBMCGenre(rec);
		GenreMgmtGrid.store.remove(rec);
	}
}

//grid for Genres
var Genregrid = new Ext.grid.GridPanel({
			id: 'Genregrid',
			cm: GenrecolModel,
			title: 'Extra Genres',
			enableDragDrop: false,
			sm : Checkgenre,
			stripeRows: true,
			viewconfig: {forceFit: true},
			store: GenreStore
});

var winGenre = new Ext.Window({
    layout:'fit',
    width:500,
    height:300,
    closeAction:'hide',
    plain: true,
    items: GenreMgmtGrid,
    buttons: [{
        text: 'Close',
        handler: function(){
			winGenre.hide();
        }
    }]
});


