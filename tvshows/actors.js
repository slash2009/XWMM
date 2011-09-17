
var actorRecord = Ext.data.Record.create([
   {name: 'name'}, {name: 'role'}
]);

var ActorcolModel = new Ext.grid.ColumnModel([
		{header: "Actor", dataIndex: 'name'},
		{header: "Role", dataIndex: 'role'}
]);

var storeActor = new Ext.ux.XbmcStore({
	sortInfo: {field: 'name', direction: "ASC"},
	reader: new Ext.data.JsonReader({
		root:'tvshowdetails.cast'	       
		}, actorRecord)
});

var actorGrid = new Ext.grid.GridPanel({
			id: 'actorgrid',
			cm: ActorcolModel,
			title: 'Cast',
			enableDragDrop: false,
			stripeRows: true,
			viewconfig: {forceFit: true},
			store: storeActor
}); 
