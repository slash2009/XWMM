
var AlbumcolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'albumid', hidden: true},
		{header: "Album", dataIndex: 'strAlbum', width: 150},
		{header: "Artist", dataIndex: 'strArtist', hidden: true},
		{header: "Genre", dataIndex: 'strGenre', hidden: true},
		{header: "Year", dataIndex: 'iYear', hidden: true}
]);

var AlbumRecord = Ext.data.Record.create([
   {name: 'albumid', mapping: 'field:nth(1)'},
   {name: 'strAlbum', mapping: 'field:nth(2)'},	
   {name: 'idArtist', mapping: 'field:nth(3)'},	
   {name: 'idGenre', mapping: 'field:nth(4)'},	
   {name: 'strArtist', mapping: 'field:nth(5)'},
   {name: 'strGenre', mapping: 'field:nth(6)'},	
   {name: 'iYear', mapping: 'field:nth(7)'},
   {name: 'currentThumbnail', mapping: 'field:nth(8)'},
   {name: 'iRating', mapping: 'field:nth(9)'},
   {name: 'strReview', mapping: 'field:nth(10)'}
]);

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