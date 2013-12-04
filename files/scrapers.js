function xbmcJsonRPC(params) {
    var inputUrl = '/jsonrpc';
    var myjson = '';
    Ext.Ajax.request({
        url: inputUrl,
        params : params,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        async: false,
        success: function (t){
            myjson = Ext.util.JSON.decode(t.responseText);
            },
        failure: function(t){},
            timeout: 2000
    });
    return myjson.result;
}

function getAddonList(myDir) {
    for (var i=0; i<myDir.files.length; i++) {
        if (myDir.files[i].label.match("metadata") == "metadata") {
            //var mytest = '{\"jsonrpc\": \"2.0\", \"method\": \"Files.GetDirectory\", \"params\": {\"directory\": \"'+myDir.files[i].file+'"}, \"id\": 1}';
            //IsScraper('/vfs/'+myDir.directories[i].file+'addon.xml')
                Ext.Ajax.request({
                    url: '/vfs/'+myDir.files[i].file+'addon.xml',
                    method: 'GET',
                    async: false,
                    success: function (t){
                        parseAddonXML(t.responseXML, myDir.files[i].file)
                    },
                    failure: function(t){},
                    timeout: 2000
                });
            }
        }
    //console.log(scraperList);
}

function parseAddonXML(string, path) {
        var xmlDoc = string;
        var addonCategory = xmlDoc.getElementsByTagName("extension")[0].attributes[0].value;
        var addonId = xmlDoc.getElementsByTagName("addon")[0].attributes[0].value;
        var addonLang = xmlDoc.getElementsByTagName("extension")[0].attributes[1].value;
        var addonImg = '../../../vfs/'+path+'icon.png';

        if (addonCategory.match("scraper.movies") == "scraper.movies") {
            scraperList.push([addonId,addonLang,addonImg,'movies']);
        }
        if (addonCategory.match("scraper.tvshows") == "scraper.tvshows") {
            scraperList.push([addonId,addonLang,addonImg,'tvshows']);
        }

    }

function parseScrapers() {
    var myParams = '{"jsonrpc": "2.0", "method": "Files.GetDirectory", "params": {"directory": "special://home/addons"}, "id": 1}';
    var myShares = xbmcJsonRPC(myParams);

    getAddonList(myShares);
}

var scraperList = [];


var combo = new Ext.form.ComboBox({
    triggerAction: 'all',
    mode: 'local',
    forceSelection: true,
    value: 'None',
    fieldLabel:"This directory contains",
    store:['None', 'movies', 'tvshows'],
    listeners: {
        'select': function (record){ScraperGrid.store.filter('content',record.value);}
    }
});

function scraperRecord() {
    this.xbmcContent ="";
    this.xbmcScraper = "";
    this.setEmpty = setEmpty;
    this.setValue = setValue;
}

function setValue(node) {
    this.xbmcContent = node.xbmcContent;
    this.xbmcScraper = node.xbmcScraper;
}

function setEmpty() {
    this.xbmcContent ="None";
    this.xbmcScraper = "";
}

function inheritContent(node) {
    var myXbmcContent = new scraperRecord();
    if (node.attributes.xbmcContent == "") {
        if (node.parentNode.isRoot)
            { myXbmcContent.setEmpty()}
        else
            { myXbmcContent.setValue(inheritContent(node.parentNode))}
    }
    else {
        myXbmcContent.setValue(node.attributes)
    }
    return myXbmcContent;
}

var scraperStore = new Ext.data.SimpleStore({
        id: 'scraperstore',
        fields: ['scraper', 'language','image', 'content'],
        data: scraperList,
        listeners: {
            load: function() {
                //parseScrapers();
            }
        }
    });

var ScraperGrid = new Ext.grid.GridPanel({
    height: 500,
    store : scraperStore,
    sm: new Ext.grid.RowSelectionModel({
        singleSelect: true,
        listeners: {
            rowselect: function(sm, rowIdx, r) {
                scraperImage.updateSrc(r);
            },
            beforeshow: function(sm, rowIdx, r) {
            }
        }
    }),
    viewConfig: {forceFit: true},
    columns: [
        {header: 'Scraper', dataIndex: 'scraper', width: 80},
        {header: 'lang', dataIndex: 'language', width:20}
    ]
});

var scraperImage = new Ext.Container ({
    id: 'scraperimage',
    cls: 'center-align',
    border: 0,
    width: 200,
    //height:150,
    autoEl: {tag: 'img', src: "../images/noscraper.png"},
    clearSrc: function(){
        this.el.dom.src = "../images/noscraper.png"
    },
    updateSrc :function(r){
        if (r == undefined)
        {
            this.el.dom.src = this.autoEl.src;
        }
        else
        {
            this.el.dom.src = "../images/scrapers/"+r.data.image;
        }
    }

});

var ScraperSettings = new Ext.FormPanel({
    region: 'center',
    frame:true,
    layout: 'form',
    height:400,
    //width: 400,
    //title: "<div align='center'>Select Nico</div>",
    items: [{
        layout: 'column',
        defaults: { border: true, frame: true},
        items:[{
            columnWidth:0.5,
            //layout: 'form',
            xtype: 'panel',
            title: 'XBMC scraper settings',
            items:[{
                xtype:"checkbox",
                fieldLabel:"Label",
                boxLabel:"Scan Recursivly",
                name:"scanRecursive"
            },{
                xtype:"checkbox",
                fieldLabel:"Label",
                boxLabel:"Use Folder Names",
                name:"useFolderNames"
            },{
                xtype:"checkbox",
                fieldLabel:"Label",
                boxLabel:"No Updates",
                name:"noUpdate"
            }]
        },{
            columnWidth:0.5,
            //layout: 'form',
            //xtype: 'form',
            title: 'Scraper specific settings',
            items:[{
                xtype:"textfield",
                fieldLabel:"Text",
                name:"textvalue"
            }]
        }]

    }]
});

var scraperDetailPanel = new Ext.FormPanel({
    region: 'north',
    frame:true,
    height:400,
    width: 400,
    title: '<div style="text-align:center">Scraper Info</div>',
        items: [{
        layout: 'column',
        items:[{
            columnWidth:0.60,
            layout: 'form',
            bodyStyle: 'padding:5px 10px 0',
            labelWidth: 100,
            defaults: { xtype:'textfield', labelWidth: 100,
                listeners:{'change' : function(){var DetailsFlag = true; Ext.getCmp('savebutton').enable()}}
            },
            items: [combo, scraperImage]
        },{
            columnWidth:0.40,
            layout: 'fit',
            height: 200,
            bodyStyle: 'padding:5px 10px 0',
            items: [ScraperGrid]
        }]
    }]
});
