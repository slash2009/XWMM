/*
 * Copyright 2011 slash2009.
 * Copyright 2013 Zernable.
 * Copyright 2013 uNiversal.
 * Copyright 2013, 2014 Andrew Fyfe.
 *
 * This file is part of XBMC Web Media Manager (XWMM).
 *
 * XWMM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * XWMM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with XWMM.  If not, see <http://www.gnu.org/licenses/>.
 */

var genreRecord = Ext.data.Record.create([
   {name: 'idGenre', mapping: 'genreid'},
   {name: 'strGenre', mapping: 'label'}
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
        {header: '#', dataIndex: 'idGenre', hidden: true},
        {header: 'Genre', dataIndex: 'strGenre'}
]);

var GenreStore = new Ext.data.Store({
    sortInfo: {field: 'strGenre', direction: 'ASC'},
    autoLoad: true,
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams : {'jsonrpc': '2.0', 'method': 'AudioLibrary.GetGenres', 'id': 1}
    }),
    reader: new Ext.data.JsonReader({
        root:'result.genres'
        }, genreRecord),
    url: '/xbmcCmds/xbmcHttp?command=querymusicdatabase(select idGenre, strGenre FROM genre)'
});


var editor = new Ext.ux.grid.RowEditor({
    saveText: 'Update',
    listeners: {
        afteredit: function(roweditor, changes, record, rowIndex) {
            if (record.data.idGenre === -1) {
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
                {header: '#', dataIndex: 'idGenre', hidden: true},
                {header: 'Genre', width: 200, editor: new Ext.form.TextField({allowBlank: false}),dataIndex: 'strGenre'}
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
    console.error('BROKEN! This doesn\'t work at the moment.');
    /*
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
    */
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
