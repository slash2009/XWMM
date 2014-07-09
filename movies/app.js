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
