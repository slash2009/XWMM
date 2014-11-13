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

// -----------------------------------------
// movie.js
//------------------------------------------

var MovieFanart = new Ext.ux.XbmcImages ({
    id: 'fanart',
    border: 0,
    width: 295,
    height:165,
    autoEl: {tag: 'img', src: '../resources/images/defaultMovieFanart.jpg'}//, qtip:'Double-click to change'}
});

var Stars = new Ext.ux.XbmcStars ({
    id: 'movierating',
    border: 0,
    width: 96,
    height:27
});

var MovieCover = new Ext.ux.XbmcImages ({
    id: 'cover',
    cls: 'center-align',
    border: 0,
    width: 250,
    height:375,
    autoEl: {tag: 'img', src: '../resources/images/defaultMovieCover.jpg'}//, qtip:'Double-click to change'}
});

var actorRecord = Ext.data.Record.create([
    { name: 'name' },
    { name: 'role' }
]);

var storeActor = new Ext.data.Store({
    sortInfo: { field: 'name', direction: 'ASC' },
    proxy: new Ext.data.XBMCProxy({
        jsonData: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovieDetails',
            params: {
                // movieid: -1, // Replaced by valid movie id before loaded.
                properties: ['cast']
            },
            id: 'XWMM'
        }
    }),
    reader: new Ext.data.JsonReader({ root: 'result.moviedetails.cast' }, actorRecord)
});

var gridContextMenu = new Ext.menu.Menu({
    items: [
        { text: 'Mark as watched', handler: setWatched },
        { text: 'Mark as unwatched', handler: setUnwatched }
    ]
});

var actorGrid = new Ext.grid.GridPanel({
    title: 'Cast',
    id: 'actorgrid',
    store: storeActor,

    cm: new Ext.grid.ColumnModel([
        { header: 'Actor', dataIndex: 'name' },
        { header: 'Role', dataIndex: 'role' }
    ]),
    stripeRows: true,

    viewConfig: {
        scrollOffset: 1,
        headersDisabled: true
    }
});

var otherDetailsPanel = new Ext.FormPanel({
    title: 'Other Details',
    id: 'filedetailPanel',

    trackResetOnLoad : true,
    labelWidth: 55,
    padding: 5,
    defaults: {
        xtype: 'textfield',
        width: 150,
        listeners: {
            change: function() { Ext.getCmp('savebutton').enable(); }
        }
    },
    items: [
        {
            fieldLabel: 'Name',
            name: 'file',
            readOnly: true
        },
        {
            fieldLabel: 'Original',
            name: 'originaltitle',
        },
        {
            fieldLabel: 'Country',
            name: 'country',
        },
        {
            fieldLabel: 'IMDb #',
            name: 'imdbnumber',
        },
        {
            id: 'moviesetcombo',
            store: XWMM.video.movieSetStore,

            xtype: 'combo',
            fieldLabel: 'Set',
            name: 'set',
            emptyText: '-- None --',
            displayField: 'label',
            mode: 'local',
            triggerAction: 'all',
            listeners: {
                change: function(combo, newValue, oldValue) {
                    if (newValue !== oldValue) {
                        Ext.getCmp('savebutton').enable();
                    }
                }
            }
        },
        {
            fieldLabel: 'Tags',
            name: 'tag',
        }
    ]
});

var movieDetailsPanel = new Ext.FormPanel({
    id: 'MoviedetailPanel',
    title: '<div align="center">Movie Details</div>',

    region: 'center',

    trackResetOnLoad : true,
    frame: true,
    padding: 5,

    defaults: {
        labelWidth: 90
    },
    buttons: [
        {
            disabled: true,
            text: 'Save',
            id: 'savebutton',
            handler: function() {
                updateXBMCAll();
                this.disable();
            }
        },
        {
            text:'Cancel',
            handler: function() {
                // TODO: should this reset the form?
            }
        }
    ],

    layout:'table',
    layoutConfig: { columns: 3 },
    items: [
        {
            layout: 'form',
            defaults: {
                xtype: 'textfield',
                width: 220,
                listeners: {
                    change: function() { Ext.getCmp('savebutton').enable(); }
                }
            },
            items: [
                {
                    fieldLabel: 'Title',
                    name: 'title',
                    allowBlank: false
                },
                {
                    fieldLabel: 'Sort Title',
                    name: 'sorttitle',
                },
                {
                    fieldLabel: 'Genres',
                    name: 'genre',
                    id:'moviegenres',
                    readOnly: true
                }
            ]
        },
        {
            layout: 'form',
            padding: '0 10px',
            defaults: {
                xtype: 'textfield',
                width: 80,
                listeners: {
                    change: function() { Ext.getCmp('savebutton').enable(); }
                }
            },
            items:[
                {
                    fieldLabel: 'Release',
                    name: 'year'
                },
                {
                    fieldLabel: 'Rating',
                    name: 'rating',
                },
                {
                    fieldLabel: 'Duration',
                    name: 'runtime'
                }
            ]
        },
        {
            rowspan: 2,
            width: 300,
            items: [Stars, MovieCover]
        },
        {
            layout: 'form',
            colspan: 2,
            defaults: {
                xtype: 'textfield',
                width: 405,
                listeners: {
                    change: function() { Ext.getCmp('savebutton').enable(); }
                }
            },
            items: [
                {
                    xtype: 'textarea',
                    name: 'plot',
                    fieldLabel: 'Plot',
                    height: 95
                },
                {
                    xtype: 'textarea',
                    height: 34,
                    name: 'plotoutline',
                    fieldLabel: 'Outline'
                },
                {
                    xtype: 'textarea',
                    name: 'tagline',
                    fieldLabel: 'Tagline',
                    height: 34
                },
                {
                    fieldLabel: 'Director',
                    name: 'director'
                },
                {
                    fieldLabel: 'Content Rating',
                    name: 'mpaa'
                },
                {
                    fieldLabel: 'Studio',
                    name: 'studio'
                },
                {
                    fieldLabel: 'Trailer',
                    id: 'trailer',
                    name: 'trailer'
                },
                {
                    xtype: 'button',
                    text: 'View Trailer',
                    handler: function() {
                        if (Ext.getCmp('trailer').getValue() !== '') {
                            window.open(Ext.getCmp('trailer').getValue(), '');
                        }
                    },
                    width: 60
                }
            ]
        },
        {
            items: [MovieFanart]
        },
        {
            items: [audioFlagsPanel]
        },
        {
            items: [videoFlagsPanel]
        }
    ]
});

var mainPanel = new Ext.Panel({
    region: 'center',
    layout: 'border',

    frame: true,
    loadMask: true,

    items: [
        {
            xtype: 'panel',
            region: 'east',
            split: true,
            width: 225,
            items: [{
                layout: 'accordion',
                height: 500,
                items: [
                    Ext.getCmp('genresGrid'),
                    actorGrid,
                    otherDetailsPanel
                ]
            }]
        },
        menuBar,
        movieGrid,
        movieDetailsPanel
    ],

    initEvents: function() {
        Ext.getCmp('Moviegrid').getSelectionModel().on('rowselect', this.movieSelect, this);
    },

    movieSelect: function(sm, rowIdx, record) {
        loadMovieDetails(record);
        updateMovieGenreGrid(record);
        Ext.getCmp('filedetailPanel').getForm().loadRecord(record);

        storeActor.load({ params: { movieid: record.data.movieid } });
    }
});
