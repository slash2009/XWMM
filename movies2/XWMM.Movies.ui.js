Ext.namespace('XWMM.Movies.ui');
Ext.namespace('XWMM.Movies.ui.state');

XWMM.Movies.ui.state.selectedMovie = false;


XWMM.Movies.ui.RatingStars = new Ext.ux.XbmcStars ({
    border: 0,
    width: 96,
    height:27
});


XWMM.Movies.ui.MoviePoster = new Ext.ux.XbmcImages ({
    cls: 'center-align',
    border: 0,
    width: 250,
    height: 375,
    autoEl: {tag: 'img', src: '../images/defaultMovieCover.jpg'} //, qtip:'Double-click to change'}
});


XWMM.Movies.ui.MovieFanart = new Ext.ux.XbmcImages ({
    border: 0,
    width: 295,
    height:165,
    autoEl: {tag: 'img', src: '../images/defaultMovieFanart.jpg'}//, qtip:'Double-click to change'}
});

SetImage = function(img, value) {
    img.getEl().dom.src = '../images/flags/' + value + '.png';
}


XWMM.Movies.ui.StreamDetailsPanel = new Ext.Panel({
    border: false,
    defaults: {xtype:'container', width: 64, height: 44},
    items: [
        {
            id: 'videocodec',
            width: 84,
            height: 31,
            autoEl: {tag: 'img', src: '../images/flags/default.png'},
            setImage: SetImage
        },
        {
            id: 'resolution',
            width: 84,
            height: 31,
            autoEl: {tag: 'img', src: '../images/flags/defaultscreen.png'},
            setImage: function(img, value) {
                var resolution = 'defaultscreen';

                if (value < 721)
                    resolution = '480';
                // 960x540
                else if (value < 961)
                    resolution = '540';
                // 1280x720
                else if (value < 1281)
                    resolution = '720';
                // 1920x1080
                else
                    resolution = '1080';

                SetImage(img,resolution);
            }
        },
        {
            id: 'aspect',
            width: 48,
            height: 31,
            autoEl: {tag: 'img', src: '../images/flags/default.png'},
            setImage: function(img, value) {
                var aspect = 'default';
                if (value < 1.4)
                    aspect = '1.33';
                else if (value < 1.7)
                    aspect = '1.66';
                else if (value < 1.8)
                    aspect = '1.78';
                else if (value < 1.9)
                    aspect = '1.85';
                else if (value < 2.3)
                    aspect = '2.20';
                else
                    aspect = '2.35';

                SetImage(img, aspect);
            }
        },
        {
            id: 'audiocodec',
            autoEl: {tag: 'img', src: '../images/flags/defaultsound.png'},
            setImage: SetImage
        },
        {
            id: 'audiochannels',
            autoEl: {tag: 'img', src: '../images/flags/0c.png'},
            setImage: SetImage
        }
    ]
});


XWMM.Movies.ui.MovieColModel = new Ext.grid.ColumnModel({
    defaults: {
        menuDisabled: true,
        resizable: false
    },
    columns: [
        {header: 'Title', dataIndex: 'title', id: 'colTitle'},
        {header: 'Sort Title', dataIndex: 'sorttitle', hidden: true},
        {header: 'Year', dataIndex: 'year', width: 40},
        {header: 'S', dataIndex: 'inset', width: 25, renderer: XWMM.Shared.ui.renderers.InSet, tooltip: 'In Set'},
        {header: 'W', dataIndex: 'watched', width: 25, renderer: XWMM.Shared.ui.renderers.Watched, tooltip: 'Watched'}
    ]
});


XWMM.Movies.ui.MovieGrid = new Ext.grid.GridPanel({
    region: 'west',
    //title: 'Movies',
    minWidth: 300,
    width: 300,
    split: true,
    margins: '5 5 5 0',
    viewconfig: {forceFit: true},
    enableDragDrop: false,
    stripeRows: true,
    loadMask: true,
    store: XWMM.Movies.data.MovieGridStore,
    cm: XWMM.Movies.ui.MovieColModel,
    autoExpandColumn: 'colTitle',
    sm: new Ext.grid.RowSelectionModel({
        singleSelect: true,
        listeners: {
            rowselect: function(sm, rowIndex, r) {
                XWMM.Movies.ui.state.selectedMovie = r;

                // Check if the detailed record has already been cached...
                var detailedRecordId = XWMM.Movies.data.MovieDetailsStore.findExact('movieid', r.data.movieid);
                if (detailedRecordId == -1) { // It hasn't, so load it.
                    var rpcCmd = XWMM.Movies.data.MovieDetailsStore.proxy.conn.xbmcParams;
                    rpcCmd.params.movieid = r.data.movieid;
                    var rpcCmdJSON = Ext.util.JSON.encode(rpcCmd);
                    var response = xbmcJsonRPC(rpcCmdJSON);
                    XWMM.Movies.data.MovieDetailsStore.loadData({result: {movies:[response.moviedetails]}}, true);
                    detailedRecordId = XWMM.Movies.data.MovieDetailsStore.findExact('movieid', r.data.movieid);
                }

                var detailedRecord = XWMM.Movies.data.MovieDetailsStore.getAt(detailedRecordId);
                XWMM.Movies.ui.MovieDetails.getForm().loadRecord(detailedRecord);
                XWMM.Movies.ui.OtherDetails.getForm().loadRecord(detailedRecord);
                XWMM.Movies.ui.RatingStars.updateSrc(detailedRecord);
                //Load genres
                XWMM.Shared.ui.GenreGrid.updateSelection(detailedRecord.data.genre);
                //Load cast
                XWMM.Movies.data.ActorStore.proxy.conn.xbmcParams.params.movieid = detailedRecord.data.movieid;
                XWMM.Movies.data.ActorStore.reload();
                // Load artwork
                XWMM.Movies.ui.MoviePoster.updateSrc(detailedRecord.data.poster);
                XWMM.Movies.ui.MovieFanart.updateSrc(detailedRecord.data.fanart);
                // Load stream details
                if (detailedRecord.data.streamdetails !== false) {
                    if (detailedRecord.data.streamdetails.video != null && detailedRecord.data.streamdetails.video[0]) {
                        Ext.getCmp('videocodec').setImage(Ext.getCmp('videocodec'), detailedRecord.data.streamdetails.video[0].codec);
                        Ext.getCmp('aspect').setImage(Ext.getCmp('aspect'), detailedRecord.data.streamdetails.video[0].aspect);
                        Ext.getCmp('resolution').setImage(Ext.getCmp('resolution'), detailedRecord.data.streamdetails.video[0].width);
                    }

                    if (detailedRecord.data.streamdetails.audio != null && detailedRecord.data.streamdetails.audio[0]) {
                        Ext.getCmp('audiochannels').setImage(Ext.getCmp('audiochannels'), detailedRecord.data.streamdetails.audio[0].channels + 'c');
                        Ext.getCmp('audiocodec').setImage(Ext.getCmp('audiocodec'), detailedRecord.data.streamdetails.audio[0].codec);
                    }
                }
            }
        }
    }),

    onCellContextMenu: function(grid, rowIndex, cellIndex, e) {
        console.log('onCellContextMenu');
        if(!this.menu){ // create context menu on first right click
            this.menu = new Ext.menu.Menu({
                id:'feeds-ctx',
                items: [{
                    id:'load',
                    iconCls:'load-icon',
                    text:'Load Feed',
                    scope: this,
                    handler:function(){
                        //this.ctxNode.select();
                    }
                },{
                    text:'Remove',
                    iconCls:'delete-icon',
                    scope: this,
                    handler:function(){
                        //this.ctxNode.ui.removeClass('x-node-ctx');
                        //this.removeFeed(this.ctxNode.attributes.url);
                        //this.ctxNode = null;
                    }
                },'-',{
                    iconCls:'add-feed',
                    text:'Add Feed',
                    //handler: this.showWindow,
                    scope: this
                }]
            });
            this.menu.on('hide', this.onContextHide, this);
        }
        //if(this.ctxNode){
        //    this.ctxNode.ui.removeClass('x-node-ctx');
         //   this.ctxNode = null;
        //}
        this.getView().focusRow(rowIndex);
        //if(node.isLeaf()){
        //    this.ctxNode = node;
        //    this.ctxNode.ui.addClass('x-node-ctx');
        //    this.menu.items.get('load').setDisabled(node.isSelected());
            this.menu.showAt(e.getXY());
        //}
    },
    onContextHide: function() {
        //if(this.ctxNode){
        //    this.ctxNode.ui.removeClass('x-node-ctx');
        //    this.ctxNode = null;
        //}
    },
    listeners: {
        cellcontextmenu: function(grid, rowIndex, cellIndex, e) {
            console.log('onCellContextMenu');
            grid.onCellContextMenu(grid, rowIndex, cellIndex, e);
            e.preventDefault();
        }
    }
});


XWMM.Movies.ui.MovieDetails = new Ext.FormPanel({
    region: 'center',
    title: 'Movie Details',
    margins: '5 0 5 0',
    trackResetOnLoad : true,
    autoScroll: true,
    buttons: [
        {
            id: 'XWMM.Movies.ui.MovieDetails.SaveBtn',
            text: 'Save',
            disabled: true,
            handler: function() {}
        },
        {
            text: 'Cancel',
            handler: function() {}
        }
    ],
    layout: 'table',
    layoutConfig: {columns:3},
    frame: true,
    defaults: {width:220, height: 120, labelWidth: 60, border: false},
    items:[
        // Row 1
        {
            width: 300,
            height : 90,
            layout: 'form',
            defaults: {
                xtype:'textfield',
                width: 220,
                listeners:{change: function(){Ext.getCmp('XWMM.Movies.ui.MovieDetails.SaveBtn').enable()}}
            },
            items: [
                {
                    fieldLabel: 'Title',
                    name: 'title',
                    allowBlank: false
                },
                {
                    fieldLabel: 'Sort Title',
                    name: 'sorttitle'
                },
                {
                    fieldLabel: 'Genres',
                    name: 'genre',
                    id: 'XWMM.Movies.ui.MovieDetails.GenresField',
                    readOnly: true
                }
            ]
        },
        {
            layout: 'form',
            width: 160,
            height: 90,
            defaults: {
                xtype: 'textfield',
                width: 80,
                listeners: {change: function(){Ext.getCmp('XWMM.Movies.ui.MovieDetails.SaveBtn').enable()}}
            },
            labelWidth: 60,
            items:[
                {
                    fieldLabel: 'Release',
                    name: 'year'
                },
                {
                    fieldLabel: 'Rating',
                    name: 'rating'
                },
                {
                    fieldLabel: 'Duration',
                    name: 'runtime'
                }
            ]
        },
        {
            rowspan: 2,
            width: 255,
            height: 410,
            items: [XWMM.Movies.ui.RatingStars, XWMM.Movies.ui.MoviePoster]
        },
        // Row 2
        {
            layout: 'form',
            width: 460,
            height: 320,
            colspan: 2,
            defaults: {
                xtype: 'textfield',
                width: 370,
                listeners: {change: function(){Ext.getCmp('XWMM.Movies.ui.MovieDetails.SaveBtn').enable()}}
            },
            items: [
                {
                    xtype:'textarea',
                    name:'plot',
                    fieldLabel:'Plot',
                    height: 95
                },
                {
                    xtype: 'textarea',
                    height: 34,
                    name: 'plotoutline',
                    fieldLabel: 'Outline'
                },
                {
                    name: 'tagline',
                    fieldLabel: 'Tagline'
                },
                {
                    fieldLabel: 'Director',
                    name: 'director',
                    emptyText: 'A / separated list of directors.'
                },
                {
                    fieldLabel: 'Writer',
                    name: 'writer',
                    emptyText: 'A / separated list of writers.'
                },
                {
                    xtype: 'combo',
                    fieldLabel: 'Content Rating',
                    name: 'contentrating',
                    store: XWMM.Movies.data.ContentRatingStore,
                    displayField: 'mpaa',
                    valueField: 'mpaa',
                    emptyText: '-- Unrated --',
                    typeAhead: true,
                    mode: 'local',
                    triggerAction: 'all'
                },
                {
                    fieldLabel: 'Studio',
                    name: 'studio',
                    emptyText: 'A / separated list of studios.'
                },
                {
                    // TODO: replace the drop down box image (on the right) with a more appropriate image.
                    xtype: 'trigger',
                    fieldLabel: 'Trailer',
                    name: 'trailer',
                    onTriggerClick: function (e) {
                        var value = this.getValue();
                        if (value.length > 0) { // detect plugin://plugin.video.youtube urls and handle them differently
                            window.open(value, 'XWMM.external');
                        }
                        else {
                            Ext.MessageBox.show({
                                title: 'Movie Trailer',
                                msg: 'You need to enter URL to a move trailer first.',
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.INFO
                            });
                        }
                        e.stopEvent();
                    }
                }
            ]
        },
        // Row 3
        {
            colspan: 2,
            width: 400,
            items: XWMM.Movies.ui.StreamDetailsPanel
        },
        {
            width : 255,
            items: XWMM.Movies.ui.MovieFanart
        }
    ]
});


XWMM.Movies.ui.ActorGrid = new Ext.grid.GridPanel({
    title: 'Cast', // TODO: why has this got a different style header??
    store: XWMM.Movies.data.ActorStore,
    cm: XWMM.Shared.ui.ActorColModel,
    enableDragDrop: false,
    stripeRows: true,
    viewconfig: {forceFit: true},
});


XWMM.Movies.ui.OtherDetails = new Ext.FormPanel({
    title: 'Other Details',
    trackResetOnLoad: true,
    labelWidth: 50,
    frame: true,
    //border: false,
    layout: 'form',
    defaults: {
        xtype:'textfield',
        minWidth: 180,
        width: 180,
        //grow: true,
        listeners:{change: function(){Ext.getCmp('XWMM.Movies.ui.MovieDetails.SaveBtn').enable()}}
    },
    items: [
        {
            fieldLabel: 'File',
            name: 'file',
            readOnly: true
        },
        {
            fieldLabel: 'Directory',
            name: 'directory',
            readOnly: true
        },
        {
            fieldLabel: 'Original',
            name: 'originaltitle'
        },
        {
            fieldLabel: 'Country',
            name: 'country',
            emptyText: 'A / separated list of countries.'
        },
        {
            // TODO: replace the drop down box image (on the right) with a more appropriate image.
            xtype: 'trigger',
            fieldLabel: 'IMDb ID',
            name: 'imdbnumber',
            //maskRe: /^[t]{2}[0-9]{7}$/,
            onTriggerClick: function (e) {
                var value = this.getValue();
                if (value.length > 0) { // TODO: attempt to check it's the right format /tt[0-9]{7}/
                    window.open('http://www.imdb.com/title/' + value + '/', 'XWMM.external');
                }
                else {
                    Ext.MessageBox.show({
                        title: 'The IMDb ID',
                        msg: 'You need to enter an IMDb movie ID before<br>you can visit the movie page on IMDb.com',
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.INFO
                    });
                }
                e.stopEvent();
            }
        },
        {
            xtype: 'combo',
            fieldLabel: 'Set',
            name: 'set',
            displayField: 'title',
            emptyText: '-- None --',
            store: XWMM.Movies.data.MovieSetStore,
            mode: 'local',
            triggerAction: 'all'
        }
    ]
});


XWMM.Movies.ui.MovieExtraDetails = new Ext.Panel({
    region: 'east',
    title: 'Extra Details',
    minWidth: 250,
    width: 250,
    split: true,
    margins: '5 0 5 5',
    layout: 'accordion',
    items: [
        XWMM.Shared.ui.GenreGrid,
        XWMM.Movies.ui.ActorGrid,
        XWMM.Movies.ui.OtherDetails
    ]
});


XWMM.Movies.ui.MainPanel = new Ext.Panel({
    region: 'center',
    //title: 'Movies',
    layout: 'border',
    items: [
        XWMM.Movies.ui.MovieGrid,
        XWMM.Movies.ui.MovieDetails,
        XWMM.Movies.ui.MovieExtraDetails
    ]
});


XWMM.Movies.ui.SetupMainMenuBar = function() {
    XWMM.Shared.ui.MainMenuBar.insertButton(7, [
        ' ',
        {
            text: 'Tools',
            menu: [
                {
                    text: 'Manage Genres',
                    iconCls: 'silk-plugin',
                    disabled: 'true',
                    handler: function() {/*winGenre.show()*/}
                },
                {
                    text: 'Manage Actors',
                    iconCls: 'silk-plugin',
                    disabled: 'true',
                    handler: function() {/*window.location = '../actors/index.html'*/}
                },
                {
                    text: 'Manage Movie Sets',
                    iconCls: 'silk-plugin',
                    handler: function() {/*winMovieSet.show()*/}
                },
                {
                    text: 'Toggle articles in title sort',
                    iconCls: 'silk-plugin',
                    handler: function() {
                        // extjs cookies aren't available until v3.4.0, so we'll use cookies.js
                        var sortArticles = docCookies.getItem('sortArticles');
                        if (sortArticles == '1') {
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
                    menu: [
                        {
                            text: 'All Movies',
                            iconCls: 'silk-grid',
                            handler: function() {/*moviesHTML()*/}
                        },
                        {
                            text: 'Watched Movies',
                            iconCls: 'silk-grid',
                            handler: function() {/*watchedMoviesHTML()*/}
                        },
                        {
                            text: 'Unwatched Movies',
                            iconCls: 'silk-grid',
                            handler: function() {/*unwatchedMoviesHTML()*/}
                        }
                    ]
                }
            ]
        },
        {
            xtype: 'trigger',
            id: 'quicksearch',
            width: 200,
            emptyText: 'Quick search...',
            disabled: true,
            //triggerClass: 'silk-delete' // TODO: make this look pretty
            onTriggerClick: function (e) {
                this.setValue('');
                e.stopEvent();
            }
        }
    ]);
};
