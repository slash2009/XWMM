/**
 * This file is part of XBMC Web Media Manager (XWMM)
 *
 * Copyright (c) 2013 Zernable
 * Copyright (c) 2013-2014 Andrew Fyfe (fyfe)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

Ext.define('XWMM.util.XBMC', {
    singleton: true,

    requires: [
        'Ext.ux.XbmcAjax'
    ],

    sendCmd: function(params, callback, scope) {
        var url = '/jsonrpc';
        var timeout = 3000;
        var responseObj = {};

        Ext.ux.XbmcAjax.request({
            url: url,
            params: {},
            jsonData: params,
            timeout: timeout,
            async: false,

            callback: callback || function(options, success, response) {},
            scope: scope || this,

            failure: this.onRequestFail,

            success: function(response, options) {
                try {
                    responseObj = Ext.JSON.decode(response.responseText);
                }
                catch(e) {
                    responseObj = response.responseText;
                }
            }
        });

        return ('result' in responseObj) ? responseObj.result : responseObj;
    },

    onRequestFail: function(response, options) {
        var responseObj = Ext.JSON.decode(response.responseText);

        if (responseObj !== undefined && 'error' in responseObj) {
            var error = responseObj.error;
            console.error(error);

            // TODO: Make this more useful...
            Ext.MessageBox.show ({
                title: 'Ooops',
                msg: 'An unexpected error was encountered.<br><br>'
                    + '<b>Code:</b> '+error.code+'<br>'
                    + '<b>Message:</b> '+error.message,
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.ERROR
            });
        }
        else {
            console.error(response);

            // TODO: Make this more useful...
            Ext.MessageBox.show ({
                title: 'Ooops',
                msg: 'An unexpected error was encountered.',
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.ERROR
            });
        }
    },

    splitStringList: function(stringList, sep) {
        var inList = stringList.split(sep);
        var outList = [];
        for (var i = 0, len = inList.length; i < len; i++) {
            listItem = inList[i].trim();
            if (listItem.length > 0) {
                outList.push(listItem);
            }
        }
        return outList;
    }

});
