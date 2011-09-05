

var AlbumcolModel = new Ext.grid.ColumnModel([
		{header: "#", dataIndex: 'albumid', hidden: true},
		{header: "Album", dataIndex: 'label', width: 150},
		{header: "Artist", dataIndex: 'artist', width: 150, hidden: true},
		{header: "Genre", dataIndex: 'genre', hidden: true},
		{header: "Year", dataIndex: 'year', hidden: true}
    ]);

var AlbumStore = new Ext.ux.XbmcGroupingStore({
	sortInfo: {field: 'artist', direction: "ASC"},
	groupField: 'artist',
	xbmcParams: '{"jsonrpc": "2.0", "method": "AudioLibrary.GetAlbums", "params": {"fields": ["title", "artist", "year", "thumbnail"]},"id": 1}',
	reader: new Ext.data.JsonReader({
		root:'albums'	       
	}, AlbumRecord),
});
AlbumStore.loadXbmc();

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