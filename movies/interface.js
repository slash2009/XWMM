
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

var MoviecolModel = new Ext.grid.ColumnModel([
		{header: "Title", dataIndex: 'title', width: 215},
		{header: "Description", dataIndex: 'Moviedescr', hidden: true},
		{header: "Duration", dataIndex: 'Movieduration', hidden: true},
		{header: "Director", dataIndex: 'Moviedirector', hidden: true},
		{header: "Genre", dataIndex: 'genre', hidden: true},
		{header: "Release", dataIndex: 'year', hidden: true},
		{header: "", dataIndex: 'set', width: 25, hidden: false, renderer: checkSet},
		{header: "", dataIndex: 'playcount', width: 25, hidden: false, renderer: checkWatched}
]);

function checkWatched(val) {
 if (val > 0 ) 
	return '<img src=../images/icons/checked.png>'
}

function checkSet(val) {
 if (val != "" )
	return '<img src=../images/icons/set.png>'
}

// other details panel (accordion)
var fileDetailsPanel = new Ext.FormPanel({
	id: 'filedetailPanel',
	title: 'Other details',
	labelWidth:50,
	frame: true,
	bodyStyle:'padding:5px',
	defaults: {width: 140, xtype: 'textfield'},
	items: [{
		fieldLabel: 'Name',
		name: 'file',
		readOnly: true,
		XBMCName: 'c00'
	},{
		fieldLabel: 'Directory',
		name: 'strPath',
		readOnly: true,
		XBMCName: 'c05'
	},{
		xtype: 'combo',
		fieldLabel: 'Set',
		emptyText : '-- None --',
		store: MovieSetStore,
		displayField: 'set',
		id: 'moviesetcombo',
		mode: 'local',
		triggerAction: 'all',
		name: 'set',
		listeners: {
			change: function(combo, newValue, oldValue) {
				var currentMovie = Moviegrid.getSelectionModel().getSelected();
				if (newValue == "") {
					// remove existing record in setlinkmovie
					myId = "";
					var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(DELETE FROM setlinkmovie WHERE idMovie = "'+currentMovie.data.idMovie+'"))';
				}
				else {
					var myId = MovieSetStore.getAt(MovieSetStore.findExact('set', newValue)).data.idSet;
					if (newValue != oldValue) {
						if (oldValue == "") {
							// Add new record in setlinkmovie
							var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(INSERT INTO setlinkmovie (idSet, idMovie) VALUES ('+myId+','+currentMovie.data.idMovie+'))';				
						}
						else {
							// modify existing record in setlinkmovie
							var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(INSERT INTO setlinkmovie (idSet, idMovie) VALUES ("'+record.data.idMovie+'"))';
						}

					}
				}
				XBMCExecSql(inputUrl);
				currentMovie.data.idSet = myId;
				currentMovie.data.strSet = newValue;
				Moviegrid.getView().refresh();
			}
		}
	}]
})