Ext.namespace('XWMM.Shared.data');


XWMM.Shared.data.GenreRecord = Ext.data.Record.create([
    {name: 'title', type: 'string'}
]);


XWMM.Shared.data.GenreStore = new Ext.data.Store({
    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetGenres',
            params: {
                // type: movie/tvshow/musicvideo set before using store.
                properties: ['title'],
                sort: {
                    order: 'ascending',
                    ignorearticle: true,
                    method: 'title'
                }
            },
            id: 1
        }
    }),
    reader: new Ext.data.JsonReader({root: 'result.genres', idProperty: 'genreid'}, XWMM.Shared.data.GenreRecord),
    listeners: {
        load: function(store, records, options) {
            //console.log(records);
            /*
             * When asking XBMC for a list of genres it will return a blank one. This blank one is a catch all for all
             * items that don't have a genre assigned to them. We don't want this blank genre to show up, so it's
             * remove from the store at load.
             */
            for (var i = 0, len = records.length; i < len; i++) {
                if (records[i].data.title === '') {
                    store.remove(records[i]);
                }
            }
        },
        exception: function(store, type, action, options, response, arg) {
            console.debug('Store Exception: [type: ' + type + '; action: ' + action + ']');
            console.debug(response);
        }
    }
});
