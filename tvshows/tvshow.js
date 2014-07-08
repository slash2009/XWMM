Ext.ns('TVShow');

function bannerConvert(value, record) {
    return XWMM.util.convertArtworkURL(value.banner);
}

function fanartConvert(value, record) {
    return XWMM.util.convertArtworkURL(value.fanart);
}

var tvShowRecord = Ext.data.Record.create([
   { name: 'title' },
   { name: 'genre', convert: XWMM.util.convertArrayToList },
   { name: 'year' },
   { name: 'plot' },
   { name: 'fanart', mapping: 'art', convert: fanartConvert },
   { name: 'banner', mapping: 'art', convert: bannerConvert },
   { name: 'tvshowid' },
   { name: 'studio', convert: XWMM.util.convertArrayToList },
   { name: 'episode' },
   { name: 'rating' },
   { name: 'premiered' },
   { name: 'tvshowid' },
   { name: 'playcount' },
   { name: 'watchedepisodes' }
]);

var seasonRecord = Ext.data.Record.create([
   { name: 'season' },
   { name: 'label' },
   { name: 'thumbnail', convert: XWMM.util.convertArtworkURL }
]);

var episodeRecord = Ext.data.Record.create([
    { name: 'episode' },
    { name: 'title' },
    { name: 'rating', convert: XWMM.util.convertRating },
    { name: 'plot' },
    { name: 'firstaired' },
    { name: 'director', convert: XWMM.util.convertArrayToList },
    { name: 'writer', convert: XWMM.util.convertArrayToList },
    { name: 'streamdetails' },
    { name: 'playcount' },
    { name: 'episodeid' },
    { name: 'file', convert: XWMM.util.convertPathToFileName },
    { name: 'directory', mapping: 'file', convert: XWMM.util.convertPathToDirectory }
]);

var actorRecord = Ext.data.Record.create([
    { name: 'name' },
    { name: 'role' }
]);

var sortArticles = docCookies.getItem('sortArticles') === '1';
var storeTVShow = new Ext.data.Store({
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetTVShows',
            params: {
                properties: [
                    'title', 'genre', 'year', 'rating', 'plot', 'studio', 'mpaa', 'playcount',
                    'episode', 'imdbnumber', 'premiered', 'votes', 'lastplayed', 'art', 'file',
                    'watchedepisodes'
                ],
                sort: {
                    order: 'ascending',
                    ignorearticle: sortArticles,
                    method: 'title'
                }
            },
            id: 'XWMM'
        }
    }),
    reader: new Ext.data.JsonReader({ root: 'result.tvshows' }, tvShowRecord)
});

var storeSeason = new Ext.data.Store({
    sortInfo: { field: 'season', direction: 'ASC' },
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetSeasons',
            params: {
                tvshowid: -1, // Replaced by valid tv show id before loaded.
                properties: ['season', 'thumbnail']
            },
            id: 'XWMM'
        }
    }),
    reader: new Ext.data.JsonReader({ root: 'result.seasons' }, seasonRecord)
});

var storeEpisode = new Ext.data.Store({
    sortInfo: { field: 'episode', direction: 'ASC' },
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetEpisodes',
            params: {
                tvshowid: -1, // Replaced by valid tv show id before loaded.
                season: -1, // Replaced by valid season id before loaded.
                properties: [
                    'episode', 'title', 'rating', 'plot', 'firstaired',
                    'director', 'streamdetails', 'playcount', 'file', 'writer'
                ]
            },
            id: 'XWMM'
        }
    }),
    reader: new Ext.data.JsonReader({ root: 'result.episodes' }, episodeRecord)
});

var storeActor = new Ext.data.Store({
    sortInfo: { field: 'name', direction: 'ASC' },
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetTVShowDetails',
            params: {
                tvshowid: -1, // Replaced by valid tv show id before loaded.
                properties: ['cast']
            },
            id: 'XWMM'
        }
    }),
    reader: new Ext.data.JsonReader({ root: 'result.tvshowdetails.cast' }, actorRecord)
});

var tvshowStars = new Ext.ux.XbmcStars ({
    id: 'tvShowStarRating',
    border: 0,
    width: 96,
    height:27
});

var episodeStars = new Ext.ux.XbmcStars ({
    id: 'episodeStarRating',
    width: 72,
    height:20
});

var TVShowCover = new Ext.ux.XbmcImages({
    id: 'tvshowcover',
    cls: 'center-align',
    border: 0,
    width: 380,
    height:70,
    autoEl: {tag: 'img', src: '../images/nobanner.png'}
});

var SeasonCover = new Ext.ux.XbmcImages({
    id: 'seasoncover',
    cls: 'center-align',
    border: 0,
    width: 160,
    height:231,
    autoEl: {tag: 'img', src: '../images/nobanner.png'}
});

var tvShowDetailsPanel = new Ext.FormPanel({
    title: '<div align="center">Select a TV show</div>',
    id: 'tvShowdetailPanel',

    region: 'north',

    frame: true,
    trackResetOnLoad: true,

    items: [
        {
            layout: 'column',
            padding: 5,
            items: [
                {
                    columnWidth:0.70,
                    items: [TVShowCover]
                },
                {
                    columnWidth: 0.30,
                    items: [tvshowStars]
                }
            ]
        },
        {
            layout: 'column',
            labelWidth: 50,
            items:[
                {
                    columnWidth: 0.40,
                    layout: 'form',
                    labelWidth: 65,
                    defaults: {
                        xtype: 'textfield',
                        width: 200,
                        listeners: {
                            change: function() {
                                Ext.getCmp('savebutton').enable();
                            }
                        }
                    },

                    items: [
                        {
                            fieldLabel: 'Title',
                            name: 'title',
                            allowBlank: false
                        },
                        {
                            fieldLabel: 'Genres',
                            name: 'TVGenre',
                            readOnly: true,
                            id: 'genreString'
                        },
                        {
                            fieldLabel: 'First Aired',
                            name: 'premiered'
                        },
                        {
                            fieldLabel: 'Channel',
                            name: 'studio'
                        }
                    ]
                },
                {
                    xtype:'textarea',
                    fieldLabel: 'Description',
                    name: 'plot',

                    columnWidth: 0.60,
                    height: 100,

                    listeners: {
                        change: function() {
                            Ext.getCmp('savebutton').enable();
                        }
                    }
                }
            ]
        }
    ]
});

var episodeDetailsPanel = new Ext.FormPanel({
    id: 'episodedetailPanel',
    title: '<div align="center">Select an episode</div>',

    region: 'center',

    frame: true,

    layout: 'table',
    layoutConfig: { columns: 3 },
    items:[
        {
            layout: 'form',
            labelWidth: 65,
            defaults: {
                xtype: 'textfield',
                width: 200,
                listeners: {
                    change: function() {
                        Ext.getCmp('savebutton').enable();
                    }
                }
            },

            items: [
                {
                    fieldLabel: 'Title',
                    name: 'title',
                    allowBlank: false
                },
                {
                    fieldLabel: 'Aired',
                    name: 'firstaired'
                },
                {
                    fieldLabel: 'Director',
                    name: 'director'
                },
                {
                    fieldLabel: 'Writer',
                    name: 'writer'
                },
                {
                    fieldLabel: 'Rating',
                    name: 'rating'
                }
            ]
        },
        {
            layout: 'form',
            hideLabels: true,
            padding: 5,
            labelWidth: 65,

            items: [
                {
                    xtype: 'textarea',
                    fieldLabel: 'Description',
                    name: 'plot',
                    height: 125,
                    width: 400,
                    listeners: {
                        change: function() {
                            Ext.getCmp('savebutton').enable();
                        }
                    }
                },
            ]
        },
        {
            width: 170,
            rowspan: 2,
            items: [episodeStars, SeasonCover]
        },
        {
            colspan: 2,
            items: [videoFlagsPanel, audioFlagsPanel]
        }
    ]
});

var tvShowGrid = new Ext.grid.GridPanel({
    title: 'TV Shows',
    id: 'tvshowgrid',
    store: storeTVShow,

    flex: 1,
    frame: true,

    cm: new Ext.grid.ColumnModel([
        { header: 'Title', dataIndex: 'title', id: 'title' },
        { header: '&#160;', dataIndex: 'playcount', width: 30, tooltip: 'Watched',
          renderer: checkWatched }
    ]),
    autoExpandColumn: 'title',
    enableColumnResize: false,
    stripeRows: true,

    viewConfig: {
        headersDisabled: true
    },

    sm: new Ext.grid.RowSelectionModel({ singleSelect: true })
});

var seasonGrid = new Ext.grid.GridPanel({
    title: 'Seasons',
    id: 'seasonGrid',
    store: storeSeason,

    flex: 1,
    frame: true,

    cm: new Ext.grid.ColumnModel([
        { header: '#', dataIndex: 'season', hidden: true },
        { header: 'Season', dataIndex: 'label', id: 'title' }
    ]),
    autoExpandColumn: 'title',
    enableColumnResize: false,
    hideHeaders: true,
    stripeRows: true,

    viewConfig: {
        scrollOffset: 1,
        headersDisabled: true
    },

    sm: new Ext.grid.RowSelectionModel({ singleSelect: true })
});

var gridContextMenu = new Ext.menu.Menu({
    items: [
        { text: 'Mark as watched', handler: setWatched },
        { text: 'Mark as unwatched', handler: setUnwatched }
    ]
});

var episodeGrid = new Ext.grid.GridPanel({
    title: 'Episodes',
    id: 'episodeGird',
    store: storeEpisode,

    flex: 1,
    frame: true,

    cm: new Ext.grid.ColumnModel([
        { header: '#', dataIndex: 'episode', width: 30 },
        { header: 'Title', dataIndex: 'title', id: 'title' },
        { header: '&#160;', dataIndex: 'playcount', width: 30, tooltip: 'Watched',
          renderer: checkWatched }
    ]),
    autoExpandColumn: 'title',
    enableColumnResize: false,
    stripeRows: true,

    viewConfig: {
        scrollOffset: 1,
        headersDisabled: true
    },

    sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),
    listeners: {
        rowcontextmenu: function(grid, rowIndex, e) {
            e.stopEvent();
            gridContextMenu.showAt(e.getXY());
        }
    }
});

var actorGrid = new Ext.grid.GridPanel({
    title: 'Cast',
    id: 'actorgrid',
    store: storeActor,

    cm: new Ext.grid.ColumnModel([
        { header: 'Actor', dataIndex: 'name' },
        { header: 'Role', dataIndex: 'role' }
    ]),
    stripeRows: true,

    viewConfig: {
        scrollOffset: 1,
        headersDisabled: true
    }
});

var otherDetailsPanel = new Ext.FormPanel({
    title: 'Other Details',
    id: 'filedetailPanel',

    labelWidth: 55,
    padding: 5,
    defaults: {
        xtype: 'textfield',
        width: 150
    },
    items: [
        {
            fieldLabel: 'Name',
            name: 'file',
            readOnly: true,
        },
        {
            fieldLabel: 'Directory',
            name: 'directory',
            readOnly: true,
        }
    ]
});

TVShow.Mainpanel = new Ext.Panel({
    region: 'center',
    layout: 'border',

    frame: true,
    loadMask: true,

    items: [
        {
            xtype: 'panel',
            region: 'east',
            split: true,
            width: 225,
            items: [{
                layout: 'accordion',
                height: 500,
                items: [
                    Ext.getCmp('genresGrid'),
                    actorGrid,
                    otherDetailsPanel
                ]
            }]
        },
        menuBar,
        {
            xtype : 'panel',
            region: 'west',

            layout: 'hbox',
            layoutConfig: { align: 'stretch' },
            width: 450,

            items: [
                {
                    xtype : 'panel',
                    flex: 1,

                    layout: 'vbox',
                    layoutConfig: { align: 'stretch' },

                    items: [
                        tvShowGrid,
                        seasonGrid
                    ]
                },                
                episodeGrid
            ]
        },
        {
            xtype: 'panel',
            region: 'center',
            id: 'mainpanel',
            buttons: [
                {
                    disabled: true,
                    text: 'Save',
                    id: 'savebutton',
                    handler: function(e) {
                        updateXBMCAll();
                        this.disable();
                    }
                },
                {
                    text: 'Cancel',
                    handler: function() {
                        // TODO: should this reset the form?
                    }
                }
            ],
            items: [
                tvShowDetailsPanel,
                episodeDetailsPanel
            ]
        }
    ],

    initEvents: function() {
        Ext.getCmp('tvshowgrid').getSelectionModel().on('rowselect', this.tvShowSelect, this);
        Ext.getCmp('seasonGrid').getSelectionModel().on('rowselect', this.seasonSelect, this);
        Ext.getCmp('episodeGird').getSelectionModel().on('rowselect', this.episodeSelect, this);
    },

    tvShowSelect: function(sm, rowIdx, record) {
        var tvShowDetailsPanel = Ext.getCmp('tvShowdetailPanel');
        var episodeDetailsPanel = Ext.getCmp('episodedetailPanel');

        tvShowDetailsPanel.setTitle('<div align="center">' + record.data.title +
            ' (' + record.data.episode + ' Episodes / ' + record.data.watchedepisodes +
            ' Watched)</div>');
        episodeDetailsPanel.setTitle('<div align="center">Select an episode</div>');

        updateTVShowGenreGrid(record);
        loadTVShowDetails(record);
        clearEpisodeDetails();


        storeSeason.proxy.conn.xbmcParams.params.tvshowid = record.data.tvshowid;
        storeSeason.load();

        storeActor.proxy.conn.xbmcParams.params.tvshowid = record.data.tvshowid;
        storeActor.load();
    },

    seasonSelect: function(sm, rowIdx, record) {
        var selectedTvShow = Ext.getCmp('tvshowgrid').getSelectionModel().getSelected();
        var episodeDetailsPanel = Ext.getCmp('episodedetailPanel');
        var seasonCover = Ext.getCmp('seasoncover');

        episodeDetailsPanel.setTitle('<div align="center">Season ' + record.data.season +
            ' / Select an episode</div>');
        seasonCover.updateSrc(record.data.thumbnail);
        episodeDetailsPanel.getForm().reset();

        storeEpisode.proxy.conn.xbmcParams.params.tvshowid = selectedTvShow.data.tvshowid;
        storeEpisode.proxy.conn.xbmcParams.params.season = record.data.season;
        storeEpisode.load();
    },

    episodeSelect: function(sm, rowIdx, record) {
        var selectedSeason = Ext.getCmp('seasonGrid').getSelectionModel().getSelected();
        var episodeDetailsPanel = Ext.getCmp('episodedetailPanel');

        episodeDetailsPanel.setTitle('<div align="center">Season ' + selectedSeason.data.season +
            ' / Episode ' + record.data.episode + '</div>');
        updateEpisodeDetails(record);
    }
});
