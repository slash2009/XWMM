

Ext.onReady(function() {

	//Load existing genres

	//storegenre.load();
	//LoadAllshowsdetails();

	// customize menu
	menuBar.add({
			xtype: 'tbspacer'
		},{
			xtype: 'tbbutton',
			text: 'Tools',
			menu: [{
				text: 'Manage Genres',
				iconCls: 'silk-plugin',
				handler: function(){winGenre.show()}
			},{
				text: 'Manage Actors',
				iconCls: 'silk-plugin',
				handler: function(){window.location = '../actors/index.html'}
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
			xtype: 'tbfill'
		},{
			text: myVersion
    });
	
	setXBMCResponseFormat();

	var storesToLoad = [
	   // {store : 'storevideoflags', url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idFile, strVideoCodec, fVideoAspect, iVideoWidth, iVideoHeight from streamdetails where iStreamType=0)'},
	   // {store : 'storeaudioflags', url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idFile, strAudioCodec, iAudioChannels from streamdetails where iStreamType=1)'},
	   // {store : 'gridtvshowstore', url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select tvshow.idShow, tvshow.c00, tvshow.c08, counts.totalcount, counts.watchedcount, counts.totalcount=counts.watchedcount from tvshow join tvshowlinkpath on tvshow.idShow=tvshowlinkpath.idShow join path on path.idpath=tvshowlinkpath.idPath left outer join (select tvshow.idShow as idShow,count(1) as totalcount,count(files.playCount) as watchedcount from tvshow join tvshowlinkepisode on tvshow.idShow = tvshowlinkepisode.idShow JOIN episode on episode.idEpisode = tvshowlinkepisode.idEpisode join files on files.idFile = episode.idFile group by tvshow.idShow) counts on tvshow.idShow = counts.idShow)'},
	   //{store : 'storegenre', url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idGenre, strGenre FROM genre)'}
	];

	loadStartupStores = function(record, options, success){
		 var task = storesToLoad.shift();  //From the top
		 if(task){
			if(success !== false){
			  task.callback = arguments.callee   //let's do this again
			  var store = Ext.StoreMgr.lookup(task.store);
			  store ? store.load(task) : complain('bad store specified');
			} else { 
			  complain( );
			}
		 } else {startMyApp()}
	};
	
	loadStartupStores();
	storegenre.loadXbmc();
	
	function startMyApp() {
		//Start Application with Main Panel
		var App = new TVShow.Mainpanel({
			renderTo: Ext.getBody()
		});
		// We can retrieve a reference to the data store
		// via the StoreMgr by its storeId
		
		//Ext.StoreMgr.get('gridtvshowstore').load();
	}
}); 
