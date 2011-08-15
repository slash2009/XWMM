
var MoviedetailSet = new Ext.form.FieldSet({
	columnWidth:0.56,
    title: 'Movie details',
	id: 'details',
	labelWidth: 65,
	bodyStyle:'padding:5px 10px 5'
});

var MoviePicture = new Ext.form.FieldSet({
	columnWidth:0.44,
	//layout: 'form',
	bodyStyle:'padding:5px 10px 0',
	defaults:{xtype:'container'},
	title: 'Rating and Cover',
	cls: 'center-align'
});

var genreRequest;
var genreRecord = Ext.data.Record.create([
   {name: 'idGenre', mapping: 'field:nth(1)'},		
   {name: 'strGenre', mapping: 'field:nth(2)'}
]);

var Checkgenre = new Ext.grid.CheckboxSelectionModel({
	dataIndex:'idGenre',
	alwaysSelectOnCheck: 'true',
	header: false,
	listeners: {
		selectionchange: function(sm) {
			movieGenreChange(sm);
			var bt = Ext.getCmp('savebutton');
			bt.enable()
		}
		// rowdeselect: function(sm) {
			// console.log('a supprimer');
		// },
		// rowselect: function(sm) {
			// console.log('a ajouter');
		// }
	}
});

var GenrecolModel = new Ext.grid.ColumnModel([
		Checkgenre,
		{header: "#", dataIndex: 'idGenre', hidden: true},
		{header: "Genre", width: 200, dataIndex: 'strGenre'}
]);

var storegenre = new Ext.data.Store({
	id: 'storegenre',
	sortInfo: {field: 'strGenre', direction: "ASC"},
	reader: new Ext.data.JsonXBMCReader({
		root:'data'	       
		}, genreRecord),
	url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idGenre, strGenre FROM genre)'
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
				{header: "#", dataIndex: 'idGenre', hidden: true},
				{header: "Genre", width: 200, editor: new Ext.form.TextField({allowBlank: false}),dataIndex: 'strGenre'}
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


