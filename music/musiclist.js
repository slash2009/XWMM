

// -----------------------------------------
// movie.js
// last modified : 21-02-2010
// 
//------------------------------------------ 

// ------------ Artist information -------------

var CheckArtist = new Ext.grid.CheckboxSelectionModel({
	dataIndex:'idArtist',
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
		{header: "#", dataIndex: 'artistid', hidden: true},
		{header: "Artist", dataIndex: 'artist'}
    ]);

var ArtistRecord = Ext.data.Record.create([
   {name: 'artistid'},
   {name: 'artist'},
   {name: 'label'}
]);

var ArtistStore = new Ext.ux.XbmcStore({
	sortInfo: {field: 'label', direction: "ASC"},
	xbmcParams: '{"jsonrpc": "2.0", "method": "AudioLibrary.GetArtists", "params": {},"id": 1}',
	reader: new Ext.data.JsonReader({
		root:'artists'	       
	}, ArtistRecord),
});
ArtistStore.loadXbmc();


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
	cls: 'center-align',
	border: 0,
	width: 160,
	height:160,
	autoEl: {tag: 'img', src: "../images/nobanner.png", qtip:'Double-click to change'}
});

var AlbumStars = new Ext.ux.XbmcStars ({
	id: 'albumrating',
	border: 0,
	width: 58,
	height:16
});


var albumDetailPanel = new Ext.FormPanel({
	region: 'north',
	width: 740,
	id: 'albumDetailPanel',
	trackResetOnLoad: true,
	title: "<div align='center'>Select Album</div>",
	defaults:{hideLabels:true, border:false},
	layout:'table',
	layoutConfig: {columns:3},
	defaults: {frame:true, width:270, height: 190},
	items:[{
		width:190,
		items: [AlbumStars, AlbumCover]
	},{
		layout: 'form',
		title: 'Album Info (from tags)',
		id: 'albumTags',
		labelWidth: 60,
		defaults: {	xtype:'textfield',
			width: 170,
			listeners:{'change' : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
		},
		items: [{
				fieldLabel: 'Title',
				name: 'title',
				id: 'albumtitlefield',
				allowBlank: false
			},{
				fieldLabel: 'Genres',
				name: 'genre',
				XBMCName: 'c14',
				id:'genreString',
				readOnly: true			
			},{
				xtype: 'combo',
				fieldLabel: 'Artist',
				store: ArtistStore,
				id: 'albumartistfield',
				displayField: 'artist',
				//mode: 'local',
				//typeAhead: true,
				name: 'artist'
			},{
				fieldLabel: 'Year',
				id: 'albumyearfield',
				name: 'year'
			},{
				fieldLabel: 'Rating',
				id: 'albumratingfield',
				name: 'rating'
			}]
	},{
        title:'Additional Info (from scraper)',
		layout: 'form',
		id: 'albumscraperdetails',
		labelWidth: 60,
		defaults: {	xtype:'textfield',
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
		height: 380,
		width: 280,
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
			fieldLabel: 'Type',
			id : 'scrapertype',
			name: 'type'
		},{
			fieldLabel: 'Label',
			id : 'scraperlabel',
			name: 'album_label'
		},{
			xtype:'textarea',
			height: 47,
			fieldLabel: 'Extra Genre',
			id : 'scraperextgenre',
			name: 'strExtraGenres'
		},{
			xtype:'textarea',
			height: 47,
			fieldLabel: 'Styles',
			id : 'scraperstyles',
			name: 'style'			
		},{
			xtype:'textarea',
			height: 47,
			fieldLabel: 'Moods',
			id : 'scrapermoods',
			name: 'mood'
		},{
			xtype:'textarea',
			height: 47,
			fieldLabel: 'Themes',
			id : 'scraperthemes',
			name: 'theme'			
		}]
                },{
                    title:'Review',
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
							updateGenreGrid(currentRecord.data.genres)
						}
					}],    
					width: 460,
                    colspan:2,
					items: [{
						xtype:'textarea',
						name:'description',
						id: 'albumreviewfield',
						listeners:{'change' : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}},
						height: 105,
						width: 430
					}]
                }]
            });
	


var AlbumRecord = Ext.data.Record.create([
   {name: 'albumid'}, {name: 'label'}, {name: 'artist'},
   {name: 'idArtist'}, {name: 'genre'},	{name: 'year'}, {name: 'thumbnail'}
]);
	
// ------------ Track information -------------

function convertTime(val) {

	var minutes = Math.floor(val / 60);
	var seconds = val - minutes*60;
	if (seconds < 10) seconds = '0'+seconds;
	if (minutes < 10) minutes = '0'+minutes;
	return minutes+':'+seconds;
}

function starRating(val) {
console.log(val);
	return "<img src=../images/small-stars/"+val+".gif>"
}

var SongcolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'songid', hidden: true},
		{header: "#", dataIndex: 'track', width: 30},
		{header: "Track", dataIndex: 'title', width: 300},
		{header: "Duration", dataIndex: 'duration', width: 70, renderer: convertTime},
		{header: "Artist", dataIndex: 'artist', width: 150}
		//{header: "Rating", dataIndex: 'rating', width: 100, renderer: starRating}
    ]);

var SongRecord = Ext.data.Record.create([
   {name: 'songid'}, {name: 'label'}, {name: 'track', type: 'int'},	{name: 'title'},
   {name: 'duration'}, {name: 'rating'}, {name: 'file'}, {name: 'playcount'}, {name: 'artist'}
]);

var SongStore = new Ext.ux.XbmcStore({
	sortInfo: {field: 'track', direction: "ASC"},
	xbmcParams: '{"jsonrpc": "2.0", "method": "AudioLibrary.GetSongs", "params": {},"id": 1}',
	reader: new Ext.data.JsonReader({
		root:'songs'	       
	}, SongRecord),
});

SongGrid = new Ext.grid.GridPanel({
	cm: SongcolModel,
	title: "<div align='center'>Album Tracks</div>",
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

	//Load existing genres
	GenreStore.loadXbmc();
	SongStore.load();
	//ArtistStore.loadXbmc();
	//AlbumStore.loadXbmc();
	//AlbumInfoStore.loadXbmc();
	
	menuBar.add({
			xtype: 'tbbutton',
			text: 'Tools',
			menu: [{
				text: 'Manage Genres',
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
            if (searchBox.getValue().length!=0) {
                searchBox.setValue('');
                storeMovie.clearFilter();
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
        if (this.getValue().length==0) {
                    storeMovie.clearFilter();
                } else {
                    var value = this.getValue().replace(/^\s+|\s+$/g, "");
                    if (value=="")
                        return;
                    storeMovie.filterBy(function(r) {
                        valueArr = value.split(/\ +/);
                        for (var i=0; i<valueArr.length; i++) {
                            re = new RegExp(Ext.escapeRe(valueArr[i]), "i");
                            if (re.test(r.data['Movietitle'])==false
                                //&& re.test(r.data['light'])==false) {
								) {
                                return false;
                            };
                        }
                        return true;
                    });
                }
    };
    var onQuickSearchBeforeQuery = function(e) {
        if (this.getValue().length==0) {
        } else {
            var value = this.getValue().replace(/^\s+|\s+$/g, "");
            if (value=="")
                return;
            searchStore.clearFilter();
            var vr_insert = true;
            searchStore.each(function(r) {
                if (r.data['query'].indexOf(value)==0) {
                    // backspace
                    vr_insert = false;
                    return false;
                } else if (value.indexOf(r.data['query'])==0) {
                    // forward typing
                    searchStore.remove(r);
                }
            });
            if (vr_insert==true) {
                searchStore.each(function(r) {
                    if (r.data['query']==value) {
                        vr_insert = false;
                    }
                });
            }
            if (vr_insert==true) {
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
    searchBox.on("beforequery", onQuickSearchBeforeQuery);
    searchBox.on("beforequery", onFilteringBeforeQuery);
    searchBox.on("select", onFilteringBeforeQuery); 
	// end search
	

	
}); 