/*
 * Copyright 2013 Zernable.
 * Copyright 2013 uNiversal.
 * Copyright 2013 nwtn.
 * Copyright 2013, 2014 Andrew Fyfe.
 *
 * This file is part of Web interface Media Manager (WIMM) for kodi.
 *
 * WIMM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * WIMM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with WIMM.  If not, see <http://www.gnu.org/licenses/>.
 */

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

// Name space for kodi objects

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
    refreshMe: function() {
        this.el.dom.src =  this.el.dom.src + '?dc=' + new Date().getTime();
    },
    // set source image
    updateSrc: function(imagePath) {
        if (imagePath === undefined) {
            this.el.dom.src = Ext.BLANK_IMAGE_URL;
        }
        else {
            this.el.dom.src = imagePath;
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
    autoEl: {tag: 'img', src: '../resources/images/stars/0.png'},
    updateSrc: function(r) {
        var value = 0;
        if (r.data.rating !== undefined) {
          value = Math.round(r.data.rating);
        }
        this.el.dom.src =  '../resources/images/stars/'+value+'.png';
    }
});
