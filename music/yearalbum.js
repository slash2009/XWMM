
var AlbumStore = new Ext.data.GroupingStore({
	sortInfo: {field: 'strAlbum', direction: "ASC"},
	groupField: 'iYear',
	reader: new Ext.data.JsonXBMCReader({
 		root:'data'	       
       }, AlbumRecord),
	listeners: {
        beforeload: function(){ setXBMCResponseFormat() }
    },
	url: '/xbmcCmds/xbmcHttp?command=querymusicdatabase(select idAlbum, strAlbum, idArtist, idGenre, strArtist, strGenre, iYear, strThumb, iRating, strReview FROM albumview WHERE strAlbum <> "")' 
});

AlbumGrid = new Ext.grid.GridPanel({
	cm: AlbumcolModel,
	id: 'albumGrid',
	enableDragDrop: false,
	stripeRows: true,
	viewconfig: {forceFit: true},
	view: new Ext.grid.GroupingView({
		forceFit:true,
		width: 260,
		startCollapsed: true,
		showGroupName  : false,
		// enableGrouping: false,
		enableGroupingMenu : true,
		//enableNoGroups: false,
		groupTextTpl: '{text} '}),
	selModel: new Ext.grid.RowSelectionModel({singleSelect: true}),
	region: 'west',
	width: 260,
	split: true,
	store: AlbumStore
	
}); 