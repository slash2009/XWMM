// -----------------------------------------
// movie.js
// last modified : 21-02-2010
//
//------------------------------------------

// ------------ Artist information -------------

var CheckArtist = new Ext.grid.CheckboxSelectionModel({
    dataIndex:'artistid',
    alwaysSelectOnCheck: 'true',
    header: false,
    listeners: {
        selectionchange: function(sm) {
            movieGenreChange(sm);
            var bt = Ext.getCmp('savebutton');
            bt.enable();
        }
    }
});

var ArtistcolModel = new Ext.grid.ColumnModel([
        CheckArtist,
        {header: '#', dataIndex: 'artistid', hidden: true},
        {header: 'Artist', dataIndex: 'artist'}
    ]);

var ArtistRecord = Ext.data.Record.create([
   {name: 'artistid'},
   {name: 'artist'},
]);

var ArtistStore = new Ext.data.Store({
    autoLoad: true,
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams : {'jsonrpc': '2.0', 'method': 'AudioLibrary.GetArtists','id': 1}
    }),
    reader: new Ext.data.JsonReader({
        root: 'result.artists',
    }, ArtistRecord)
});

ArtistGrid = new Ext.grid.GridPanel({
    cm: ArtistcolModel,
    id: 'artistGrid',
    title: 'Extra Artists',
    enableDragDrop: false,
    stripeRows: true,
    viewconfig: {forceFit: true},
    selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
    region: 'center',
    width: 260,
    split: true,
    store: ArtistStore
});


// ------------ Album information -------------

var AlbumCover = new Ext.ux.XbmcImages ({
    id: 'albumCover',
    autoEl: {tag: 'img', src: Ext.BLANK_IMAGE_URL},
    border: 0,
    width: 160,
    height:160
});

var AlbumStars = new Ext.ux.XbmcStars ({
    id: 'albumrating',
    border: 0,
    width: 58,
    height:16
});

var standardInfo = new Ext.FormPanel({
        layout: 'form',
        title: 'Album Info (from tags)',
        frame:true, width:270, height: 190,
        trackResetOnLoad: true,
        bodyStyle:'padding:5px',
        labelWidth: 60,
        defaults: { xtype:'textfield',
            width: 170,
            listeners:{'change' : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable();}}
        },
        items: [{
                fieldLabel: 'Title',
                name: 'strAlbum',
                id: 'albumtitlefield',
                allowBlank: false,
                XBMCName: 'strAlbum'
            },{
                xtype: 'combo',
                fieldLabel: 'Genre',
                store: GenreStore,
                displayField: 'strGenre',
                id: 'albumgenrefield',
                valueField : 'strGenre',
                //mode: 'local',
                //typeAhead: true,
                name: 'genre',
                XBMCName: 'idGenre'
            },{
                xtype: 'combo',
                fieldLabel: 'artist',
                store: ArtistStore,
                id: 'albumartistfield',
                displayField: 'artist',
                valueField : 'artistid',
                //mode: 'local',
                //typeAhead: true,
                name: 'strArtist',
                XBMCName: 'idArtist'
            },{
                fieldLabel: 'Year',
                id: 'albumyearfield',
                name: 'year',
                XBMCName: 'iYear'

            }]
});

var extraInfo = new Ext.FormPanel({
        title:'Additional Info (from scraper)',
        layout: 'form',
        trackResetOnLoad : true,
        frame:true,
        height: 368,
        width: 280,
        id: 'albumscraperdetails',
        labelWidth: 60,
        defaults: { xtype:'textfield',
            width: 170,
            enableKeyEvents: true,
            //listeners:{'change' : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
            listeners : {
                    'keyup': function (txt, newValue, oldValue) {
                        Ext.getCmp('savebutton').enable();
                    },
                    buffer: 100
                }
        },
        rowspan: 2,
        items:[{
            fieldLabel: 'Genre',
            name: 'strGenreScraper',
            readOnly : true
        },{
            fieldLabel: 'Year',
            name: 'iYearScraper',
            //id: 'scraperyear',
            readOnly : true
        },{
            fieldLabel: 'Rating',
            id: 'albumratingfield',
            name: 'rating',
            XBMCName: 'iRating'
        },{
            fieldLabel: 'Type',
            id : 'scrapertype',
            name: 'type',
            XBMCName: 'strType'
        },{
            fieldLabel: 'Label',
            id : 'scraperlabel',
            name: 'albumlabel',
            XBMCName: 'strLabel'
        },{
            xtype:'textarea',
            height: 47,
            fieldLabel: 'Extra Genre',
            id : 'scraperextgenre',
            name: 'strExtraGenres',
            XBMCName: 'strExtraGenres'
        },{
            xtype:'textarea',
            height: 47,
            fieldLabel: 'Styles',
            id : 'scraperstyles',
            name: 'style',
            XBMCName: 'strStyles'
        },{
            xtype:'textarea',
            height: 47,
            fieldLabel: 'Moods',
            id : 'scrapermoods',
            name: 'mood',
            XBMCName: 'strMoods'
        },{
            xtype:'textarea',
            height: 47,
            fieldLabel: 'Themes',
            id : 'scraperthemes',
            name: 'theme',
            XBMCName: 'strThemes'
        }]
});

var albumDescription = new Ext.FormPanel({
    title:'Description',
    layout: 'form',
    trackResetOnLoad : true,
    labelWidth: 6,
    buttons: [{
        disabled: true,
        text:'Save',
        id: 'savebutton',
        handler: function(){
            updateMusicAlbum();
            //storeMovie.reload();
            this.disable();
        }
    },{
        text:'Cancel',
        handler: function(){
            updateGenreGrid(currentRecord.data.genres);
        }
    }],
    width: 460,
    colspan:2,
    items: [{
        xtype:'textarea',
        name:'description',
        id: 'albumreviewfield',
        XBMCName: 'strReview',
        listeners:{'change' : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable();}},
        height: 105,
        width: 430
    }]
});

var albumDetailPanel = new Ext.Panel({
    region: 'north',
    width: 740,
    id: 'albumDetailPanel',
    trackResetOnLoad: true,
    title: '<div align="center">Select Album</div>',
    defaults:{frame:true},
    layout:'table',
    layoutConfig: {columns:3},
    items:[{
            width:190,
            items: [AlbumStars, AlbumCover]
        },
        standardInfo,
        extraInfo,
        albumDescription
     ]
});

// ------------ Track information -------------

function convertTime(val) {

    var minutes = Math.floor(val / 60);
    var seconds = val - minutes*60;
    if (seconds < 10) seconds = '0'+seconds;
    if (minutes < 10) minutes = '0'+minutes;
    return minutes+':'+seconds;
}

function starRating(val) {
    return '<img src="../images/small-stars/' + val + '.gif" width="80" height="16" alt="' + val + ' Star(s)">';
}

var SongcolModel = new Ext.grid.ColumnModel([
        {header: '#', dataIndex: 'songid', hidden: true},
        {header: '#', dataIndex: 'track', width: 30},
        {header: 'Track', dataIndex: 'strTitle', width: 300},
        {header: 'Duration', dataIndex: 'duration', width: 70, renderer: convertTime},
        //{header: 'Rating', dataIndex: 'rating', width: 100, renderer: starRating} bug with JSON-RPC
    ]);

var SongRecord = Ext.data.Record.create([
   {name: 'songid'},
   {name: 'strTitle', mapping: 'label'},
   {name: 'track', type: 'int'},
   {name: 'duration'}
   //{name: 'iYear', mapping: 'field:nth(5)'},
   //{name: 'strFileName', mapping: 'field:nth(6)'},
   //{name: 'rating', mapping: 'field:nth(7)'},
   // {name: 'idAlbum', mapping: 'field:nth(8)'},
   // {name: 'strAlbum', mapping: 'field:nth(9)'},
   // {name: 'strPath', mapping: 'field:nth(10)'},
   // {name: 'idArtist', mapping: 'field:nth(11)'},
   // {name: 'strArtist', mapping: 'field:nth(12)'},
   // {name: 'idGenre', mapping: 'field:nth(13)'},
   // {name: 'strGenre', mapping: 'field:nth(14)'},
]);

var SongStore = new Ext.data.Store({
    sortInfo: {field: 'track', direction: 'ASC'},
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
    }),
    reader: new Ext.data.JsonReader({
        root: 'result.songs',
    }, SongRecord)
});


SongGrid = new Ext.grid.GridPanel({
    cm: SongcolModel,
    title: '<div align="center">Album Tracks</div>',
    region: 'center',
    id: 'Moviegrid',
    loadMask: true,
    frame: 'true',
    enableDragDrop: false,
    stripeRows: true,
    viewconfig: {forceFit: true},
    selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
    width: 740,
    height: 230,
    split: true,
    store: SongStore

});


Ext.onReady(function() {

    menuBar.add({
            xtype: 'tbbutton',
            text: 'Tools',
            menu: [{
                text: 'Manage Genres',
                disabled: 'true',
                iconCls: 'silk-plugin',
                handler: function(){winGenre.show();}
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
            if (searchBox.getValue().length!==0) {
                searchBox.setValue('');
                ArtistStore.clearFilter();
            }
        }
    });

    menuBar.add({
            xtype: 'tbfill'
        },{
            text: myVersion
    });

    //Start Application with Main Panel
    var App = new Audio.Mainpanel({
        renderTo: Ext.getBody()
    });

    ArtistStore.load();

    // We can retrieve a reference to the data store
    // via the StoreMgr by its storeId
    Ext.QuickTips.init();

    // begin search config
    var searchStore = new Ext.data.SimpleStore({
        fields: ['query'],
    data: []
    });
    var searchBox = new Ext.form.ComboBox({
        store: searchStore,
        displayField: 'query',
        typeAhead: false,
        mode: 'local',
        triggerAction: 'all',
        applyTo: 'quicksearch',
        hideTrigger: true
    });

    var searchRec = Ext.data.Record.create([
        {name: 'query', type: 'string'}
    ]);


    var onFilteringBeforeQuery = function(e) {
    //grid.getSelectionModel().clearSelections();
        if (this.getValue().length===0) {
                    ArtistStore.clearFilter();
                } else {
                    var strSearch = this.getValue().replace(/^\s+|\s+$/g, '');
                    if (strSearch==='')
                        return;
                    AlbumStore.filterBy(function(r, id) {
                            var regex = RegExp(strSearch, 'i');
                                    return regex.test(String(r.get('strAlbum'))) || regex.test(String(r.get('strArtist')));
                            });
                }
    };
    var onQuickSearchBeforeQuery = function(e) {
        if (this.getValue().length===0) {
        } else {
            var value = this.getValue().replace(/^\s+|\s+$/g, '');
            if (value==='')
                return;
            searchStore.clearFilter();
            var vr_insert = true;
            searchStore.each(function(r) {
                if (r.data.query.indexOf(value)===0) {
                    // backspace
                    vr_insert = false;
                    return false;
                } else if (value.indexOf(r.data.query)===0) {
                    // forward typing
                    searchStore.remove(r);
                }
            });
            if (vr_insert===true) {
                searchStore.each(function(r) {
                    if (r.data.query===value) {
                        vr_insert = false;
                    }
                });
            }
            if (vr_insert===true) {
                var vr = new searchRec({query: value});
                searchStore.insert(0, vr);
            }
            var ss_max = 4; // max 5 query history, starts counting from 0; 0==1,1==2,2==3,etc
            if (searchStore.getCount()>ss_max) {
                var ssc = searchStore.getCount();
                var overflow = searchStore.getRange(ssc-(ssc-ss_max), ssc);
                for (var i=0; i<overflow.length; i++) {
                    searchStore.remove(overflow[i]);
                }
            }
    }
    };
    searchBox.on('beforequery', onQuickSearchBeforeQuery);
    searchBox.on('beforequery', onFilteringBeforeQuery);
    searchBox.on('select', onFilteringBeforeQuery);
    // end search



});
