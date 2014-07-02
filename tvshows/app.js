Ext.onReady(function() {

    //Load existing genres

    //storegenre.load();
    //LoadAllshowsdetails();

    // customize menu
    menuBar.add({
            xtype: 'tbspacer'
        },{
            xtype: 'tbbutton',
            text: 'Tools',
            menu: [{
                text: 'Manage Genres',
                disabled: 'true',
                iconCls: 'silk-plugin',
                handler: function(){winGenre.show()}
            }]
        },{
            text: 'Quicksearch:',
            tooltip: 'Quickly search through the grid.'
        },{
            xtype: 'text',
            tag: 'input',
            id: 'quicksearch',
            size: 30,
            value: '',
            style: 'background: #F0F0F9;'
    });

    menuBar.add({
        text: 'X',
        tooltip: 'Clear quicksearch',
        handler: function() {
            var item = Ext.getCmp('searchBox');
            if (item.getValue().length!==0) {
                item.setValue('');
                storeTVShow.clearFilter();
            }
        }
    });

    menuBar.add({
            xtype: 'tbfill'
        },{
            text: myVersion
    });

    function startMyApp() {
        new Ext.Viewport({
            layout: 'border',
            items: [
                menuBar,
                TVShow.Mainpanel
            ]
        });

        storegenre.proxy.conn.xbmcParams = {'jsonrpc': '2.0', 'method': 'VideoLibrary.GetGenres', 'params': {'type': 'tvshow'},'id': 1};
        storeTVShow.load();
        storegenre.load();

        addQuickSearch('quicksearch', storeTVShow, 'title');
    }

    startMyApp();
});
