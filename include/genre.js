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
    proxy: new Ext.data.XBMCProxy({
        url: "/jsonrpc",
    }),
    reader: new Ext.data.JsonReader({
        root:'result.genres'
    }, genreRecord),
//  selectFromString :function(string){ // select genre rows according to movie genre field
//      var myArray = string.split('/');
//      Genregrid.getSelectionModel().clearSelections(false);
//      for (var i = 0; i < myArray.length; i++) {
//          var index = storegenre.findExact('label',removeSpace(myArray[i]),0,false,false);
//          Genregrid.getSelectionModel().selectRow(index, true)
//      }
//  }
    listeners: {
        load: function(store, records, options) {
            /*
            * When asking XBMC for a list of genres it will return a blank one. This blank one is a catch all for all
            * items that don't have a genre assigned to them. We don't want this blank genre to show up, so it's
            * remove from the store at load.
            */
            for (var i = 0, len = records.length; i < len; i++) {
                if (records[i].data.label === '') {
                    store.remove(records[i]);
                }
            }
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
    title: 'Genres',
    store: storegenre,
    cm: GenrecolModel,
    enableDragDrop: false,
    sm : Checkgenre,
    stripeRows: true,
    viewconfig: {forceFit: true},
    tbar: [
        {
            text: 'Add',
            iconCls: 'silk-add',
            handler: function(b, e) {
                Ext.MessageBox.prompt(
                    'Add Genre',
                    'Enter the name of the genre you would like to add:',
                    Genregrid.addGenre,
                    Genregrid);
            }
        }
    ],
    addGenre: function(btn, text) {
        if (btn != 'ok') {
            return;
        }

        var newGenre = new genreRecord({label: text});
        console.debug(this);
        this.store.add(newGenre);
    }
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
