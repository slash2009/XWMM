/**
 * This file is part of XBMC Web Media Manager (XWMM)
 *
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

// Based on code from http://www.sencha.com/forum/showthread.php?124569-AjaxProxy-with-jsonData-option
Ext.define('Ext.ux.data.proxy.XbmcHttp', {
    extend: 'Ext.data.proxy.Ajax',
    alias: 'proxy.xbmchttp',

    constructor: function(config) {
        var me = this;

        Ext.applyIf(config || {}, {
            // TODO: Can these be cleanly mapped to XBMC's JSON-RPC API?
            filterParam: undefined,
            groupParam: undefined,
            idParam: undefined,
            limitParam: undefined,
            pageParam: undefined,
            sortParam: undefined,
            startParam: undefined,

            // Cache buster not required for XBMC.
            noCache: false
        });

        me.callParent([config]);
    },

    buildRequest: function(operation) {
        var request = this.callParent(arguments);

        // Send data packet as JSON.
        request.jsonData = request.params;
        request.params = {};

        return request;
    },

    getMethod: function(request) {
        return 'POST';
    },

    listeners: {
        exception: function(me, response, operation, eOpts) {
            var responseObj = JSON.parse(response.responseText);
            var error = responseObj.error;

            if (error == undefined) {
                console.error(response);

                // TODO: Make this more useful...
                Ext.MessageBox.show ({
                    title: 'Ooops',
                    msg: 'An unexpected error was encountered.',
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.ERROR
                });
            }
            else {
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
        }
    }
});
