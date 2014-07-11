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

Ext.onReady(function() {
    menuBar.add(
        { xtype: 'tbspacer' },
        {
            xtype: 'tbbutton',
            text: 'Tools',
            width: 60,
            menu: [
                {
                    text: 'Scan Library',
                    iconCls: 'silk-plugin',
                    handler: function() {
                        XWMM.video.scanLibrary();
                        Ext.MessageBox.alert(
                            'Scan Library',
                            'A library scan has begun.'
                        );
                    }
                },
                {
                    text: 'Clean Library',
                    iconCls: 'silk-plugin',
                    handler: function() {
                        XWMM.video.cleanLibrary();
                        Ext.MessageBox.alert(
                            'Clean Library',
                            'The library is being cleaned.'
                        );
                    }
                },
                {
                    text: 'Manage Genres',
                    iconCls: 'silk-plugin',
                    handler: function() { Ext.getCmp('manageGenresWin').show(); }
                },
                {
                    text: 'Manage Movie Sets',
                    iconCls: 'silk-plugin',
                    handler: function() { Ext.getCmp('manageMovieSetsWin').show(); }
                },
                {
                    xtype: 'menucheckitem',
                    checked: (docCookies.getItem('sortArticles') === '1'),
                    text: 'Ignore articles when sorting (e.g. "the")',
                    handler: function() {
                        // extjs cookies aren't available until v3.4.0, so we'll use cookies.js
                        var sortArticles = docCookies.getItem('sortArticles');
                        if (sortArticles === '1') {
                            docCookies.removeItem('sortArticles');
                        }
                        else {
                            docCookies.setItem('sortArticles', '1', Infinity);
                        }
                        window.location.reload();
                    }
                },
                {
                    text: 'Export to HTML',
                    iconCls: 'silk-grid',
                    handler: function() { Ext.getCmp('exportToHTMLWin').show(); }
                }
            ]
        },
        {
            xtype: 'tbtext',
            text: 'Quick Search:',
            tooltip: 'Quickly search through movies.'
        },
        {
            xtype: 'text',
            tag: 'input',
            id: 'quicksearch',
            size: 30
        },
        {
            text: 'X',
            tooltip: 'Clear quick search',
            handler: function() {
                Ext.getCmp('searchBox').setValue('');
                storeMovie.clearFilter();
            }
        },
        { xtype: 'tbfill' },
        { text: myVersion }
    );

    new Ext.Viewport({
        layout: 'border',
        items: [
            menuBar,
            mainPanel
        ]
    });

    addQuickSearch('quicksearch', storeMovie, 'Movietitle');

    XWMM.video.setGenreMode('movie');
    XWMM.video.movieSetStore.load();
});
