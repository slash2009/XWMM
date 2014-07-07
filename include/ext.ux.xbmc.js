Ext.data.DataProxy.on('exception', function(conn, type, action, options, response, arg) {
    if ('error' in response.responseJSON) {
        console.error('JSON-RPC request failed. %s',
            response.responseJSON.error.message,
            response.responseJSON.error,
            Ext.util.JSON.decode(options.jsonData));
    }
    else {
        console.error('JSON-RPC request failed.',
            response,
            Ext.util.JSON.decode(options.jsonData));
    }
});

function xbmcJsonRPC(params) {
    var result;

    if (typeof(params) === 'object') {
        params = Ext.util.JSON.encode(params);
    }

    Ext.Ajax.request({
        url: '/jsonrpc',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        params: params,
        method: 'POST',
        async: false,
        success: function (response, request, options) {
            if ('result' in response.responseJSON) {
                result = response.responseJSON.result;
            }
            else if ('error' in response.responseJSON) {
                console.error('JSON-RPC request failed. %s',
                    response.responseJSON.error.message,
                    response.responseJSON.error,
                    Ext.util.JSON.decode(params));
            }
        },
        failure: function(response, request, options) {
            console.error('JSON-RPC request failed.',
                response,
                Ext.util.JSON.decode(params));
        },
        timeout: 5000
    });

    return result;
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
    Ext.ux.XbmcImages.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.XbmcImages, Ext.Container, {
    // refresh image
    refreshMe : function(){
        this.el.dom.src =  this.el.dom.src + '?dc=' + new Date().getTime();
    },
    // set source image
    updateSrc :function(imagePath){
        if (imagePath) {
            this.el.dom.src = '/image/'+imagePath;
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
    Ext.ux.XbmcStars.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.XbmcStars, Ext.Container, {
    border: 0,
    autoEl: {tag: 'img', src: '../images/stars/0.png'},
    updateSrc: function(r) {
        var value = 0;
        if (r.data.rating !== undefined) {
          value = Math.round(r.data.rating);
        }
        this.el.dom.src =  '../images/stars/'+value+'.png';
    }
});
