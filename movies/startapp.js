
// -----------------------------------------
// startapp.js
// last modified : 30-04-2011
// Lunch the Movie interface
//------------------------------------------ 

Ext.onReady(function() {

	menuBar.add({
			xtype: 'tbspacer'
		},{
			xtype: 'tbbutton',
			text: 'Tools',
			width: 60,
			menu: [{
				text: 'Manage Genres',
				iconCls: 'silk-plugin',
				handler: function(){winGenre.show()}
			},{
				text: 'Manage Actors',
				iconCls: 'silk-plugin',
				handler: function(){window.location = '../actors/index.html'}
			},{
				text: 'Manage Movie Sets',
				iconCls: 'silk-plugin',
				handler: function(){winMovieSet.show()}			
			},{
				text: 'Export to HTML',
				menu: [{
					text: 'All Movies',
					iconCls: 'silk-grid',
					handler: function(){moviesHTML()}
				},{
					text: 'Watched Movies',
					iconCls: 'silk-grid',
					handler: function(){watchedMoviesHTML()}
				},{
					text: 'Unwatched Movies',
					iconCls: 'silk-grid',
					handler: function(){unwatchedMoviesHTML()}
					
				}]
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
			var item = Ext.getCmp('searchBox');
            if (item.getValue().length!=0) {
                item.setValue('');
                storeMovie.clearFilter();
            }
        }
    });
	
	menuBar.add({			
			xtype: 'tbfill'
		},{
			text: myVersion
    });
	
	var storesToLoad = [	];

	 startMyApp();
	
	function startMyApp() {
		var App = new Movie.Mainpanel({
			renderTo: Ext.getBody()	 
		});
		Ext.QuickTips.init();
		
		// begin search config
		var searchStore = new Ext.data.SimpleStore({
			fields: ['query'],
		data: []
		});
		
		var searchBox = new Ext.form.ComboBox({
			id: 'searchBox',
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
								if (re.test(r.data['title'])==false
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
	}
	
}); 