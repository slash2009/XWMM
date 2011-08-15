

// -----------------------------------------
// actor.js
// last modified : 13-06-2010
// 
//------------------------------------------ 




Ext.ns('Actors');


//Main Panel
Actors.Mainpanel = Ext.extend(Ext.Panel, {
	initComponent: function() {
		Ext.applyIf(this, {
		frame: true,
		title: 'Actor Management',
		width: 1250,
		height: 700,
		loadMask: true,
		layout: 'border',
		renderTo: Ext.getBody(),
		items: [menuBar,
			{
				region:'center',
                layout:'column',
                autoScroll:true,
                items:[{
                    columnWidth:.25,
                    bodyStyle:'padding:5px 0 5px 5px',
					//height: 500,
                    items:[ActorGrid]
                },{
                    columnWidth:.35, 
                    bodyStyle:'padding:5px 0 5px 5px',
                    items:[ActorMovieGrid, ActorPicture]
                },{
                    columnWidth:.40,
                    
                    bodyStyle:'padding:5px',
                    items:[ActorTvshowGrid,ActorEpisodeGrid]
				}]
			}]
		})
			
			
		Actors.Mainpanel.superclass.initComponent.call(this);
	},
	
	initEvents: function() {
		Actors.Mainpanel.superclass.initEvents.call(this);
		//var currentActor = this.getComponent('actorGrid').getSelectionModel();
		var currentActor = ActorGrid.getSelectionModel();
		
		currentActor.on('rowselect', this.onRowSelect, this);
		
		//add double-click event to cover object
		// var element = MovieCover.getEl();
		// element.on('dblclick', function(){ChangeImages(currentRecord)});
	},

	onRowSelect: function(sm, rowIdx, r) {
		currentRecord = r;
		
		// get movies for selected Actor 
		Ext.StoreMgr.get('actormoviestore').proxy.conn.url= "/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT actorlinkmovie.idMovie, c00, strRole, idActor from actorlinkmovie join movie on actorlinkmovie.idMovie = movie.idMovie where idActor="+r.data.idActor+")";
		Ext.StoreMgr.get('actormoviestore').load();
				
		// get TV Shows for selected Actor 
		Ext.StoreMgr.get('actortvshowstore').proxy.conn.url= "/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT actorlinktvshow.idShow, c00, strRole, idActor from actorlinktvshow join tvshow on actorlinktvshow.idShow = tvshow.idShow where idActor="+r.data.idActor+")";
		Ext.StoreMgr.get('actortvshowstore').load();
		
		// get Episodes for selected Actor 
		Ext.StoreMgr.get('actorepisodestore').proxy.conn.url= "/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT actorlinkepisode.idEpisode, episode.c00, strRole, idActor, tvshow.c00 from actorlinkepisode join episode on actorlinkepisode.idEpisode = episode.idEpisode join tvshowlinkepisode on episode.idEpisode = tvshowlinkepisode.idEpisode join tvshow on tvshowlinkepisode.idShow = tvshow.idShow where idActor="+r.data.idActor+")";
		Ext.StoreMgr.get('actorepisodestore').load();
		
		//change picture
		ActorPicture.updateSrc(r);
	}
});
Ext.reg('Mainpanel', Actors.Mainpanel);

Ext.onReady(function() {

	//Load existing genres

	menuBar.add({
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
                ActorStore.clearFilter();
            }
        }
    });
	
	menuBar.add({			
			xtype: 'tbfill'
		},{
			text: myVersion
    });
	
	//Start Application with Main Panel
	var App = new Actors.Mainpanel({
		renderTo: Ext.getBody()
	});
	
	ActorGrid.render();
	ActorStore.load();
	// We can retrieve a reference to the data store
	// via the StoreMgr by its storeId
	// Ext.QuickTips.init();
	
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
                    ActorStore.clearFilter();
                } else {
                    var value = this.getValue().replace(/^\s+|\s+$/g, "");
                    if (value=="")
                        return;
                    ActorStore.filterBy(function(r) {
                        valueArr = value.split(/\ +/);
                        for (var i=0; i<valueArr.length; i++) {
                            re = new RegExp(Ext.escapeRe(valueArr[i]), "i");
                            if (re.test(r.data['strActor'])==false
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
