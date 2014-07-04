Ext.onReady(function() {
    menuBar.add(
        { xtype: 'tbspacer' },
        {
            xtype: 'tbbutton',
            text: 'Tools',
            menu: [
                {
                    text: 'Manage Genres',
                    iconCls: 'silk-plugin',
                    handler: function(){ Ext.getCmp('manageGenresWin').show(); }
                }
            ]
        },
        {
            xtype: 'tbtext',
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

    XWMM.video.setGenreMode('tvshow');
    storeTVShow.load();
});
