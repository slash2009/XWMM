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

Ext.define('Ext.ux.XbmcAjax', {
    extend: 'Ext.data.Connection',
    singleton: true,

    autoAbort : false,

    // UGLY HACK inbound...
    onComplete : function(request, xdrResult) {
        var me = this,
            options = request.options,
            result,
            success,
            response;

        try {
            result = me.parseStatus(request.xhr.status);
        } catch (e) {
            // in some browsers we can't access the status if the readyState is not 4, so the request has failed
            result = {
                success : false,
                isException : false
            };

        }
        success = me.isXdr ? xdrResult : result.success;

        if (success) {
            response = me.createResponse(request);
            /*
             * UGLY HACK: XBMC returns a success code even if an error occurs. This obviously breaks things here.
             * So we do a quick check if this is an error and handle it appropriately.
             * The rest of this code is a copy & paste from Ext.data.Connection#onComplete
             * TODO: Fix XBMC to return a suitable HTTP Status Code when errors occur.
             */
            var responseObj = Ext.JSON.decode(response.responseText, true);
            if ('error' in responseObj) {
                success = false;
                me.fireEvent('requestexception', me, response, options);
                Ext.callback(options.failure, options.scope, [response, options]);
            }
            else {
                me.fireEvent('requestcomplete', me, response, options);
                Ext.callback(options.success, options.scope, [response, options]);
            }
        } else {
            if (result.isException || request.aborted || request.timedout) {
                response = me.createException(request);
            } else {
                response = me.createResponse(request);
            }
            me.fireEvent('requestexception', me, response, options);
            Ext.callback(options.failure, options.scope, [response, options]);
        }
        Ext.callback(options.callback, options.scope, [options, success, response]);
        delete me.requests[request.id];
        return response;
    }
});
