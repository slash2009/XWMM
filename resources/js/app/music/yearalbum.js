var AlbumRecord = Ext.data.Record.create([
   {name: 'albumid'},
   {name: 'strAlbum', mapping:'label'},
   {name: 'strArtist', mapping:'artist'},
   {name: 'strGenre', mapping:'genre'},
   {name: 'year'}, {name: 'currentThumbnail', mapping:'thumbnail'}
]);

var AlbumStore = new Ext.data.GroupingStore({
    sortInfo: {field: 'strAlbum', direction: 'ASC'},
    autoLoad: true,
    groupField: 'year',
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams : {'jsonrpc': '2.0', 'method': 'AudioLibrary.GetAlbums', 'params': {'properties': ['genre', 'artist', 'year', 'thumbnail']},'id': 1}
    }),
    reader: new Ext.data.JsonReader({
        root:'result.albums'
        }, AlbumRecord)
});

var AlbumcolModel = new Ext.grid.ColumnModel([
        {header: '#', dataIndex: 'albumid', hidden: true},
        {header: 'Album', dataIndex: 'strAlbum', width: 150},
        {header: 'Artist', dataIndex: 'strArtist', hidden: true},
        {header: 'Genre', dataIndex: 'strGenre', hidden: true},
        {header: 'Year', dataIndex: 'year', hidden: true}
    ]);

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
