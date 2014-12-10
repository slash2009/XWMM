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

var MovieRecord = Ext.data.Record.create([
    { name: 'movieid' },
    { name: 'Movietitle', mapping: 'title' },
    { name: 'watched', mapping: 'playcount' },
    { name: 'set' },
    { name: 'year' }
]);

var sortArticles = docCookies.getItem('sortArticles') === '1';
var storeMovie = new Ext.data.Store({
    autoLoad: true,

    proxy: new Ext.data.XBMCProxy({
        jsonData: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovies',
            params: {
                properties: [
                    'title', 'year', 'playcount', 'set'
                ],
                sort: {
                    order: 'ascending',
                    ignorearticle: sortArticles,
                    method: 'sorttitle'
                }
            },
            id: 'WIMM'
        }
    }),
    reader: new Ext.data.JsonReader({ root: 'result.movies' }, MovieRecord)
});

var movieGrid = new Ext.grid.GridPanel({
    title: 'Movies by Genre',
    id: 'Moviegrid',
    store: storeMovie,

    region: 'west',
    width: 285,
    frame: true,
    split: true,

    cm: movieColumnModel,
    autoExpandColumn: 'title',
    enableColumnResize: false,
    stripeRows: true,

    viewConfig: {
        headersDisabled: true
    },

    sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),

    listeners: {
        rowcontextmenu: function(grid, rowIndex, e) {
            e.stopEvent();
            gridContextMenu.showAt(e.getXY());
            return false;
        }
    },

    tbar: {
            xtype: 'toolbar',
            height: 30,
            items: [
                {
                    id: 'genreFilterCombo',
                    store: WIMM.video.genreStore,

                    xtype: 'combo',
                    name: 'label',
                    emptyText: 'Filter by genre...',
                    displayField: 'label',
                    mode: 'local',
                    triggerAction: 'all',
                    listeners: {
                        select: function(combo, record, index) {
                            storeMovie.load({ params: { filter: {
                                field: 'genre',
                                operator: 'contains',
                                value: record.data.label
                            } } });
                        }
                    }
                },
                {
                    text: 'X',
                    tooltip: 'Clear genre filter',
                    handler: function() {
                        Ext.getCmp('genreFilterCombo').clearValue();
                        storeMovie.load({ params: { filter: {
                                field: 'genre',
                                operator: 'contains',
                                value: ''
                            } } });
                    }
                }
            ]
        }
});
