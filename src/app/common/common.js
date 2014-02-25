/*
 * XBMC Web Media Manager
 * https://github.com/slash2009/XWMM
 *
 * Copyright (c) 2011-2014 slash2009
 * Copyright (c) 2014 Andrew Fyfe (fyfe)
 *
 * Licensed under the GNU GPLv2 license.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */


angular.module('common', ['ngResource'])

.factory('XbmcService', ['$q', '$rootScope', function($q, $rootScope) {
    'use strict';

    // We return this object to anything injecting our service
    var Service = {};

    // Keep all pending requests here until they get responses
    var callbacks = {};

    // Create a unique callback ID to map requests to responses
    var currentCallbackId = 0;

    // Create our WebSocket object with the address to the WebSocket
    var ws = new WebSocket("ws://localhost:9090/jsonrpc");

    ws.onmessage = function(message) {
        var messageObj = JSON.parse(message.data);
        console.log("Received data from websocket: ", messageObj);

        // If an object exists with callback_id in our callbacks object, resolve it
        if (callbacks.hasOwnProperty(messageObj.id)) {  // a response
            $rootScope.$apply(callbacks[messageObj.id].cb.resolve(messageObj.result));
            delete callbacks[messageObj.id];
        }
        else if (messageObj.hasOwnProperty('method')) {  // a notification
            $rootScope.$broadcast(messageObj.method, messageObj.params.data);
        }
    };

    function sendRequest(request) {
        var defer = $q.defer();
        var callbackId = getCallbackId();
        callbacks[callbackId] = {
            time: new Date(),
            cb: defer
        };
        request.id = callbackId;
        _sendRequest(request);
        return defer.promise;
    }

    function _sendRequest(request) {
        if (ws.readyState === 1) {
            console.log('Sending request', request);
            ws.send(JSON.stringify(request));
        }
        else {
            setTimeout(function(){_sendRequest(request);}, 500);
        }
    }

    // This creates a new callback ID for a request
    function getCallbackId() {
        currentCallbackId += 1;
        if (currentCallbackId > 10000) {
            currentCallbackId = 0;
        }
        return 'xwmm-'+currentCallbackId;
    }

    Service.sendCommand = function(method, params) {
      var request = {
                    jsonrpc: '2.0',
                    method: method,
                    params: params,
                    id: 'xwmm'
        };
      // Storing in a variable for clarity on what sendRequest returns
      var promise = sendRequest(request);
      return promise;
    };

    return Service;
}])

;
