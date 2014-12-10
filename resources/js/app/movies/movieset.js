/* global Ext: false, WIMM: false */
/*
 * Copyright 2011, 2013 slash2009.
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

Ext.ns('WIMM.video');

(function() {

    var movieSetRecord = Ext.data.Record.create([
        { name: 'setid' },
        { name: 'label' }
    ]);

    var sortArticles = docCookies.getItem('sortArticles') === '1';

    WIMM.video.movieSetStore = new Ext.data.Store({
        proxy: new Ext.data.KodiProxy({
            jsonData: {
                jsonrpc: '2.0',
                method: 'VideoLibrary.GetMovieSets',
                params: {
                    sort: {
                        order: 'ascending',
                        ignorearticle: sortArticles,
                        method: 'label'
                    }
                },
                id: 'WIMM'
            }
        }),
        reader: new Ext.data.JsonReader({ root:'result.sets' }, movieSetRecord)
    });

    var rowEditor = new Ext.ux.grid.RowEditor({
        saveText: 'Update',
        listeners: {
            afteredit: function(roweditor, changes, record, rowIndex) {
                if (record.data.setid > -1) {
                    renameMovieSet(record.modified.label, changes.label);
                    roweditor.grid.getStore().reload();
                }
            }
        }
    });

    function renameMovieSet(oldMovieSet, newMovieSet) {
        if (newMovieSet === undefined) {
            newMovieSet = '';
        }

        console.debug(oldMovieSet, newMovieSet);
        var request = {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovies',
            params: {
                filter: { field: 'set', operator: 'contains', value: oldMovieSet }
            },
            id: 'WIMM'
        };
        var response = kodiJsonRPC(request);

        var i, i_len, updateRequest;
        for (i = 0, i_len = response.movies.length; i < i_len; i++) {
            updateRequest = {
                jsonrpc: '2.0',
                method: 'VideoLibrary.SetMovieDetails',
                params: {
                    movieid: response.movies[i].movieid,
                    set: newMovieSet
                },
                id: 'WIMM'
            };
            kodiJsonRPC(updateRequest);
        }

        Ext.getCmp('Moviegrid').getStore().load();
    }

    new Ext.Window({
        id: 'manageMovieSetsWin',
        title: 'Movie Set Management',
        layout: 'fit',
        width: 500,
        height: 300,
        modal: true,
        closeAction:'hide',
        items: [
            {
                id: 'manageMovieSetsGrid',
                xtype: 'grid',
                columns: [
                    { header: '#', dataIndex: 'setid', hidden: true },
                    { header: 'Set', editor: new Ext.form.TextField({ allowBlank: false }), dataIndex: 'label', id: 'title' }
                ],
                autoExpandColumn: 'title',
                enableColumnResize: false,
                clicksToEdit: 1,
                stripeRows: true,
                plugins: [rowEditor],
                store: WIMM.video.movieSetStore,
                tbar: [
                    {
                        text: 'Add',
                        iconCls: 'silk-add',
                        handler: function(btn, e) {
                            Ext.MessageBox.prompt(
                                'Add a movie set',
                                'Enter the name of the movie set you would like to add:',
                                function(btn, text) {
                                    if (btn === 'ok') {
                                        var newMovieSet = new movieSetRecord({ label: text });
                                        var grid = Ext.getCmp('manageMovieSetsGrid');
                                        grid.getStore().add(newMovieSet);
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
                            var grid = Ext.getCmp('manageMovieSetsGrid');
                            var record = grid.getSelectionModel().getSelected();

                            if (record === undefined) {
                                Ext.Msg.alert(
                                    'Select a movie set',
                                    'You must select a movie set to delete first.'
                                );
                                return false;
                            }

                            Ext.Msg.confirm(
                                'Are you sure?',
                                'Are you sure you want to delete the ' + record.data.label + ' movie set?<br>' +
                                'This can\'t be undone!',
                                function(btn) {
                                    if (btn === 'yes') {
                                        renameMovieSet(record.data.label, undefined);
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
                    Ext.getCmp('manageMovieSetsWin').hide();
                }
            }
        ]
    });

})();
