/*
 * Copyright 2013 Zernable.
 * Copyright 2013 uNiversal.
 * Copyright 2013 nwtn.
 * Copyright 2013 slash2009.
 * Copyright 2013, 2014 Andrew Fyfe.
 * Copyright 2014 criticalfiction.
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

/**
 * Save the watched state back to XBMC.
 * @param {int} mediaId The media id.
 * @param {string} mediaType The type of media.
 * @param {boolean} watched Has it been watched?
 */
function setXBMCWatched(mediaId, mediaType, watched) {
    var playCount = (watched === true) ? 1 : 0;
    var rpcCmd = {
        jsonrpc: '2.0',
        method: '',
        params: {},
        id: 1
    };

    switch (mediaType) {
        case 'movie':
            rpcCmd.method = 'VideoLibrary.SetMovieDetails';
            rpcCmd.params = { movieid: mediaId, playcount: playCount };
            break;

        case 'episode':
            rpcCmd.method = 'VideoLibrary.SetEpisodeDetails';
            rpcCmd.params = { episodeid: mediaId, playcount: playCount };
            break;

        case 'musicvideo': // For future use, when music video support is added. :)
            rpcCmd.method = 'VideoLibrary.SetMusicVideoDetails';
            rpcCmd.params = {musicvideoid: mediaId, playcount: playCount};
            break;

        default:
            return;
    }

    //console.debug('WIMM::updateXBMCSet rpcCmd: ' + rpcCmd);
    xbmcJsonRPC(rpcCmd);
}

/**
 * Save the changes back to XBMC.
 * @param {Ext.form.BasicForm} form The form containing the record.
 * @param {string}recordType The type of record.
 * @param {int} recordId The id of the item record saved.
 */
function updateXBMCTables(form, recordType, recordId) {
    var itemsList = form.items.items;
    var params = {};

    for (var i = 0, len = itemsList.length; i < len; i++) {
        var f = itemsList[i];
        if (!f.isDirty()) {
            continue;
        }

        switch (f.name) {
            case 'runtime':
                params.runtime = parseInt(f.getValue()) * 60; // JSON uses runtime as # of seconds.
                break;

            case 'rating':
                params[f.name] = parseFloat(f.getValue());
                break;

            case 'year':
                params[f.name] = parseInt(f.getValue());
                break;

            case 'country':
            case 'studio':
            case 'director':
            case 'genre':
            case 'tag':
            case 'theme':
            case 'mood':
            case 'style':
            case 'artist':
                params[f.name] = WIMM.util.convertListToArray(f.getValue(), /[,\/\|;]+/); // Split list separated with , / or |.
                break;

            default:
                params[f.name] = f.getValue();
                break;
        }
    }

    if (Ext.util.JSON.encode(params).length === 2) {
        // Nothing to update.
        return;
    }

    var rpcCmd = { jsonrpc: '2.0', id: 1 };
    switch (recordType) {
        case 'episode':
            params.episodeid = recordId;
            rpcCmd.method = 'VideoLibrary.SetEpisodeDetails';
            rpcCmd.params = params;
            break;

        case 'tvshow':
            params.tvshowid = recordId;
            rpcCmd.method = 'VideoLibrary.SetTVShowDetails';
            rpcCmd.params = params;
            break;

        case 'movie':
            params.movieid = recordId;
            rpcCmd.method = 'VideoLibrary.SetMovieDetails';
            rpcCmd.params = params;
            break;

        case 'album':
        case 'albuminfo':
            params.albumid = recordId;
            rpcCmd.method = 'AudioLibrary.SetAlbumDetails';
            rpcCmd.params = params;
            break;

        default:
            return;
    }

    //console.debug('WIMM::updateXBMCTables rpcCmd: ' + rpcCmd);
    xbmcJsonRPC(rpcCmd);
}

Ext.data.XBMCProxy = function(conn) {
    // default connection settings
    this.conn = {
        url: '/jsonrpc',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        async: false,
        timeout: 5000
    };

    // apply store specific settings
    Ext.applyIf(this.conn, conn);

    Ext.data.XBMCProxy.superclass.constructor.call(this, conn);

    // XBMCProxy only supports read actions
    this.api = { read: '/jsonrpc' };
    this.activeRequest = undefined;
};

Ext.extend(Ext.data.XBMCProxy, Ext.data.DataProxy, {
    doRequest: function(action, rs, params, reader, cb, scope, arg) {
        var request = {
            request: {
                callback: cb,
                scope: scope,
                arg: arg
            },
            reader: reader,
            callback : this.createCallback(action, rs),
            scope: this
        };

        Ext.applyIf(request, this.conn);

        if (!('params' in request.jsonData)) {
            request.jsonData.params = {};
        }

        Ext.apply(request.jsonData.params, params);

        this.activeRequest = Ext.Ajax.request(request);
    },

    createCallback: function(action, rs) {
        return function(o, success, response) {
            this.activeRequest = undefined;

            if (!success) {
                this.fireEvent('exception', this, 'response', action, o, response);
                o.request.callback.call(o.request.scope, null, o.request.arg, false);
                return;
            }

            this.onRead(action, o, response);
        };
    },

    onRead: function(action, o, response) {
        var result = {
            records: [],
            success: true,
            totalRecords: 0
        };

        try {
            if ('result' in response.responseJSON) {
                if ('limits' in response.responseJSON.result && response.responseJSON.result.limits.total === 0) {
                    // Do nothing, no records found.
                }
                else {
                    result = o.reader.read(response);
                }
            }
            else {
                result.success = false;
            }
        }
        catch(e) {
            this.fireEvent('exception', this, 'response', action, o, response, e);
            o.request.callback.call(o.request.scope, null, o.request.arg, false);
            return;
        }

        if (result.success === true) {
            this.fireEvent('load', this, o, o.request.arg);
        }
        else {
            // Get DataReader read-back a response-object to pass along to exception event
            var res = o.reader.readResponse(action, response);
            this.fireEvent('exception', this, 'remote', action, o, res, null);
        }

        o.request.callback.call(o.request.scope, result, o.request.arg, result.success);
    },

    destroy: function() {
        if (this.activeRequest !== undefined) {
            Ext.Ajax.abort(this.activeRequest);
        }

        Ext.data.HttpProxy.superclass.destroy.call(this);
    }
});

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

/**
 * Add a quick search feature to a text box.
 * @param {string} searchBoxId The id of the text box to add the quick search feature to.
 * @param {Ext.data.Store} store The store to apply the filter to.
 * @param {string} filterField The field to apply the filter to.
 */
function addQuickSearch(searchBoxId, store, filterField) {
    var QueryRecord = Ext.data.Record.create([
        { name: 'query', type: 'string' }
    ]);

    var searchStore = new Ext.data.ArrayStore({
        fields: [
            { name: 'query', type: 'string' }
        ]
    });

    var beforeQuery = function(e) {
        var query = e.query.trim();
        if (query.length === 0) {
            return;
        }

        var insertQuery = true;
        searchStore.each(function(record) {
            if (record.data.query.indexOf(query) === 0) {
                // backspace
                insertQuery = false;
                return false;
            }
            else if (query.indexOf(record.data.query) === 0) {
                // forward typing
                searchStore.remove(record);
            }
            else if (query === record.data.query) {
                insertQuery = false;
            }
        });

        if (insertQuery === true) {
            var record = new QueryRecord({query: query});
            searchStore.insert(0, record);
        }

        var maxQueries = 5; // max 5 query history
        if (searchStore.getCount() > maxQueries) {
            var overflow = searchStore.getRange(maxQueries);
            for (var i = 0, len = overflow.length; i < len; i++) {
                searchStore.remove(overflow[i]);
            }
        }

    };

    var applyFilter = function(query) {
        query = query.trim();
        if (query.length === 0) {
            store.clearFilter();
        }
        else {
            store.filter(filterField, query, true, false);
        }
    };

    new Ext.form.ComboBox({
        id: 'searchBox',
        store: searchStore,
        displayField: 'query',
        typeAhead: false,
        mode: 'local',
        triggerAction: 'all',
        applyTo: searchBoxId,
        hideTrigger: true,
        listeners: {
            beforequery: function(e) {
                beforeQuery(e);
                applyFilter(e.query);
            },
            select: function(combo, record, index) {
                applyFilter(combo.getValue());
            }
        }
    });
}
