Ext.namespace('XWMM.Movies.data');

XWMM.Movies.data.WatchedConverter = function (v, r) {
    if (v == undefined || v.length == 0) {
        return false;
    }
    else {
        var playCount = parseInt(v);
        return (playCount > 0);
    }
};


XWMM.Movies.data.InSetConverter = function (v, r) {
    if (v == undefined || v.length == 0) {
        return false;
    }
    else {
        return true;
    }
};


XWMM.Movies.data.ArrayConverter = function (v, r) {
    if (v == undefined || v.length == 0) {
        return '';
    }
    else {
        return v.join(XWMM.settings.listSeparator);
    }
};


XWMM.Movies.data.FloatConverter = function (v, r) {
    if (v == undefined || v.length == 0) {
        return 0;
    }
    else {
        var playCount = parseInt(v);
        return parseFloat(v).toFixed(1);
    }
};


XWMM.Movies.data.RuntimeConverter = function (v, r) {
    if (v == undefined || v.length == 0) {
        return 0;
    }
    else {
        var playCount = parseInt(v);
        return Math.round(v / 60);
    }
};


XWMM.Movies.data.ArtworkConverter = function (v, r) {
    if (v == undefined || v.length == 0) {
        return '';
    }
    else {
        // subtract image:// from the start and / from the end.
        return v.substr(8, v.length - 9);
    }
};


XWMM.Movies.data.StreamDetailsConverter = function (v, r) {
    if (v == undefined || v.length == 0) {
        return false;
    }
    else {
        return v;
    }
};


XWMM.Movies.data.FileNameConverter = function (v, r) {
    if (v == undefined || v.length == 0) {
        return '';
    }
    else {
        var x;
        x = v.lastIndexOf('/');
        if (x >= 0) // Unix-based path
            return v.substr(x+1);
        x = v.lastIndexOf('\\');
        if (x >= 0) // Windows-based path
            return v.substr(x+1);
        return v; // just the filename
    }
};


XWMM.Movies.data.DirectoryConverter = function (v, r) {
    if (v == undefined || v.length == 0) {
        return '';
    }
    else {
        var x;
        x = v.lastIndexOf('/');
        if (x >= 0) // Unix-based path
            return v.substr(0, x+1);
        x = v.lastIndexOf('\\');
        if (x >= 0) // Windows-based path
            return v.substr(0, x+1);
        return v; // just the directory
    }
};


XWMM.Movies.data.MovieRecord = Ext.data.Record.create([
    // Basic Fields
    {name: 'movieid', type: 'int'},
    {name: 'title', type: 'string'},
    {name: 'sorttitle', type: 'string'},
    {name: 'year', type: 'int'},
    {name: 'watched', mapping: 'playcount', convert: XWMM.Movies.data.WatchedConverter},
    {name: 'inset', mapping: 'set', convert: XWMM.Movies.data.InSetConverter},

    // Extended Fields
    {name: 'genre', convert: XWMM.Movies.data.ArrayConverter},
    {name: 'rating', convert: XWMM.Movies.data.FloatConverter},
    {name: 'runtime', convert: XWMM.Movies.data.RuntimeConverter},
    {name: 'plot', type: 'string'},
    {name: 'plotoutline', type: 'string'},
    {name: 'tagline', type: 'string'},
    {name: 'director', convert: XWMM.Movies.data.ArrayConverter},
    {name: 'writer', convert: XWMM.Movies.data.ArrayConverter},
    {name: 'mpaa', type: 'string'},
    {name: 'studio', convert: XWMM.Movies.data.ArrayConverter},
    {name: 'trailer', type: 'string'},
    {name: 'streamdetails', convert: XWMM.Movies.data.StreamDetailsConverter},
    {name: 'originaltitle', type: 'string'},
    {name: 'set', type: 'string'},
    {name: 'imdbnumber', type: 'string'},
    {name: 'country', type: 'string', convert: XWMM.Movies.data.ArrayConverter},
    {name: 'file', convert: XWMM.Movies.data.FileNameConverter},
    {name: 'directory', mapping: 'file', convert: XWMM.Movies.data.DirectoryConverter},

    // Artwork
    {name: 'poster', mapping: 'thumbnail', convert: XWMM.Movies.data.ArtworkConverter},
    {name: 'fanart', convert: XWMM.Movies.data.ArtworkConverter}
]);


XWMM.Movies.data.MovieSetRecord = Ext.data.Record.create([
    {name: 'setid', type: 'int'},
    {name: 'title'}
]);


XWMM.Movies.data.MovieGridStore = new Ext.data.Store({
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovies',
            params: {
                properties: ['title', 'sorttitle', 'year', 'playcount', 'set'],
                sort: {
                    order: 'ascending',
                    ignorearticle: XWMM.settings.ignoreArticle,
                    method: 'sorttitle'
                }
            },
            id: 1
        }
    }),
    reader: new Ext.data.JsonReader({root: 'result.movies'}, XWMM.Movies.data.MovieRecord),
    listeners: {
        load: function(store, records, options) {
            //console.log(records);
        },
        exception: function(store, type, action, options, response, arg) {
            console.debug('Store Exception: [type: ' + type + '; action: ' + action + ']');
            console.debug(response);
        }
    }
});


XWMM.Movies.data.MovieDetailsStore = new Ext.data.Store({
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovieDetails',
            params: {
                properties: ['title', 'sorttitle', 'year', 'playcount', 'set',
                    'genre', 'rating', 'runtime', 'plot', 'plotoutline', 'tagline', 'director', 'mpaa', 'studio',
                    'trailer', 'thumbnail', 'fanart', 'streamdetails', 'writer', 'imdbnumber', 'country', 'file',
                    'originaltitle']
            },
            id: 1
        }
    }),
    reader: new Ext.data.JsonReader({root: 'result.movies', idProperty: 'movieid'}, XWMM.Movies.data.MovieRecord),
    listeners: {
        load: function(store, records, options) {
            //console.log(records);
        },
        exception: function(store, type, action, options, response, arg) {
            console.debug('Store Exception: [type: ' + type + '; action: ' + action + ']');
            console.debug(response);
        }
    }
});


XWMM.Movies.data.ContentRatingStore = new Ext.data.ArrayStore({
    fields: [{name: 'mpaa', type: 'string'},{name: 'rating', type: 'string'}],
    data: [
        // source: http://forum.xbmc.org/showthread.php?tid=165818
        // Australia
        ['Australia:G','Australia:G'], ['Australia:PG','Australia:PG'], ['Australia:M','Australia:M'],
        ['Australia:MA','Australia:MA'], ['Australia:R','Australia:R'], ['Australia:X','Australia:X'],
        // France
        ['France:U','France:U'], ['France:-10','France:-10'], ['France:-12','France:-12'], ['France:-16','France:-16'],
        ['France:-18','France:-18'],
        // Germany
        ['Germany:0','Germany:0'], ['Germany:6','Germany:6'], ['Germany:12','Germany:12'], ['Germany:16','Germany:16'],
        ['Germany:18','Germany:18'],
        // UK
        ['UK:U','UK:U'], ['UK:PG','UK:PG'], ['UK:12A','UK:12A'], ['UK:12','UK:12'], ['UK:15','UK:15'],
        ['UK:18','UK:18'],
        // USA
        ['USA:G','USA:G'], ['USA:PG','USA:PG'], ['USA:PG-13','USA:PG-13'], ['USA:R','USA:R'], ['USA:NC-17','USA:NC-17']
    ]
});


XWMM.Movies.data.MovieSetStore = new Ext.data.Store({
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovieSets',
            params: {
                properties: ['title'],
                sort: {
                    order: 'ascending',
                    ignorearticle: XWMM.settings.ignoreArticle,
                    method: 'title'
                }
            },
            id: 1
        }
    }),
    reader: new Ext.data.JsonReader({root: 'result.sets'}, XWMM.Movies.data.MovieSetRecord),
    listeners: {
        load: function(store, records, options) {
            //console.log(records);
        },
        exception: function(store, type, action, options, response, arg) {
            console.debug('Store Exception: [type: ' + type + '; action: ' + action + ']');
            console.debug(response);
        }
    }
});


XWMM.Movies.data.ActorStore = new Ext.data.Store({
    sortInfo: {field: 'name', direction: 'ASC'},
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovieDetails',
            params: {
                // movieid: set for movie cast.
                properties: ['cast']
            },
            id: 1
        }
    }),
    reader: new Ext.data.JsonReader({root: 'result.moviedetails.cast'}, XWMM.Shared.data.ActorRecord),
    listeners: {
        load: function(store, records, options) {
            //console.log(records);
        },
        exception: function(store, type, action, options, response, arg) {
            console.debug('Store Exception: [type: ' + type + '; action: ' + action + ']');
            console.debug(response);
        }
    }
});


XWMM.Movies.data.SaveChanges = function(recordId, dirtyFields) {
    console.log(dirtyFields);
    for (var fname in dirtyFields) {
        switch (fname) {
            // Special Fields
            case 'runtime':
                dirtyFields[fname] = parseInt(dirtyFields[fname]) * 60; // JSON uses runtime as # of seconds.
                break;

            // Float Fields
            case 'rating':
                dirtyFields[fname] = parseFloat(dirtyFields[fname]).toFixed(1);
                break;

            // Int Fields
            case 'year':
                dirtyFields[fname] = parseInt(dirtyFields[fname]);
                break;

            // List Fields
            case 'genre':
            case 'director':
            case 'writer':
            case 'studio':
            case 'country':
                dirtyFields[fname] = splitStringList(dirtyFields[fname], /[,\/\|]+/); // Split list separated with , / or |.
                break;

            //default:
            //    params[f.name] = f.getValue();
            //    break;
        }
    }

    if (Ext.util.JSON.encode(dirtyFields).length === 2) {
        // Nothing to update.
        return;
    }

    var rpcCmd = {jsonrpc: '2.0', id: 1};
    dirtyFields.movieid = recordId;
            rpcCmd.method = 'VideoLibrary.SetMovieDetails';
            rpcCmd.params = dirtyFields;

    var rpcCmdJSON = Ext.util.JSON.encode(rpcCmd);
    console.debug('XWMM::updateXBMCTables rpcCmd: ' + rpcCmdJSON);
    //xbmcJsonRPC(rpcCmdJSON);

    //console.log(dirtyFields);
};
