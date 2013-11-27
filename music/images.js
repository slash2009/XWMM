var coverTpl = new Ext.XTemplate(
    '<tpl for=".">',
    '<div class="thumb-wrap" id="{title}">',
    '<div class="musicthumb"><img src="{thumb}"></div>',
    '<span class="x-editable">{title}</span></div>',
    '</tpl>'
);

    window.loadingMask = new Ext.LoadMask(Ext.getBody(), {msg:"Downloading file, please wait..."});


function ChangeImages(record) {

    var CoverUrlList = record.data.MusicCoverUrl;
    // add current image here
    var storeCovers =  new Ext.data.ArrayStore({
            data: CoverUrlList,
            autoLoad: true,
            fields: ['thumb','url', 'title', 'currentCover']
    });

    function changeXBMCMusicCover() {
        loadingMask.show();
        var selNode = viewCovers.getSelectedRecords();
        var currentAlbum = AlbumGrid.getSelectionModel().getSelected();
        // selNode contains only one item
        downloadNewXBMCFile(selNode[0].data.url, currentAlbum.data.strThumb );
        //update Album Cover in form
        Ext.getCmp('albumCover').refreshMe;
        loadingMask.hide();

    }

    var viewCovers = new Ext.DataView({
        tpl: coverTpl,
        autoHeight:true,
        id: 'tabcovers',
        singleSelect: true,
        //width:435,
        frame:true,
        overClass:'x-view-over',
        itemSelector:'div.thumb-wrap',
        emptyText: 'No images to display',
        store: storeCovers,
        title: 'Covers',
        listeners: {
             'selectionchange': function () {
                var selNode = viewCovers.getSelectedRecords();
                if (selNode[0].data.title != "Current") {
                    Ext.getCmp('choosebutton').enable();
                }
                else { Ext.getCmp('choosebutton').disable()}

            }
         }
    })

    var imagePanel = new Ext.TabPanel({
            id:'images-view',
            bodyStyle: 'background-color:#777777',
            layoutOnTabChange: true,
            //width:435,
            activeTab:0,
            autoHeight:true,
            title:'Simple DataView',
            items: [viewCovers]
    })

    var winImages = new Ext.Window({
        layout:'fit',
        margins: '5 5 5 0',
        width:600,
        height:400,
        title: 'Change Music Cover',
        closeAction:'hide',
        //plain: true,
        items: imagePanel,
        autoScroll: true,
        buttons: [{
            text: 'Choose',
            disabled: true,
            id: 'choosebutton',
            handler: function(){
                if (imagePanel.getActiveTab().id == 'tabcovers'){changeXBMCMusicCover()};
            }
        },{
            text: 'Done',
            handler: function(){
                winImages.hide();
            }
        }]
    });
    winImages.show()

}
