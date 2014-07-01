// -----------------------------------------
// tvshow.js
// last modified : 27-08-2013
// modified by : MokuJinJin
//
//------------------------------------------

Ext.ns('TVShow');

var tvShowRecord = Ext.data.Record.create([
   {name: 'title'},
   {name: 'TVGenre', mapping: 'genre', convert: genreConvert},
   {name: 'year'},
   {name: 'plot'},
   {name: 'fanart', mapping: 'art', convert: fanartConvert},
   {name: 'banner', mapping: 'art', convert: bannerConvert},
   {name: 'tvshowid'},
   {name: 'studio'},
   {name: 'episode'},
   {name: 'rating'},
   {name: 'premiered'},
   {name: 'tvshowid'},
   {name: 'playcount'},
   {name: 'watchedepisodes'}
]);

var seasonRecord = Ext.data.Record.create([
   {name: 'season'},
   {name: 'label'},
   {name: 'thumbnail', convert: thumbConvert}
]);

var episodeRecord = Ext.data.Record.create([
    {name: 'episode'},
    {name: 'title'},
    {name: 'rating', convert: ratingConvert},
    {name: 'plot'},
    {name: 'firstaired'},
    {name: 'director'},
    {name: 'streamdetails'},
    {name: 'playcount'},
    {name: 'episodeid'},
    {name: 'file', convert: fileConvert},
    {name: 'directory', mapping: 'file', convert: directoryConvert}
]);

var tvshowStars = new Ext.ux.XbmcStars ({
    border: 0,
    width: 96,
    height:27
});

var episodeStars = new Ext.ux.XbmcStars ({
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

function genreConvert(v, record) {
    return record.genre.join(' / ');
}

function thumbConvert(v, record) {
    if (record.thumbnail === undefined){return '';}
    return record.thumbnail.replace(/image:\/\//g, '').slice(0,-1);
}

function bannerConvert(v, record) {
    if (v.banner === undefined){return '';}
    return v.banner.replace(/image:\/\//g, '').slice(0,-1);
}

function fanartConvert(v, record) {
    if (v.fanart === undefined){return '';}
    return v.fanart.replace(/image:\/\//g, '').slice(0,-1);
}


function ratingConvert(v, record) {
    return v.toFixed(1);
}

function fileConvert(v, record) {
    var x;
    x = v.lastIndexOf('/');
    if (x >= 0) // Unix-based path
        return v.substr(x+1);
    x = v.lastIndexOf('\\');
    if (x >= 0) // Windows-based path
        return v.substr(x+1);
    return v; // just the filename
}

function directoryConvert(v, record) {
    var x;
    x = v.lastIndexOf('/');
    if (x >= 0) // Unix-based path
        return v.substr(0, x+1);
    x = v.lastIndexOf('\\');
    if (x >= 0) // Windows-based path
        return v.substr(0, x+1);
    return v; // just the directory
}


var storeTvshow = new Ext.data.Store({
    sortInfo: {field: 'title', direction: 'ASC'},
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams : {'jsonrpc': '2.0', 'method': 'VideoLibrary.GetTVShows', 'params': {'properties': [ 'title', 'genre', 'year', 'rating', 'plot','studio', 'mpaa', 'playcount', 'episode', 'imdbnumber', 'premiered', 'votes', 'lastplayed', 'art', 'file', 'watchedepisodes' ]},'id': 1}
    }),
    reader: new Ext.data.JsonReader({
        root:'result.tvshows'
        }, tvShowRecord)
});


var storeSeason = new Ext.data.Store({
    sortInfo: {field: 'season', direction: 'ASC'},
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc'
    }),
    reader: new Ext.data.JsonReader({
        root:'result.seasons'
    }, seasonRecord)
});

var storeEpisode = new Ext.data.Store({
    sortInfo: {field: 'episode', direction: 'ASC'},
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc'
    }),
    reader: new Ext.data.JsonReader({
        root:'result.episodes'
    }, episodeRecord)
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
                    height: 100,
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
            items: [VideoFlagsPanel, AudioFlagsPanel]
        }
    ]
});

var tvShowGrid = new Ext.grid.GridPanel({
    title: 'TV Shows',
    id: 'tvshowgrid',
    store: storeTvshow,

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

var episodeGrid = new Ext.grid.GridPanel({
    title: 'Episodes',
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
                    Genregrid,
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
                        updateGenreGrid(currentRecord.data.genres);
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
        tvShowGrid.getSelectionModel().on('rowselect', this.tvShowSelect, this);
        seasonGrid.getSelectionModel().on('rowselect', this.seasonSelect, this);
        episodeGrid.getSelectionModel().on('rowselect', this.episodeSelect, this);
    },

    tvShowSelect: function(sm, rowIdx, record) {
        selectedTvShow = record;
        tvShowDetailsPanel.setTitle('<div align="center">' + record.data.title +
            ' (' + record.data.episode + ' Episodes / ' + record.data.watchedepisodes +
            ' Watched)</div>');
        episodeDetailsPanel.setTitle('<div align="center">Select an episode</div>');

        GetTvshowGenres(record);
        GettvShowDetails(record);

        storeSeason.proxy.conn.xbmcParams = {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetSeasons',
            params: {
                tvshowid: record.data.tvshowid,
                properties: ['season', 'thumbnail']
            },
            id: 1
        };
        storeSeason.load();

        storeActor.proxy.conn.xbmcParams = {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetTVshowDetails',
            params: {
                tvshowid: record.data.tvshowid,
                properties: ['cast']
            },
            id: 1
        };
        storeActor.load();
    },

    seasonSelect: function(sm, rowIdx, record) {
        selectedSeason = record;
        episodeDetailsPanel.setTitle('<div align="center">Season ' + record.data.season +
            ' / Select an episode</div>');
        SeasonCover.updateSrc(record.data.thumbnail);
        episodeDetailsPanel.getForm().reset();

        storeEpisode.proxy.conn.xbmcParams = {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetEpisodes',
            params: {
                tvshowid: selectedTvShow.data.tvshowid,
                season: record.data.season,
                properties: [
                    'episode', 'title', 'rating', 'plot', 'firstaired',
                    'director', 'streamdetails', 'playcount', 'file'
                ]
            },
            id: 1
        };
        storeEpisode.load();
    },

    episodeSelect: function(sm, rowIdx, record) {
        selectedEpisode = record;

        episodeDetailsPanel.setTitle('<div align="center">Season ' + record.data.season +
            ' / Episode ' + record.data.episode + '</div>');
        updateEpisodeForms(record);
    }
});
