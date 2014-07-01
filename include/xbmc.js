function XBMCExecSql(inputUrl) {
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });
}

/**
 * Save the watched state back to XBMC.
 * @param {int} mediaId The media id.
 * @param {string} mediaType The type of media.
 * @param {boolean} watched Has it been watched?
 */
function setXBMCWatched(mediaId, mediaType, watched) {
    var playCount = watched ? 1 : 0;
    var rpcCmd = {
        jsonrpc: '2.0',
        method: '',
        params: {},
        id: 1
    };

    switch (mediaType) {
        case 'movie':
            rpcCmd.method = 'VideoLibrary.SetMovieDetails';
            rpcCmd.params = {movieid: mediaId, playcount: playCount};
            break;

        case 'episode':
            rpcCmd.method = 'VideoLibrary.SetEpisodeDetails';
            rpcCmd.params = {episodeid: mediaId, playcount: playCount};
            break;

        case 'musicvideo': // For future use, when music video support is added. :)
            rpcCmd.method = 'VideoLibrary.SetMusicVideoDetails';
            rpcCmd.params = {musicvideoid: mediaId, playcount: playCount};
            break;

        default:
            return;
    }

    var rpcCmdJSON = Ext.util.JSON.encode(rpcCmd);
    //console.debug('XWMM::updateXBMCSet rpcCmd: ' + rpcCmdJSON);
    xbmcJsonRPC(rpcCmdJSON);
}


function downloadNewXBMCFile(url,myFile) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=FileDownloadFromInternet('+url+'; '+myFile+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });

};

function AddXBMCNewGenre(record) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(INSERT INTO genre (strGenre) VALUES ("'+record.data.label+'"))';
    XBMCExecSql(inputUrl)
}

function removeXBMCGenre(record) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(DELETE FROM genre WHERE idGenre='+record.data.genreid+')';
    XBMCExecSql(inputUrl);
}

function checkXBMCGenreUsed(record) {
    var found = false;
    // check if genre is used in movie
    var inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT idMovie FROM genrelinkmovie where idGenre='+record.data.genreid+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){
                    if (TrimXbmcXml(t) != '') {found = true}
                },
        failure: function(t){},
        timeout: 2000
    });

    inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT idShow FROM genrelinktvshow where idGenre='+record.data.genreid+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){
                    if (TrimXbmcXml(t) != '') {found = true}
                },
        failure: function(t){},
        timeout: 2000
    });
    return found;

}

function updateXBMCGenreString(record) {

    //update strGenre in Genre Table
    var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(UPDATE genre SET strGenre = "'+record.data.label+'" WHERE idGenre='+record.data.genreid+')';
    XBMCExecSql(inputUrl)

    var oldValue = record.modified.label;
    var newValue = record.data.label;

    //get and update all movies with that genre
    inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT movie.idMovie, movie.c14 FROM movie inner join genrelinkmovie on (genrelinkmovie.idMovie = movie.idMovie) where genrelinkmovie.idGenre = '+record.data.genreid+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){
            var temp = TrimXmltofields(t);
            temp = temp.replace(/<record>/g, "");
            temp = temp.split("<field>"); // temp contain idMovie, genrestring, idMovie, genrestring, etc ...
            for (var i=1; i < temp.length; i=i+2) {
                var myString = temp[i+1].replace(oldValue, newValue);
                var myMovieId = temp[i];
            inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(UPDATE movie SET c14 = "'+myString+'" where idMovie = '+myMovieId+')';
            XBMCExecSql(inputUrl)
            }
        },
        failure: function(t){},
        timeout: 2000
    });

    //get and update all TVShows with that genre
    inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT tvshow.idShow, tvshow.c08 FROM tvshow inner join genrelinktvshow on (genrelinktvshow.idShow = tvshow.idShow) where genrelinktvshow.idGenre = '+record.data.genreid+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){
            var temp = TrimXmltofields(t);
            temp = temp.replace(/<record>/g, "");
            temp = temp.split("<field>"); // temp contain idMovie, genrestring, idMovie, genrestring, etc ...
            for (var i=1; i < temp.length; i=i+2) {
                var myString = temp[i+1].replace(oldValue, newValue);
                var myMovieId = temp[i];
            inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(UPDATE tvshow SET c08 = "'+myString+'" where idShow = '+myMovieId+')';
            XBMCExecSql(inputUrl)
            }
        },
        failure: function(t){},
        timeout: 2000
    });
}

 function getTagAttribute(xmlString, tag) {
    var temp ="";
    for (var i=0 ; i < xmlString.attributes.length; i++) {
        if (xmlString.attributes[i].nodeName == tag) {
            temp = xmlString.attributes[i].nodeValue
        }
    }
    return temp;
 }

function TrimXmltofields(t) {
    var temp = t.responseText.replace(/<html>/g, "");
    temp = temp.replace(/<\/html>/g, "");
    temp = temp.replace(/<recordset>/g, "");
    temp = temp.replace(/<\/record>/g, "");
    temp = temp.replace(/<\/recordset>/g, "");
    temp = temp.replace(/\n/g, '');
    temp = temp.replace(/<\/field>/g, "");

    return temp;
}

function TrimXbmcXml(t){
    var temp = TrimXmltofields(t);
    temp = temp.replace(/<field>/g, "");

    return temp;
}

/**
 * Convert a string list into an array.
 * @param {string} stringList The string to split.
 * @param {(string|RegExp)} sep The separator to split the list on.
 * @returns {Array} The string list as an array.
 */
function splitStringList(stringList, sep) {
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
            case 'Moviegenres':
            case 'TVGenre':
                continue; // We don't want to save genres here
                break;

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
            case 'theme':
            case 'mood':
            case 'style':
            case 'artist':
                params[f.name] = splitStringList(f.getValue(), /[,\/\|]+/); // Split list separated with , / or |.
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

    var rpcCmd = {jsonrpc: '2.0', id: 1};
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

    var rpcCmdJSON = Ext.util.JSON.encode(rpcCmd);
    //console.debug('XWMM::updateXBMCTables rpcCmd: ' + rpcCmdJSON);
    xbmcJsonRPC(rpcCmdJSON);
}


Ext.data.XBMCProxy = function(conn){
    Ext.data.XBMCProxy.superclass.constructor.call(this, conn);

    this.conn = conn;
    this.conn.url = null;
    this.useAjax = !conn || !conn.events;

    var actions = Ext.data.Api.actions;
    this.activeRequest = {};
    for (var verb in actions) {
        this.activeRequest[actions[verb]] = undefined
    }
};

Ext.extend(Ext.data.XBMCProxy, Ext.data.DataProxy, {

    getConnection : function() {
        return this.useAjax ? Ext.Ajax : this.conn;
    },

    setUrl : function(url, makePermanent) {
        this.conn.url = url;
        if (makePermanent === true) {
            this.url = url;
            this.api = null;
            Ext.data.Api.prepare(this);
        }
    },

    doRequest : function(action, rs, params, reader, cb, scope, arg) {
        var  o = {
            method: (this.api[action]) ? this.api[action]['method'] : undefined,
            request: {
                callback : cb,
                scope : scope,
                arg : arg
            },
            reader: reader,
            callback : this.createCallback(action, rs),
            scope: this
        };

        o.jsonData = Ext.util.JSON.encode(this.conn.xbmcParams);

        if (params.jsonData) {
            o.jsonData = params.jsonData;
        } else if (params.xmlData) {
            o.xmlData = params.xmlData;
        } else {
            o.params = params || {};
        }

        this.conn.url = this.buildUrl(action, rs);

        if(this.useAjax){

            Ext.applyIf(o, this.conn);

            this.activeRequest[action] = Ext.Ajax.request(o);
        }else{
            this.conn.request(o);
        }
        // request is sent, nullify the connection url in preparation for the next request
        this.conn.url = null;
    },

    createCallback : function(action, rs) {
        return function(o, success, response) {
            this.activeRequest[action] = undefined;
            if (!success) {
                if (action === Ext.data.Api.actions.read) {
                    // @deprecated: fire loadexception for backwards compat.
                    // TODO remove
                    this.fireEvent('loadexception', this, o, response);
                }
                this.fireEvent('exception', this, 'response', action, o, response);
                o.request.callback.call(o.request.scope, null, o.request.arg, false);
                return;
            }
            if (action === Ext.data.Api.actions.read) {
                this.onRead(action, o, response);
            } else {
                this.onWrite(action, o, response, rs);
            }
        };
    },

    onRead : function(action, o, response) {
        var result;
        try {
            result = o.reader.read(response);
        }catch(e){

            this.fireEvent('loadexception', this, o, response, e);

            this.fireEvent('exception', this, 'response', action, o, response, e);
            o.request.callback.call(o.request.scope, null, o.request.arg, false);
            return;
        }
        if (result.success === false) {

            this.fireEvent('loadexception', this, o, response);

            // Get DataReader read-back a response-object to pass along to exception event
            var res = o.reader.readResponse(action, response);
            this.fireEvent('exception', this, 'remote', action, o, res, null);
        }
        else {
            this.fireEvent('load', this, o, o.request.arg);
        }

        o.request.callback.call(o.request.scope, result, o.request.arg, result.success);
    },
    // inherit docs
    destroy: function(){
        if(!this.useAjax){
            this.conn.abort();
        }else if(this.activeRequest){
            var actions = Ext.data.Api.actions;
            for (var verb in actions) {
                if(this.activeRequest[actions[verb]]){
                    Ext.Ajax.abort(this.activeRequest[actions[verb]]);
                }
            }
        }
        Ext.data.HttpProxy.superclass.destroy.call(this);
    }
});
