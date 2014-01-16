Ext.define('XWMM.store.Genres', {
    extend: 'Ext.data.Store',

    storeId: 'genresStore',
    model: 'XWMM.model.Genre',

    // TODO: Fill up with standard genres.
    standardGenres: [
        'Action',
        'Adventure',
        'Animation'
    ],

    proxy: {
        type: 'xbmchttp',
        url: '/jsonrpc',
        extraParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetGenres',
            params: {
                type: 'movie',
                properties: ['title', 'thumbnail'],
                sort: {order: 'ascending', ignorearticle: true, method: 'title'}
            },
            id: 1
        },
        reader: {
            type: 'json',
            root: 'result.genres'
        }
    },

    listeners: {
        load: function(store, records, options) {
            var stdGenres = this.standardGenres;
            /*
             * When asking XBMC for a list of genres it will return a blank one. This blank one is a catch all for all
             * items that don't have a genre assigned to them. We don't want this blank genre to show up, so it's
             * remove from the store at load.
             *
             * At the same time let's populate the store with any standard genres that are missing.
             */
            for (var i = 0, len = records.length; i < len; i++) {
                if (records[i].data.title === '') {
                    store.remove(records[i]);
                }

                var index = stdGenres.indexOf(records[i].data.title);
                if (index > -1) {
                    stdGenres.splice(index, 1);
                }
            }

            var genresToAdd = [];
            for (var i = 0, len = stdGenres.length; i < len; i++) {
                genresToAdd.push(new XWMM.model.Genre({title: stdGenres[i], thumbnail: ''}));
            }

            this.loadData(genresToAdd, true);
        }
    }
});
