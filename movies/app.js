Ext.onReady(function() {
    menuBar.add(
        { xtype: 'tbspacer' },
        {
            xtype: 'tbbutton',
            text: 'Tools',
            width: 60,
            menu: [
                {
                    text: 'Manage Genres',
                    iconCls: 'silk-plugin',
                    disabled: 'true',
                    handler: function() { winGenre.show(); }
                },
                {
                    text: 'Manage Movie Sets',
                    iconCls: 'silk-plugin',
                    handler: function() { winMovieSet.show(); }
                },
                {
                    text: 'Toggle articles in title sort',
                    iconCls: 'silk-plugin',
                    handler: function() {
                        // extjs cookies aren't available until v3.4.0, so we'll use cookies.js
                        var sortArticles = docCookies.getItem('sortArticles');
                        if (sortArticles === '1') {
                            docCookies.removeItem('sortArticles');
                        }
                        else {
                            docCookies.setItem('sortArticles', '1', 'Infinity');
                        }
                        window.location.reload();
                    }
                },
                {
                    text: 'Export to HTML',
                    menu: [
                        {
                            text: 'All Movies',
                            iconCls: 'silk-grid',
                            handler: function() { moviesHTML(); }
                        },
                        {
                            text: 'Watched Movies',
                            iconCls: 'silk-grid',
                            handler: function() { watchedMoviesHTML(); }
                        },
                        {
                            text: 'Unwatched Movies',
                            iconCls: 'silk-grid',
                            handler: function() { unwatchedMoviesHTML(); }
                        }
                    ]
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

    storegenre.proxy.conn.xbmcParams = {
        jsonrpc: '2.0',
        method: 'VideoLibrary.GetGenres',
        params: {
            type: 'movie'
        },
        id: 'XWMM'
    };
    storegenre.load();
    MovieSetStore.load();
    storeMovie.load();
});
