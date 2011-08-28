
// -----------------------------------------
// files.js
// last modified : 31-12-2009
// 
//------------------------------------------ 


Ext.onReady(function() {

	// customize menu
	//Ext.StoreMgr.get('scraperstore').load({data: scraperList});

	menuBar.add({			
			xtype: 'tbfill'
		},{
			text: myVersion
    });
	
	//setXBMCResponseFormat();
	parseScrapers();
	var str = '';
	var myjson = '';

	var storesToLoad = [
	   {store : 'storepath', url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idPath, strPath, strContent, scanRecursive, useFolderNames, noUpdate strScraper FROM path)' },
	   {store : 'storefiles', url: '/xbmcCmds/xbmcHttp?command=queryvideodatabase(select idFile, idPath, strFilename, playCount FROM files)' }
	];

	loadStartupStores = function(record, options, success){
		 var task = storesToLoad.shift();  //From the top
		 if(task){
			if(success !== false){
			  task.callback = arguments.callee   //let's do this again
			  var store = Ext.StoreMgr.lookup(task.store);
			  store ? store.load(task) : complain('bad store specified');
			} else { 
			  complain( );
			}
		 } else {		
			runtree();
		 }
	};
	loadStartupStores();
	
	scraperStore.loadData(scraperList);
	
function runtree() {
	

	var treegrid = new Ext.ux.tree.TreeGrid({
        title: 'XBMC File browser',
		region: 'west',
		mask: true,
        animate:true,
		listeners: {
			click: {fn:clickListener},
			dblclick: {fn: myExpend},
			beforeexpandnode: {fn: myExpend}
		},
		loader:new Ext.tree.TreeLoader(),
		root:new Ext.tree.AsyncTreeNode({
            expanded:true,
            leaf:false,
            text:'Movies'
        }),
		width: 700,
        height: 495,
		//renderTo:Ext.getBody(),
        //enableDD: true,
		columns:[{
            header: 'Sources',
            dataIndex: 'text',
            width: 400
		},{
			header: '',
			dataIndex: 'watched',
			width: 25,
			tpl: new Ext.XTemplate('{watched:this.checkWatched}', {
                checkWatched: function(v) {
                    if(v == 1) {return '<img src=../images/icons/checked.png>'}
						else {return '<span style="color:red;">  </span>'}
				}
            })
		},{
            header: 'File',
			dataIndex: 'isInDb',
            width: 50,
			tpl: new Ext.XTemplate('{isInDb:this.formatColor}', {
                formatColor: function(v) {
                    if(v == -1) {return '<img src=../images/icons/drop-no.gif>'}
					else {
						if (v == 0) {return '<span style="color:green;"> - </span>'}
							else {return '<img src=../images/icons/drop-yes.gif>'}
					}
				}
            })
		},{
            header: 'Path',
			dataIndex: 'xbmcIdPath',
            width: 50,
			tpl: new Ext.XTemplate('{xbmcIdPath:this.formatColor}', {
                formatColor: function(v) {
                    if(v == -1) {return '<img src=../images/icons/drop-no.gif>';}
						else {return '<img src=../images/icons/drop-yes.gif>';}
				}
            })
		},{
            header: 'Content',
			dataIndex: 'xbmcContent',
            width: 50
		},{
            header: 'Scraper',
			dataIndex: 'xbmcScraper',
            width: 120
		}]
	});
	
	treegrid.on('contextmenu', treeContextHandler);
	
	
	function fixXbmcPath() {
		myNode = treegrid.getSelectionModel().getSelectedNode();
		Ext.Msg.show({
			title:'Fix the inconsistant path in XBMC',
			msg:'This operation hase no effect for now ... sorry',
			buttons:Ext.Msg.YESNO,
			icon:Ext.Msg.QUESTION,
			fn:function(btn){
				if(btn=='no'){}
				if(btn=='yes'){XBMCFixPath(myNode)}
			}
		});
	};
	
	function scanNewContent() {
		myNode = treegrid.getSelectionModel().getSelectedNode();
		Ext.Msg.show({
			title:'Scan new content',
			msg:'This operation is not reversible. Would you like to continue?',
			buttons:Ext.Msg.YESNO,
			icon:Ext.Msg.QUESTION,
			fn:function(btn){
				if(btn=='no'){}
				if(btn=='yes'){XBMCScanContent('video',myNode.attributes.data)}
			}
		});
	};

	var contextMenu = new Ext.menu.Menu({
		items: [
			{ text: 'Fix path in DB', handler: fixXbmcPath },
			{ text: 'Scan for new content', handler: scanNewContent }		
		]
	});
	
	function treeContextHandler(node) {
		node.select();
		contextMenu.show(node.ui.getAnchor());
	};

//Main Panel
	var myPanel = new Ext.Panel({
		layout:"border",
		width:1250,
		height: 700,
		title:"XBMC file browser",
		renderTo: Ext.getBody(),
		items:[
			menuBar,
			treegrid,
		{
			xtype: 'panel',
			region: "center",
			layout: 'border',
			id: 'mainpanel',
			buttons: [{
				disabled: true,
				text:'Save'
			},{
				text:'Cancel'
			}],
			items: [
				scraperDetailPanel,
				ScraperSettings
					]
		}

		]
	});
	
	getStacks();

	
	
	var myVideoShares = getShares('video');
	
	
		for (var i = 1; i < myVideoShares.length; i++) {
			var tempStr = myVideoShares[i].split(";");	
			
			var myNode = new rootRecord(tempStr[0], tempStr[1], tempStr[1]);
			myNode.checkDirPath();
			treegrid.root.appendChild(new Ext.tree.TreeNode({text: tempStr[0], data: tempStr[1], leaf: false, children:[], expandable:true, scansub: false, isInDb: myNode.xbmcIdFile, xbmcIdPath: myNode.xbmcIdPath, xbmcContent: myNode.xbmcContent, xbmcScraper: myNode.xbmcScraper}));
		}
	
}
});