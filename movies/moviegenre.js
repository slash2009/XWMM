function genreConvert(value, record) {
    return value.join(' / ');
}

var MovieRecord = Ext.data.Record.create([
    { name: 'idMovie', mapping: 'movieid' },
    { name: 'strFilename', mapping: 'file' },
    { name: 'Movietitle', mapping: 'title' },
    { name: 'Moviegenres', mapping: 'genre', convert: genreConvert },
    { name: 'strGenre' },
    { name: 'watched', mapping: 'playcount' },
    { name: 'MovieRelease', mapping: 'year' },
    { name: 'streamdetails' },
    { name: 'strSet', mapping: 'set' }
]);

var sortArticles = docCookies.getItem('sortArticles') === '1';
var storeMovie = new Ext.data.Store({
    autoLoad: true,

    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc',
        xbmcParams: {
            jsonrpc: '2.0',
            method: 'VideoLibrary.GetMovies',
            params: {
                properties: [
                    'title', 'genre', 'year', 'playcount',
                    'file', 'set', 'streamdetails'
                ],
                sort: {
                    order: 'ascending',
                    ignorearticle: sortArticles,
                    method: 'title'
                }
            },
            id: 'XWMM'
        }
    }),
    reader: new Ext.data.JsonReader({ root: 'result.movies' }, MovieRecord)
});

var movieGrid = new Ext.grid.GridPanel({
    title: 'Movies by Genre',
    id: 'Moviegrid',
    store: storeMovie,

    region: 'west',
    width: 285,
    frame: true,
    split: true,

    cm: movieColumnModel,
    autoExpandColumn: 'title',
    enableColumnResize: false,
    stripeRows: true,

    viewConfig: {
        headersDisabled: true
    },

    sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),

    listeners: {
        rowcontextmenu: function(grid, rowIndex, e) {
            e.stopEvent();
            gridContextMenu.showAt(e.getXY());
            return false;
        }
    },

    tbar: {
            xtype: 'toolbar',
            height: 30,
            items: [
                {
                    id: 'genreFilterCombo',
                    store: XWMM.video.genreStore,

                    xtype: 'combo',
                    name: 'label',
                    emptyText: 'Filter by genre...',
                    displayField: 'label',
                    mode: 'local',
                    triggerAction: 'all',
                    listeners: {
                        select: function(combo, record, index) {
                            storeMovie.proxy.conn.xbmcParams.params.filter = {
                                field: 'genre',
                                operator: 'contains',
                                value: record.data.label
                            };
                            storeMovie.load();
                        }
                    }
                }
            ]
        }
});
