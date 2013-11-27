/*!
 * Ext JS Library 3.0.0
 * Copyright(c) 2006-2009 Ext JS, LLC
 * licensing@extjs.com
 * http://www.extjs.com/license
 */

Ext.onReady(function() {

    Ext.MessageBox.show({
        title: 'Please wait',
        msg: 'Loading XBMC Video sources',
        progressText: 'Please wait ..',
        width:300,
        progress:true,
        closable:false,
        animEl: 'samplebutton'
    })

    storeFiles.load();
    storePath.load();

    var str = '';
    var myVideoShares = getShares('video');

    for (var i = 1; i < myVideoShares.length; i++) {
        var tempStr = myVideoShares[i].split(";");
        var progress = (i/myVideoShares.length)*100;
        Ext.MessageBox.updateProgress(progress/100,progress+'% done ... Now loading '+tempStr[0]);
        if (str == '') {str = '{text: "'+tempStr[0]+'", db: "0", path: "1", children :['+getDir(tempStr[1])+']}'}
            else {str = str +',{text: "'+tempStr[0]+'", db: "0", path: "1", children :['+getDir(tempStr[1])+']}'}
    }

    str = '['+str+']';

    var myjson = eval("("+str+")");

    Ext.MessageBox.hide();

    var treegrid = new Ext.ux.tree.TreeGrid({
        title: 'XBMC File browser',
        animate:true,
        //autoScroll:true,
        loader:new Ext.tree.TreeLoader(),
        root:new Ext.tree.AsyncTreeNode({
            expanded:true,
            leaf:false,
            text:'Movies',
            children:myjson
        }),
        width: 700,
        height: 800,
        renderTo:Ext.getBody(),
        enableDD: true,
        columns:[{
            header: 'Sources',
            dataIndex: 'text',
            width: 230
        },{
            header: 'Library',
            dataIndex: 'db',
            width: 50,
            tpl: new Ext.XTemplate('{db:this.formatColor}', {
                formatColor: function(v) {
                    if(v == -1) {return '<span style="color:red;"> No </span>'}
                    else {
                        if (v == 0) {return '<span style="color:green;"> - </span>'}
                            else {return '<span style="color:green;"> Yes </span>'}
                    }
                }
            })
        },{
            header: 'Path',
            dataIndex: 'path',
            width: 50,
            tpl: new Ext.XTemplate('{path:this.formatColor}', {
                formatColor: function(v) {
                    if(v == -1) {return '<span style="color:red;"> No </span>';}
                        else {return '<span style="color:green;"> Yes </span>';}
                }
            })
        }]
    });

    treegrid.on('contextmenu', treeContextHandler);

    function fixXbmcPath() {
        console.log('fix path');
    }

    function scanNewContent() {
        myNode = treegrid.getSelectionModel().getSelectedNode();

        console.log('scanned', myNode.attributes.data);
    }

    var contextMenu = new Ext.menu.Menu({
        items: [
        { text: 'Scan for new content', handler: scanNewContent },
        { text: 'Fix path in DB', handler: fixXbmcPath }
        ]
    });

    function treeContextHandler(node) {
        node.select();
        contextMenu.show(node.ui.getAnchor());
    }

});
