/*
 * Copyright 2011 slash2009.
 * Copyright 2013 Zernable.
 * Copyright 2013 uNiversal.
 * Copyright 2013, 2014 Andrew Fyfe.
 *
 * This file is part of Web interface Media Manager (WIMM) for kodi.
 *
 * WIMM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * WIMM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with WIMM.  If not, see <http://www.gnu.org/licenses/>.
 */

var AlbumRecord = Ext.data.Record.create([
   { name: 'albumid' },
   { name: 'title' },
   { name: 'artist', convert: XWMM.util.convertArrayToList },
   { name: 'displayartist' },
   { name: 'genre', convert: XWMM.util.convertArrayToList },
   { name: 'year' }
]);

var sortArticles = docCookies.getItem('sortArticles') === '1';
var AlbumStore = new Ext.data.GroupingStore({
    autoLoad: true,
    sortInfo: { field: 'title', direction: 'ASC' },
    proxy: new Ext.data.XBMCProxy({
        jsonData: {
            jsonrpc: '2.0',
            method: 'AudioLibrary.GetAlbums',
            params: {
                properties: [
                    'title', 'genre', 'artist', 'year', 'displayartist'
                ],
                sort: {
                    order: 'ascending',
                    ignorearticle: sortArticles,
                    method: 'title'
                }
            },
            id: 'XWMM'
        }
    }),
    reader: new Ext.data.JsonReader({ root: 'result.albums' }, AlbumRecord)
});

var AlbumcolModel = new Ext.grid.ColumnModel([
    { header: '#', dataIndex: 'albumid', hidden: true },
    { header: 'Album', dataIndex: 'title', width: 150 },
    { header: 'Year', dataIndex: 'year', hidden: true },
    { header: 'Artist', dataIndex: 'displayartist', hidden: true },
    { header: 'Genre', dataIndex: 'genre', hidden: true }
]);

var AlbumGrid = new Ext.grid.GridPanel({
    cm: AlbumcolModel,
    id: 'albumGrid',
    enableDragDrop: false,
    stripeRows: true,
    viewconfig: { forceFit: true },
    view: new Ext.grid.GroupingView({
        forceFit:true,
        width: 260,
        startCollapsed: true,
        showGroupName  : false,
        enableGroupingMenu : true,
        groupTextTpl: '{text}'
    }),
    selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
    region: 'west',
    width: 260,
    split: true,
    store: AlbumStore
});

// ------------ Album information -------------

var AlbumCover = new Ext.ux.XbmcImages ({
    autoEl: { tag: 'img', src: Ext.BLANK_IMAGE_URL },
    border: 0,
    width: 160,
    height: 160
});

var AlbumStars = new Ext.ux.XbmcStars ({
    border: 0,
    width: 58,
    height: 16
});

var standardInfo = new Ext.FormPanel({
    layout: 'form',
    title: 'Album Info (from tags)',
    frame: true,
    width: 270,
    height: 190,
    trackResetOnLoad: true,
    bodyStyle: 'padding:5px',
    labelWidth: 60,
    defaults: {
        xtype:'textfield',
        width: 170,
        listeners: {
            change: function() {
                Ext.getCmp('savebutton').enable();
            }
        }
    },
    items: [
        {
            fieldLabel: 'Title',
            name: 'title',
            allowBlank: false
        },
        {
            fieldLabel: 'Genre',
            name: 'genre'
        },
        {
            fieldLabel: 'Artist',
            name: 'artist'
        },
        {
            fieldLabel: 'Year',
            name: 'year'
        }
    ]
});

var extraInfo = new Ext.FormPanel({
    title: 'Additional Info (from scraper)',
    layout: 'form',
    trackResetOnLoad: true,
    frame: true,
    height: 368,
    width: 280,
    id: 'albumscraperdetails',
    labelWidth: 60,
    defaults: {
        xtype: 'textfield',
        width: 170,
        enableKeyEvents: true,
        listeners: {
            change: function() { Ext.getCmp('savebutton').enable(); }
        }
    },
    rowspan: 2,
    items: [
        {
            fieldLabel: 'Display Artist',
            name: 'displayartist'
        },
        {
            fieldLabel: 'Rating',
            name: 'rating'
        },
        {
            fieldLabel: 'Type',
            name: 'type'
        },
        {
            fieldLabel: 'Label',
            name: 'albumlabel'
        },
        {
            xtype: 'textarea',
            height: 47,
            fieldLabel: 'Styles',
            name: 'style'
        },
        {
            xtype:'textarea',
            height: 47,
            fieldLabel: 'Moods',
            name: 'mood'
        },
        {
            xtype:'textarea',
            height: 47,
            fieldLabel: 'Themes',
            name: 'theme'
        }
    ]
});

var albumDescription = new Ext.FormPanel({
    title:'Description',
    layout: 'form',
    trackResetOnLoad: true,
    labelWidth: 6,
    buttons: [
        {
            disabled: true,
            text: 'Save',
            id: 'savebutton',
            handler: function() {
                updateMusicAlbum();
                this.disable();
            }
        },
        {
            text: 'Cancel',
            handler: function() {
                updateGenreGrid(currentRecord.data.genres);
            }
        }
    ],
    width: 460,
    colspan: 2,
    items: [
        {
            xtype: 'textarea',
            name: 'description',
            listeners: {
                change: function() {
                    Ext.getCmp('savebutton').enable();
                }
            },
            height: 105,
            width: 430
        }
    ]
});

var albumDetailPanel = new Ext.Panel({
    region: 'north',
    width: 740,
    id: 'albumDetailPanel',
    trackResetOnLoad: true,
    title: '<div align="center">Select Album</div>',
    defaults:{frame:true},
    layout:'table',
    layoutConfig: {columns:3},
    items:[{
            width:190,
            items: [AlbumStars, AlbumCover]
        },
        standardInfo,
        extraInfo,
        albumDescription
     ]
});

// ------------ Track information -------------

function convertTime(val) {
    var minutes = Math.floor(val / 60);
    var seconds = val - minutes * 60;
    if (seconds < 10) seconds = '0' + seconds;
    if (minutes < 10) minutes = '0'  +minutes;
    return minutes + ':' + seconds;
}

function starRating(val) {
    val = parseInt(val);
    return '<img src="../resources/images/small-stars/' + val + '.gif" width="80" height="16" alt="' + val + ' Star(s)">';
}

var SongcolModel = new Ext.grid.ColumnModel([
    { header: '#', dataIndex: 'songid', hidden: true },
    { header: '#', dataIndex: 'track', width: 30 },
    { header: 'Track', dataIndex: 'title', width: 300 },
    { header: 'Duration', dataIndex: 'duration', width: 70, renderer: convertTime },
    { header: 'Rating', dataIndex: 'rating', width: 100, renderer: starRating }
]);

var SongRecord = Ext.data.Record.create([
   { name: 'songid' },
   { name: 'title' },
   { name: 'track' },
   { name: 'duration' },
   { name: 'rating', convert: XWMM.util.convertRating },
]);

var SongStore = new Ext.data.Store({
    proxy: new Ext.data.XBMCProxy({
        jsonData: {
            jsonrpc: '2.0',
            method: 'AudioLibrary.GetSongs',
            params: {
                properties: [
                    'track', 'title', 'artist', 'duration', 'rating'
                ],
                sort: {
                    order: 'ascending',
                    ignorearticle: sortArticles,
                    method: 'track'
                }
            },
            id: 'XWMM'
        }
    }),
    reader: new Ext.data.JsonReader({ root: 'result.songs' }, SongRecord)
});

var SongGrid = new Ext.grid.GridPanel({
    cm: SongcolModel,
    title: '<div align="center">Album Tracks</div>',
    region: 'center',
    loadMask: true,
    frame: 'true',
    enableDragDrop: false,
    stripeRows: true,
    viewconfig: { forceFit: true },
    selModel: new Ext.grid.RowSelectionModel({ singleSelect: true }),
    width: 740,
    height: 230,
    split: true,
    store: SongStore
});

var mainPanel = new Ext.Panel({
    region: 'center',
    layout: 'border',

    frame: true,
    loadMask: true,

    items: [
        menuBar,
        AlbumGrid,
        {
            xtype: 'panel',
            region: 'center',
            defaults: { xtype:'container' },
            items: [
                albumDetailPanel,
                SongGrid
            ]
        }
    ],

    initEvents: function() {
        Ext.getCmp('albumGrid').getSelectionModel().on('rowselect', this.albumSelect, this);
    },

    albumSelect: function(sm, rowIdx, record) {
        if (record.data.details === undefined){
            GetAlbumDetails(record);
        }

        //albumDetailPanel.getForm().loadRecord(record);
        standardInfo.getForm().loadRecord(record);
        extraInfo.getForm().loadRecord(record);
        albumDescription.getForm().loadRecord(record);
        albumDetailPanel.setTitle('<div align="center">' + record.data.title + ' / ' + record.data.artist + '</div>');

        AlbumCover.updateSrc(record.data.thumbnail);
        AlbumStars.updateSrc(record);

        SongStore.load({ params: { filter: { albumid: record.data.albumid } } });
        Ext.getCmp('savebutton').disable();
    }
});
