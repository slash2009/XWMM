Ext.define('XWMM.store.MovieSets', {
    extend: 'Ext.data.Store',

    storeId: 'movieSetsStore',
    model: 'XWMM.model.MovieSet',
    // TODO: Don't auto load, only load the store when the movie tab is first loaded.
    autoLoad: true,

    proxy: {
        type: 'xbmchttp',
        url: '/jsonrpc',
        extraParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovieSets',
            params: {
                properties: ['title', 'playcount', 'fanart', 'thumbnail'],
                sort: {order: 'ascending', ignorearticle: true, method: 'title'}
            },
            id: 1
        },
        reader: {
            type: 'json',
            root: 'result.sets'
        }
    }
});
