function xbmcJsonRPC(params) {
    var inputUrl = '/jsonrpc'
    var myjson = '';
    Ext.Ajax.request({
        url: inputUrl,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        params : params,
        method: "POST",
        async: false,
        success: function (t){
            myjson = Ext.util.JSON.decode(t.responseText);
            },
        failure: function(t){},
            timeout: 5000
    });
    return myjson.result;
}

// Name space for XBMC objects

Ext.namespace('Ext.ux');

/**
  * Ext.ux.XbmcImages Extension Class
  * @author slash
  * @version 1.0
  * @class Ext.ux.XbmcImages
  * @extends Ext.Container
  * @constructor
  */

Ext.ux.XbmcImages = function(config) {
    Ext.ux.XbmcImages.superclass.constructor.call(this, config)
};

Ext.extend(Ext.ux.XbmcImages, Ext.Container, {
    // refresh image
    refreshMe : function(){
        this.el.dom.src =  this.el.dom.src + '?dc=' + new Date().getTime()
    },
    // set source image
    updateSrc :function(imagePath){
        if (imagePath) {
            this.el.dom.src = "/image/"+imagePath
        }
    }
});

/**
  * Ext.ux.XbmcStars Extension Class
  * @author slash
  * @version 1.0
  * @class Ext.ux.XbmcStars
  * @extends Ext.Container
  * @constructor
  */

Ext.ux.XbmcStars = function(config) {
    Ext.ux.XbmcStars.superclass.constructor.call(this, config)
};

Ext.extend(Ext.ux.XbmcStars, Ext.Container, {
    border: 0,
    autoEl: {tag: 'img', src: "../images/stars/0.png"},
    updateSrc :function(r){
        var value = Math.round(r.data.rating);
        this.el.dom.src =  '../images/stars/'+value+'.png'
    }
});
