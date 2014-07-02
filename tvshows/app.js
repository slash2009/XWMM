Ext.onReady(function() {
    menuBar.add(
        { xtype: 'tbspacer' },
        {
            xtype: 'tbbutton',
            text: 'Tools',
            menu: [
                {
                    text: 'Manage Genres',
                    disabled: 'true',
                    iconCls: 'silk-plugin',
                    handler: function(){ winGenre.show(); }
                }
            ]
        },
        {
            text: 'Quick Search:',
            tooltip: 'Quickly search through TV shows'
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
                storeTVShow.clearFilter();
            }
        },
        { xtype: 'tbfill' },
        { text: myVersion }
    );

    new Ext.Viewport({
        layout: 'border',
        items: [
            menuBar,
            TVShow.Mainpanel
        ]
    });

    addQuickSearch('quicksearch', storeTVShow, 'title');

    storegenre.proxy.conn.xbmcParams = {
        jsonrpc: '2.0',
        method: 'VideoLibrary.GetGenres',
        params: {
            type: 'tvshow'
        },
        id: 'XWMM'
    };
    storegenre.load();
    storeTVShow.load();
});
