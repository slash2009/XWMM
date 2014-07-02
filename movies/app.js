// -----------------------------------------
// startapp.js
//------------------------------------------

Ext.onReady(function() {

    menuBar.add({
            xtype: 'tbspacer'
        },{
            xtype: 'tbbutton',
            text: 'Tools',
            width: 60,
            menu: [{
                text: 'Manage Genres',
                iconCls: 'silk-plugin',
                disabled: 'true',
                handler: function(){winGenre.show();}
            },{
                text: 'Manage Movie Sets',
                iconCls: 'silk-plugin',
                handler: function(){winMovieSet.show();}
            },{
                text: 'Toggle articles in title sort',
                iconCls: 'silk-plugin',
                handler: function(){
                    // extjs cookies aren't available until v3.4.0, so we'll use cookies.js
                    var sortArticles = docCookies.getItem('sortArticles');
                    if (sortArticles === '1') {
                        docCookies.removeItem('sortArticles');
                    } else {
                        docCookies.setItem('sortArticles', '1', 'Infinity');
                    }
                    window.location.reload();
                }
            },{
                text: 'Export to HTML',
                menu: [{
                    text: 'All Movies',
                    iconCls: 'silk-grid',
                    handler: function(){moviesHTML();}
                },{
                    text: 'Watched Movies',
                    iconCls: 'silk-grid',
                    handler: function(){watchedMoviesHTML();}
                },{
                    text: 'Unwatched Movies',
                    iconCls: 'silk-grid',
                    handler: function(){unwatchedMoviesHTML();}

                }]
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
                storeMovie.clearFilter();
            }
        }
    });

    menuBar.add({
            xtype: 'tbfill'
        },{
            text: myVersion
    });


    MovieSetStore.load();

    function startMyApp() {


        var App = new Movie.Mainpanel({
            renderTo: Ext.getBody()
        });

        storegenre.proxy.conn.xbmcParams = {'jsonrpc': '2.0', 'method': 'VideoLibrary.GetGenres', 'params': {'type': 'movie'},'id': 1};
        storeMovie.load();
        storegenre.load();

        Ext.QuickTips.init();

        addQuickSearch('quicksearch', storeMovie, 'Movietitle');
    }

    startMyApp();
});
