
//to be deleted ?
var MoviedetailSet = new Ext.form.FieldSet({
	columnWidth:0.56,
    title: 'Movie details',
	id: 'details',
	labelWidth: 65,
	bodyStyle:'padding:5px 10px 5'
});

//to be deleted ?
var MoviePicture = new Ext.form.FieldSet({
	columnWidth:0.44,
	//layout: 'form',
	bodyStyle:'padding:5px 10px 0',
	defaults:{xtype:'container'},
	title: 'Rating and Cover',
	cls: 'center-align'
});

var genreRecord = Ext.data.Record.create([	
   {name: 'genreid', type: 'string'},
   {name: 'label'}
]);

var Checkgenre = new Ext.grid.CheckboxSelectionModel({
	dataIndex:'genreid',
	alwaysSelectOnCheck: 'true',
	header: false,
	listeners: {
		selectionchange: function(sm) {
			movieGenreChange(sm);
			var bt = Ext.getCmp('savebutton');
			bt.enable()
		}
	}
});


function updateGenreGrid(t){
	Genregrid.getSelectionModel().clearSelections(false);
	Genregrid.getSelectionModel().selectRows(t, true);
	// var bt = Ext.getCmp('savebutton');
	// bt.disable()
};

var GenrecolModel = new Ext.grid.ColumnModel([
		Checkgenre,
		{header: "#", dataIndex: 'genreid', hidden: true},
		{header: "Genre", width: 200, dataIndex: 'label'}
]);

var storegenre = new Ext.data.Store({
	id: 'storegenre',
	sortInfo: {field: 'label', direction: "ASC"},
	autoLoad: true,
	proxy: new Ext.data.XBMCProxy({
		url: "/jsonrpc",
		xbmcParams : {"jsonrpc": "2.0", "method": "VideoLibrary.GetGenres", "params": {"type": "movie"},"id": 1}
	}),
	reader: new Ext.data.JsonReader({
		root:'result.genres'	       
	}, genreRecord),
	selectFromString :function(string){ // select genre rows according to movie genre field 
		var myArray = string.split('/');
		Genregrid.getSelectionModel().clearSelections(false);
		for (var i = 0; i < myArray.length; i++) {
			var index = storegenre.findExact('label',removeSpace(myArray[i]),0,false,false);
			Genregrid.getSelectionModel().selectRow(index, true);
		}
	}
});

var editor = new Ext.ux.grid.RowEditor({
	saveText: 'Update',
	listeners: {
		afteredit: function(roweditor, changes, record, rowIndex) {
			if (record.data.idGenre == -1) {
				AddXBMCNewGenre(record);
				storegenre.reload();
			}
			else {
				updateXBMCGenreString(record);
				storegenre.reload();
			}								
 		 }
	}
});


//grid for Genres mgmt
var GenreMgmtGrid = new Ext.grid.GridPanel({
			id: 'genremgmtgrid',
			columns: [
				{header: "#", dataIndex: 'genreid', hidden: true},
				{header: "Genre", width: 200, editor: new Ext.form.TextField({allowBlank: false}),dataIndex: 'label'}
			],
			clicksToEdit: 1,
			title: 'Genre Management',
			enableDragDrop: false,
			//sm : Checkgenre,
			stripeRows: true,
			plugins: [editor],
			store: storegenre,
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
			title: 'Genres',
			enableDragDrop: false,
			sm : Checkgenre,
			stripeRows: true,
			viewconfig: {forceFit: true},
			store: storegenre
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


