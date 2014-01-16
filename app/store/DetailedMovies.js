Ext.define('XWMM.store.DetailedMovies', {
    extend: 'Ext.data.Store',

    requires: [
        'Ext.ux.data.proxy.XbmcHttp'
    ],

    storeId: 'detailedMoviesStore',
    model: 'XWMM.model.DetailedMovie',

    // Ugly hack... When passing params to store.load() it removes the params set in extraParams below, so we have a
    // copy of the field list here so we can easily add it everytime it's required for a store.load().
    fieldList: ['title', 'sorttitle', 'year', 'playcount', 'set',
        'genre', 'rating', 'runtime', 'plot', 'plotoutline', 'tagline', 'director', 'mpaa', 'studio',
        'trailer', 'thumbnail', 'fanart', 'streamdetails', 'writer', 'imdbnumber', 'country', 'file',
        'originaltitle'],

    proxy: {
        type: 'xbmchttp',
        url: '/jsonrpc',
        extraParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovieDetails',
            params: {
                // movieid: -1, // Set movieid when loading movie
                properties: ['title', 'sorttitle', 'year', 'playcount', 'set',
                    'genre', 'rating', 'runtime', 'plot', 'plotoutline', 'tagline', 'director', 'mpaa', 'studio',
                    'trailer', 'thumbnail', 'fanart', 'streamdetails', 'writer', 'imdbnumber', 'country', 'file',
                    'originaltitle']
            },
            id: 1
        },
        reader: {
            type: 'json',
            root: 'result.moviedetails'
        }
    }
});
