
var actorRecord = Ext.data.Record.create([
   {name: 'strActor', mapping: 'field:nth(1)'},		
   {name: 'strRole', mapping: 'field:nth(2)'},
]);


var ActorcolModel = new Ext.grid.ColumnModel([
		{header: "Actor", dataIndex: 'strActor'},
		{header: "Role", dataIndex: 'strRole'}
]);

var storeActor = new Ext.data.Store({
	sortInfo: {field: 'strActor', direction: "ASC"},
	reader: new Ext.data.JsonXBMCReader({
		root:'data'	       
		}, actorRecord),
	url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT strActor, strRole FROM actorlinkmovie JOIN actors ON (actorlinkmovie.idActor = actors.idActor) where idMovie =-1)' 
});


//grid for Actors
var actorGrid = new Ext.grid.GridPanel({
			id: 'actorgrid',
			cm: ActorcolModel,
			title: 'Cast',
			enableDragDrop: false,
			stripeRows: true,
			viewconfig: {forceFit: true},
			store: storeActor
}); 
