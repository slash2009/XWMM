Ext.define('XWMM.store.Movies', {
    extend: 'Ext.data.Store',

    requires: [
        'Ext.ux.data.proxy.XbmcHttp'
    ],

    storeId: 'moviesStore',
    model: 'XWMM.model.Movie',

    proxy: {
        type: 'xbmchttp',
        url: '/jsonrpc',
        extraParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovies',
            params: {
                // TODO: remove me, only here for testing.
                //limits: {start: 0, end: 20},

                properties: ['title', 'sorttitle', 'year', 'playcount', 'set'],
                sort: {order: 'ascending', ignorearticle: true, method: 'sorttitle'}
            },
            id: 1
        },
        reader: {
            type: 'json',
            root: 'result.movies'
        }
    }
});
