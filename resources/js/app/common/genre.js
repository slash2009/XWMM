/* global Ext: false, XWMM: false */
/*
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

Ext.ns('XWMM.video');

(function() {

    var genreRecord = Ext.data.Record.create([
        { name: 'genreid', type: 'string' },
        { name: 'label', type: 'string' }
    ]);

    var sortArticles = docCookies.getItem('sortArticles') === '1';

    XWMM.video.genreStore = new Ext.data.Store({
        proxy: new Ext.data.XBMCProxy({
            url: '/jsonrpc',
            xbmcParams: {
                jsonrpc: '2.0',
                method: 'VideoLibrary.GetGenres',
                params: {
                    type: 'movie',
                    sort: {
                        order: 'ascending',
                        ignorearticle: sortArticles,
                        method: 'label'
                    }
                },
                id: 'XWMM'
            }
        }),
        reader: new Ext.data.JsonReader({ root:'result.genres' }, genreRecord),
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

    var rowEditor = new Ext.ux.grid.RowEditor({
        saveText: 'Update',
        listeners: {
            afteredit: function(roweditor, changes, record, rowIndex) {
                if (record.data.genreid > -1) {
                    renameGenre(record.modified.label, changes.label);
                    roweditor.grid.getStore().reload();
                }
            }
        }
    });

    function renameGenre(oldGenre, newGenre) {
        var idField, resultField, readMethod, writeMethod, gridId;
        if (XWMM.video.genreMode === 'movie') {
            idField = 'movieid';
            resultField = 'movies';
            readMethod = 'VideoLibrary.GetMovies';
            writeMethod = 'VideoLibrary.SetMovieDetails';
            gridId = 'Moviegrid';
        }
        else if (XWMM.video.genreMode === 'tvshow') {
            idField = 'tvshowid';
            resultField = 'tvshows';
            readMethod = 'VideoLibrary.GetTVShows';
            writeMethod = 'VideoLibrary.SetTVShowDetails';
            gridId = 'tvshowgrid';
        }
        else {
            console.error('Unknown XWMM.video.mode. [' + XWMM.video.mode + ']');
            return;
        }

        var request = {
            jsonrpc: '2.0',
            method: readMethod,
            params: {
                properties: ['genre'],
                filter: { field: 'genre', operator: 'contains', value: oldGenre }
            },
            id: 'XWMM'
        };
        var response = xbmcJsonRPC(Ext.util.JSON.encode(request));

        var i, i_len, j, j_len, oldGenreList, newGenreList, updateRequest;
        for (i = 0, i_len = response[resultField].length; i < i_len; i++) {
            oldGenreList  = response[resultField][i].genre;
            newGenreList = [];

            for (j = 0, j_len = oldGenreList.length; j < j_len; j++) {
                if (oldGenreList[j] === oldGenre || oldGenreList[j] === newGenre) {
                    if (newGenre !== undefined) {
                        newGenreList.push(newGenre);
                    }
                }
                else {
                    newGenreList.push(oldGenreList[j]);
                }
            }

            updateRequest = {
                jsonrpc: '2.0',
                method: writeMethod,
                params: { genre: newGenreList },
                id: 'XWMM'
            };
            updateRequest.params[idField] = response[resultField][i][idField];
            xbmcJsonRPC(Ext.util.JSON.encode(updateRequest));
        }

        Ext.getCmp(gridId).getStore().load();
    }

    new Ext.Window({
        id: 'manageGenresWin',
        title: 'Genre Management',
        layout: 'fit',
        width: 500,
        height: 300,
        modal: true,
        closeAction:'hide',
        items: [
            {
                id: 'manageGenresGrid',
                xtype: 'grid',
                columns: [
                    { header: '#', dataIndex: 'genreid', hidden: true },
                    { header: 'Genre', editor: new Ext.form.TextField({ allowBlank: false }), dataIndex: 'label', id: 'title' }
                ],
                autoExpandColumn: 'title',
                enableColumnResize: false,
                clicksToEdit: 1,
                stripeRows: true,
                plugins: [rowEditor],
                store: XWMM.video.genreStore,
                tbar: [
                    {
                        text: 'Add',
                        iconCls: 'silk-add',
                        handler: function(btn, e) {
                            Ext.MessageBox.prompt(
                                'Add a genre',
                                'Enter the name of the genre you would like to add:',
                                function(btn, text) {
                                    if (btn === 'ok') {
                                        var newGenre = new genreRecord({ label: text });
                                        var grid = Ext.getCmp('manageGenresGrid');
                                        grid.getStore().add(newGenre);
                                        grid.getSelectionModel().selectLastRow();
                                    }
                                }
                            );
                        }
                    },
                    '-',
                    {
                        text: 'Delete',
                        iconCls: 'silk-delete',
                        handler: function(btn, e) {
                            var grid = Ext.getCmp('manageGenresGrid');
                            var record = grid.getSelectionModel().getSelected();

                            if (record === undefined) {
                                Ext.Msg.alert(
                                    'Select a genre',
                                    'You must select a genre to delete first.'
                                );
                                return false;
                            }

                            Ext.Msg.confirm(
                                'Are you sure?',
                                'Are you sure you want to delete the ' + record.data.label + ' genre?<br>' +
                                'This can\'t be undone!',
                                function(btn) {
                                    if (btn === 'yes') {
                                        renameGenre(record.data.label, undefined);
                                        grid.getStore().reload();
                                    }
                                }
                            );
                        }
                    }
                ],
            }

        ],
        buttons: [
            {
                text: 'Close',
                handler: function(btn, e) {
                    Ext.getCmp('manageGenresWin').hide();
                }
            }
        ]
    });


    var genreChkBoxSM = new Ext.grid.CheckboxSelectionModel({
        dataIndex: 'genreid',
        alwaysSelectOnCheck: 'true',
        header: false,
        listeners: {
            selectionchange: function(sm) {
                if (XWMM.video.genreMode === 'movie') {
                    movieGenreChange(sm);
                }
                else if (XWMM.video.genreMode === 'tvshow') {
                    tvShowGenreChange(sm);
                }
                else {
                    console.error('Unknown XWMM.video.mode. [' + XWMM.video.mode + ']');
                }
            }
        }
    });

    XWMM.video.genresGrid = new Ext.grid.GridPanel({
        id: 'genresGrid',
        title: 'Genres',
        store: XWMM.video.genreStore,

        cm: new Ext.grid.ColumnModel([
            genreChkBoxSM,
            { header: '#', dataIndex: 'genreid', hidden: true },
            { header: 'Genre', dataIndex: 'label', id: 'title' }
        ]),
        sm : genreChkBoxSM,
        autoExpandColumn: 'title',
        enableColumnResize: false,
        stripeRows: true,
        tbar: [
            {
                text: 'Add',
                iconCls: 'silk-add',
                handler: function(btn, e) {
                    Ext.MessageBox.prompt(
                        'Add a genre',
                        'Enter the name of the genre you would like to add:',
                        function(btn, text) {
                            if (btn === 'ok') {
                                var newGenre = new genreRecord({ label: text });
                                var grid = Ext.getCmp('genresGrid');
                                grid.getStore().add(newGenre);
                            }
                        }
                    );
                }
            }
        ]
    });


    XWMM.video.setGenreMode = function(mode) {
        if (mode === 'movie' || mode === 'tvshow') {
            XWMM.video.genreMode = mode;
        }
        else {
            console.error('XWMM.video.setGenreMode :: Unknown mode. [' + mode + ']');
            return;
        }

        XWMM.video.genreStore.proxy.conn.xbmcParams.params.type = mode;
        XWMM.video.genreStore.load();
    };

})();
