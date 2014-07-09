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

var AlbumcolModel = new Ext.grid.ColumnModel([
        {header: '#', dataIndex: 'albumid', hidden: true},
        {header: 'Album', dataIndex: 'strAlbum', width: 150},
        {header: 'Artist', dataIndex: 'strArtist', hidden: true},
        {header: 'Genre', dataIndex: 'strGenre', hidden: true},
        {header: 'Year', dataIndex: 'iYear', hidden: true}
]);

var AlbumRecord = Ext.data.Record.create([
   {name: 'albumid'},
   {name: 'strAlbum', mapping:'label'},
   {name: 'strArtist', mapping:'artist'},
   {name: 'strGenre', mapping:'genre', convert:convertGenre},
   {name: 'year'}, {name: 'currentThumbnail', mapping:'thumbnail'}
]);

var AlbumStore = new Ext.data.GroupingStore({
    sortInfo: {field: 'strAlbum', direction: 'ASC'},
    autoLoad: true,
    groupField: 'strGenre',
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams : {'jsonrpc': '2.0', 'method': 'AudioLibrary.GetAlbums', 'params': {'properties': ['genre', 'artist', 'year', 'thumbnail']},'id': 1}
    }),
    reader: new Ext.data.JsonReader({
        root:'result.albums'
        }, AlbumRecord)
});

function convertGenre(v, record) {
    return v.join(',');
}

AlbumGrid = new Ext.grid.GridPanel({
    cm: AlbumcolModel,
    id: 'albumGrid',
    enableDragDrop: false,
    stripeRows: true,
    viewconfig: {forceFit: true},
    view: new Ext.grid.GroupingView({
        forceFit:true,
        width: 260,
        startCollapsed: true,
        showGroupName  : false,
        // enableGrouping: false,
        enableGroupingMenu : true,
        //enableNoGroups: false,
        groupTextTpl: '{text} '}),
    selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
    region: 'west',
    width: 260,
    split: true,
    store: AlbumStore

});
