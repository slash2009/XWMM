// -----------------------------------------
// movie.js
//------------------------------------------ 

var MovieFanart = new Ext.ux.XbmcImages ({
	id: 'fanart',
	border: 0,
	width: 295,
	height:165,
	autoEl: {tag: 'img', src: "../images/defaultMovieFanart.jpg", qtip:'Double-click to change'}
});

var Stars = new Ext.ux.XbmcStars ({
	id: 'movierating',
	border: 0,
	width: 96,
	height:27
});

var MovieCover = new Ext.ux.XbmcImages ({
	id: 'cover',
	cls: 'center-align',
	border: 0,
	width: 250,
	height:375,
	autoEl: {tag: 'img', src: "../images/defaultMovieCover.jpg", qtip:'Double-click to change'}
});

Ext.ns('Movie');

var fileDetailsPanel = new Ext.FormPanel({
	id: 'filedetailPanel',
	title: 'Other details',
	trackResetOnLoad : true,
	labelWidth:50,
	frame: true,
	bodyStyle:'padding:5px',
	defaults: {width: 140, xtype: 'textfield', listeners:{change : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}},
	items: [{
		fieldLabel: 'Name',
		name: 'strFilename',
		readOnly: true,
		//XBMCName: 'c00'
	},{
		fieldLabel: 'Original',
		name: 'originaltitle',
		XBMCName: 'c16'
	},{
		fieldLabel: 'Country',
		name: 'country',
		XBMCName: 'c21'
	},{
		fieldLabel: 'imdb',
		name: 'imdbnumber',
		readOnly: true,
		XBMCName: 'c09'
	},{
		xtype: 'combo',
		fieldLabel: 'Set',
		emptyText : '-- None --',
		store: MovieSetStore,
		displayField: 'strSet',
		id: 'moviesetcombo',
		mode: 'local',
		triggerAction: 'all',
		name: 'strSet',
		listeners: {
			change: function(combo, newValue, oldValue) {
				if (newValue != oldValue)
					Ext.getCmp('savebutton').enable()
			}
		}
	}]
})

var MoviedetailPanel = new Ext.FormPanel({
	width: 600,
	region: 'center',
	id: 'MoviedetailPanel',
	trackResetOnLoad : true,
	title: "<div align='center'>Movie details</div>",
	defaults:{hideLabels:true, border:false},
	buttons: [{
		disabled: true,
		text:'Save',
		id: 'savebutton',
		handler: function(){	
			updateXBMCAll();
			this.disable();
		}
	},{
		text:'Cancel',
		handler: function(){
			updateGenreGrid(currentRecord.data.genres)
		}
	}],    
	
	layout:'table',
	layoutConfig: {columns:3},
	defaults: {frame:true, width:220, height: 120, labelWidth: 60},
	items:[{
		width: 300,
		height : 90,
		layout: 'form',
		defaults: {	xtype:'textfield',
			width: 220,
			listeners:{change : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
		},
		items: [{
			fieldLabel: 'Title',
			name: 'Movietitle',
			XBMCName: 'c00',
			allowBlank: false
		},{
			fieldLabel: 'Sort Title',
			name: 'sorttitle',
			XBMCName: 'c10'

		},{
			fieldLabel: 'Genres',
			name: 'Moviegenres',
			XBMCName: 'c14',
			id:'moviegenres',
			readOnly: true

		}]
	},{	
		layout: 'form',
		width:160,
		height: 90,
		defaults: {	xtype:'textfield',
			width: 80,
			listeners:{change : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
		},
		labelWidth: 60,
		items:[{
			fieldLabel: 'Release',
			XBMCName: 'c07',
			name: 'year'
		},{	
			fieldLabel: 'Rating',
			name: 'rating',
			XBMCName: 'c05'
		},{
			fieldLabel: 'Duration',
			XBMCName: 'c11',
			name: 'runtime'
		}]
	},{
		rowspan:2,
		width:255,
		height: 410,
		items: [Stars, MovieCover]
	},{
		layout : 'form',
		width: 460,
		height: 320,
        colspan:2,
		defaults: {	xtype:'textfield', 
			width: 370,
			listeners:{change : function(){DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
		},
		items: [{
			xtype:'textarea',
			name:'plot',
			XBMCName: 'c01',
			fieldLabel:'Plot',
			height: 95
		},{
			xtype:'textarea',
			height: 34,
			name:'plotoutline',
			XBMCName: 'c02',
			fieldLabel:'Outline'
		},{
			xtype:'textarea',
			name:'tagline',
			XBMCName: 'c03',
			fieldLabel:'Tagline',
			height: 34
		},{	
			fieldLabel: 'Director',
			XBMCName: 'c15',
			name: 'director'
		},{
			fieldLabel: 'Viewers',
			XBMCName: 'c12',
			name: 'mpaa'
		},{
			fieldLabel: 'Studio',
			XBMCName: 'c18',
			name: 'studio'
		},{	
			fieldLabel: 'Trailer',
			id: 'trailer',
			XBMCName: 'c19',
			name: 'MovieTrailer'
		},{
			xtype: 'button',
			text: 'View Trailer',
			handler: function(){
				if (Ext.getCmp('trailer').getValue() != '') {
				//var w = (window.open(urlstring, wname, wfeatures, false));
						window.open(Ext.getCmp('trailer').getValue(),'')
				}
			},
			width: 60
		}]
	},{
		frame : false,
		width: 300,
		height: 120,
		items: [MovieFanart]
	},{
		width: 160,
		//frame : false,
		items: [AudioFlagsPanel]
		// height : 200
	},{
		width : 255,
		//frame : false,
		items: [VideoFlagsPanel]
		// heigth :
	}]
})

//Main Panel
Movie.Mainpanel = Ext.extend(Ext.Panel, {
	initComponent: function() {
		Ext.applyIf(this, {
		frame: true,
		title: 'Movies List',
		width: 1250,
		height: 700,
		loadMask: true,
		layout: 'border',
		renderTo: Ext.getBody(),
		items: [{		
			xtype: 'panel',
			region:'east',
			//margins:'5 5 5 5',
			split:true,
			width: 225,
			items: [{
				layout:'accordion',
				height: 500,
				items:[
					Genregrid,
					actorGrid,
					fileDetailsPanel
				]
			}]	
		},
			menuBar,
			Moviegrid,
			MoviedetailPanel
		]
		})
			
		Movie.Mainpanel.superclass.initComponent.call(this);
	},
	
	initEvents: function() {
		Movie.Mainpanel.superclass.initEvents.call(this);
		var currentMovie = this.getComponent('Moviegrid').getSelectionModel();
		
		currentMovie.on('rowselect', this.onRowSelect, this);
		
		MovieCover.getEl().on('dblclick', function(){
		  ChangeImages(currentRecord);
		});
		
		var element2 = MovieFanart.getEl();
		element2.on('dblclick', function(){ChangeImages(currentRecord)});
	},

	onRowSelect: function(sm, rowIdx, r) {
		
		selectedMovie = r.data.idMovie;
		currentRecord = r;
		
		storeActor.xbmcParams = '{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovieDetails", "params": {"movieid": '+ selectedMovie+', "properties": ["cast"]},"id": 1}';
		storeActor.loadXbmc();
		
		if (r.data.details == undefined){
			GetMovieGenres(r);
			GetMovieDetails(r);
			Ext.getCmp('filedetailPanel').getForm().loadRecord(r);
		}
		else{ 
			updateGenreGrid(r.data.genres);
			updateAllForms(r)
		};
		
		
	}
});
Ext.reg('Mainpanel', Movie.Mainpanel);
