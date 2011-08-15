// -----------------------------------------
// movie.js
//------------------------------------------ 

Ext.ns('Movie');

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
			name: 'title',
			XBMCName: 'c00',
			allowBlank: false
		},{
			fieldLabel: 'Sort Title',
			name: 'sortTitle',
			XBMCName: 'c10'

		},{
			fieldLabel: 'Genres',
			name: 'genre',
			XBMCName: 'c14',
			id:'genreString',
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
			fieldLabel:'Description',
			height: 95
		},{
			xtype:'textarea',
			height: 34,
			name:'plotoutline',
			XBMCName: 'c02',
			fieldLabel:'Abstract'
		},{
			xtype:'textarea',
			name:'tagline',
			XBMCName: 'c03',
			fieldLabel:'Tag Line',
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
			name: 'trailer'
		},{
			xtype: 'button',
			text: 'View Trailer',
			handler: function(){
				if (Ext.getCmp('trailer').getValue() != '') {
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
		items: [AudioFlagsPanel]

	},{
		width : 255,
		items: [VideoFlagsPanel]
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
		{
			xtype: 'panel',
			region:'west',
			//margins:'5 5 5 5',
			split:true,
			width: 285,
			items: [{
                height: 100,
                split: true,
                collapsible: true,
				collapsed: true,
                title: 'Splitter above me',
                html: 'center south'
            },
			Moviegrid]
		},
			MoviedetailPanel
		]
		})
			
		Movie.Mainpanel.superclass.initComponent.call(this);
	},
	
	initEvents: function() {
		Movie.Mainpanel.superclass.initEvents.call(this);
		var currentMovie = Moviegrid.getSelectionModel();
		
		currentMovie.on('rowselect', this.onRowSelect, this);
		
		// add double-click event to cover object
		var element = MovieCover.getEl();
		element.on('dblclick', function(){ChangeImages(currentRecord)});
		
		var element2 = MovieFanart.getEl();
		element2.on('dblclick', function(){ChangeImages(currentRecord)});
	},

	onRowSelect: function(sm, rowIdx, r) {

		selectedMovie = r.data.movieid;
		currentRecord = r;
		
		storeActor.xbmcParams = '{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovieDetails", \"params\": {\"movieid\": '+ selectedMovie+', "fields": ["cast"]},"id": 1}';
		storeActor.loadXbmc();
		
		updateAllForms(r);
		storegenre.selectFromString(r.data.genre);

		Ext.getCmp('filedetailPanel').getForm().loadRecord(r);	
		
	}
});
Ext.reg('Mainpanel', Movie.Mainpanel);
