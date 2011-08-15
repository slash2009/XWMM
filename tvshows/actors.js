
var actorRecord = Ext.data.Record.create([
   {name: 'strActor', mapping: 'field:nth(1)'},		
   {name: 'strRole', mapping: 'field:nth(2)'}
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
	url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT strActor, strRole FROM actorlinktvshow JOIN actors ON (actorlinktvshow.idActor = actors.idActor) where idShow =-1)' 
	
});


//grid for Genres
var actorGrid = new Ext.grid.GridPanel({
			id: 'actorgrid',
			cm: ActorcolModel,
			title: 'Cast',
			enableDragDrop: false,
			stripeRows: true,
			viewconfig: {forceFit: true},
			store: storeActor
}); 
