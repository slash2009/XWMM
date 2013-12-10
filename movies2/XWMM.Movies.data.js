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
    {name: 'contentrating', mapping: 'mpaa', type: 'string'},
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
                    ignorearticle: true,
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
    data: [['UK:U','UK:U'], ['UK:PG','UK:PG'], ['UK:12A','UK:12A'], ['UK:12','UK:12'], ['UK:15','UK:15'], ['UK:18','UK:18']]
});
