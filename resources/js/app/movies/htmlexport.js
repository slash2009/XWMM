/* global Ext: false, XWMM: false */
/*
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

(function() {

    function formatField(field, value) {
        switch (field) {
            case 'rating':
                value = XWMM.util.convertRating(value);
                break;

            case 'country':
            case 'director':
            case 'genre':
            case 'studio':
                value = value.join(' / ');
                break;

            case 'runtime':
                value = Math.round(value / 60);
                break;

            case 'fanart':
            case 'thumbnail':
                value = decodeURIComponent(XWMM.util.convertArtworkURL(value));
                break;
        }

        return value;
    }

    function exportToHTML(options) {
        var title = 'Movies';

        var request = {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovies',
            params: {
                properties: options.fields,
                sort: {
                    method: options.sortby.toLowerCase().replace(' ', '')
                }
            },
            id: 'WIMM'
        };

        if ('ignoreArticle' in options && options.ignoreArticle === 'on') {
            request.params.sort.ignorearticle = true;
        }

        if ('reverseSort' in options && options.reverseSort === 'on') {
            request.params.sort.order = 'descending';
        }
        else {
            request.params.sort.order = 'ascending';
        }

        if (options.filter === 'Watched') {
            title = 'Watched ' + title;
            request.params.filter = {
                field: 'playcount',
                operator: 'isnot',
                value: '0'
            };
        }
        else if (options.filter === 'Unwatched') {
            title = 'Unatched ' + title;
            request.params.filter = {
                field: 'playcount',
                operator: 'is',
                value: '0'
            };
        }

        var response = xbmcJsonRPC(request);

        var win = open('', 'XWMM.exportToHTML', 'width=900,height=700,status=yes,toolbar=yes,scrollbars=yes');
        win.document.open();
        win.document.write(
            '<!DOCTYPE html>\n' +
            '<html>\n' +
            '<head>\n' +
            '    <title>' + title + '</title>\n' +
            '    <meta charset="utf-8">\n' +
            '    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n' +
            '    <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
            '    <link rel="stylesheet" type="text/css" href="../resources/css/htmlexport.css">\n' +
            '</head>\n' +
            '<body>\n' +
            '<h1>' + title + '</h1>\n' +
            '<table>\n' +
            '    <thead>\n' +
            '        <tr>\n');

        var i, i_len, j, j_len;
        for (i = 0, i_len = options.fields.length; i < i_len; i++) {
            win.document.write('            <th>' + XWMM.util.toTitleCase(options.fields[i]) + '</th>');
        }

        win.document.write(
            '        </tr>\n' +
            '    </thead>\n' +
            '    <tbody>\n');

        for (i = 0, i_len = response.movies.length; i < i_len; i++) {
            win.document.write('        <tr>\n');
            for (j = 0, j_len = options.fields.length; j < j_len; j++) {
                win.document.write('            <td>' +
                    formatField(options.fields[j], response.movies[i][options.fields[j]]) +
                    '</td>');
            }
            win.document.write('        </tr>\n');
        }

        win.document.write(
            '    </tbody>\n' +
            '</table>\n' +
            '    </body>\n' +
            '</html>\n');

        win.document.close();
    }


    new Ext.Window({
        id: 'exportToHTMLWin',
        title: 'Export movies to HTML',
        layout: 'fit',
        width: 500,
        height: 350,
        modal: true,
        items: [
            {
                id: 'exportToHTMLForm',
                xtype: 'form',
                bodyStyle: 'padding:15px',

                items: [
                    {
                        xtype: 'combo',
                        fieldLabel: 'Movies',
                        name: 'filter',
                        allowBlank: false,
                        autoSelect: true,
                        store: ['All', 'Unwatched', 'Watched'],
                        triggerAction:'all',
                        emptyText: 'Select which movies to view',
                        value: 'All'
                    },
                    {
                        xtype: 'combo',
                        fieldLabel: 'Sort by',
                        name: 'sortby',
                        allowBlank: false,
                        autoSelect: true,
                        store: ['Title', 'Sort Title', 'Year', 'Rating', 'Runtime', 'Date Added'],
                        triggerAction:'all',
                        emptyText: 'Select field to sort by',
                        value: 'Title'
                    },
                    {
                        xtype: 'checkboxgroup',
                        items: [
                            {
                                name: 'reverseSort',
                                boxLabel: 'Reverse',
                                checked: false
                            },
                            {
                                name: 'ignoreArticle',
                                boxLabel: 'Ignore Article',
                                checked: true
                            }
                        ]
                    },
                    {
                        xtype: 'fieldset',
                        title: 'Fields to export',
                        autoHeight: true,
                        defaults: { hideLabel: true },
                        allowBlank: false,
                        items: [
                            {
                                xtype: 'checkboxgroup',
                                columns: [100, 100, 100, 100],
                                items: [
                                    {
                                        name: 'fields',
                                        boxLabel: 'Title',
                                        inputValue: 'title',
                                        checked: true
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Sort Title',
                                        inputValue: 'sorttitle',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Original Title',
                                        inputValue: 'originaltitle',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Year',
                                        inputValue: 'year',
                                        checked: true
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Genre',
                                        inputValue: 'genre',
                                        checked: true
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Director',
                                        inputValue: 'director',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Studio',
                                        inputValue: 'studio',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Writer',
                                        inputValue: 'writer',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Rating',
                                        inputValue: 'rating',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Votes',
                                        inputValue: 'votes',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'IMDb #',
                                        inputValue: 'imdbnumber',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Top 250 Rank',
                                        inputValue: 'top250',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Trailer',
                                        inputValue: 'trailer',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Tag Line',
                                        inputValue: 'tagline',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Plot',
                                        inputValue: 'plot',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Plot Outline',
                                        inputValue: 'plotoutline',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Play Count',
                                        inputValue: 'playcount',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Content Rating',
                                        inputValue: 'mpaa',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Country',
                                        inputValue: 'country',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Runtime',
                                        inputValue: 'runtime',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Set',
                                        inputValue: 'set',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Thumbnail',
                                        inputValue: 'thumbnail',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'Fanart',
                                        inputValue: 'fanart',
                                        checked: false
                                    },
                                    {
                                        name: 'fields',
                                        boxLabel: 'File',
                                        inputValue: 'file',
                                        checked: false
                                    }
                                ]
                            }
                        ]
                    },
                ],
                buttons: [
                    {
                        text: 'Export',
                        handler: function(btn, e) {
                            exportToHTML(Ext.getCmp('exportToHTMLForm').getForm().getValues());
                        }
                    },
                    {
                        text: 'Cancel',
                        handler: function(btn, e) {
                            Ext.getCmp('exportToHTMLWin').hide();
                        }
                    }
                ]
            }
        ]
    });

})();
