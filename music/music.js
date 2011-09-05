

// -----------------------------------------
// music.js
// last modified : 31-12-2009
// 
//------------------------------------------ 

Ext.ns('Audio');


//Main Panel
Audio.Mainpanel = Ext.extend(Ext.Panel, {
	initComponent: function() {
		Ext.applyIf(this, {
		frame: true,
		title: 'Audio List',
		width: 1250,
		height: 700,
		loadMask: true,
		layout: 'border',
		renderTo: Ext.getBody(),
		items: [
			menuBar,
			AlbumGrid,
		{
			xtype: 'panel',
			region: "center",
			defaults:{xtype:'container'},
			items: [
				albumDetailPanel,
				SongGrid
			]
		},{
			xtype: 'panel',
			region:'east',
			margins:'5 5 5 5',
			split:true,
			width: 200,
			items: [{
				layout:'accordion',
				height: 500,
				items:[Genregrid, ArtistGrid]
			}]
		}]
		})
			
		Audio.Mainpanel.superclass.initComponent.call(this);
	},
	
	initEvents: function() {
		Audio.Mainpanel.superclass.initEvents.call(this);
		var currentAlbum = this.getComponent('albumGrid').getSelectionModel();
		
		currentAlbum.on('rowselect', this.onRowSelect, this);
		
		//add double-click event to cover object
		var element = AlbumCover.getEl();
		element.on('dblclick', function(){ChangeImages(currentRecord)});
	},

	onRowSelect: function(sm, rowIdx, r) {

		currentRecord = r;
		
		if (r.data.details == undefined){
			GetAlbumDetails(r);
		}
		
		GenreStore.selectFromString(r.data.genre);
		albumDetailPanel.getForm().loadRecord(r);
		albumDetailPanel.setTitle("<div align='center'>"+r.data.title+"  /  "+r.data.artist+"</div>");
		
		Ext.getCmp('albumCover').el.dom.src = "../../vfs/"+r.data.thumbnail;
		
		AlbumStars.updateSrc(r);
		
		r.data.details = true;
		
		SongStore.xbmcParams = '{"jsonrpc": "2.0", "method": "AudioLibrary.GetSongs", "params": {"albumid": '+ r.data.albumid+', "fields": ["title", "track", "duration", "file", "rating", "artist"]},"id": 1}';
		SongStore.loadXbmc();

		Ext.getCmp('savebutton').disable();
	}
});
Ext.reg('Mainpanel', Audio.Mainpanel);
