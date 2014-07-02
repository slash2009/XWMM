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
var storeMovie = new Ext.data.GroupingStore({
    groupField: 'strGenre',

    proxy: new Ext.data.XBMCProxy({
        url: '/jsonrpc'
    }),
    reader: new Ext.data.JsonReader({ root: 'result.movies' }, MovieRecord)
});

var tempMovieStore = new Ext.data.Store({
    autoLoad: true,
    listeners: {
        load: function(records) {
            var i = 0, i_len = 0, j = 0, j_len = 0;
            var genres = [];
            var movie;
            for (i = 0, i_len = records.data.length; i < i_len; i++) {
                movie = records.data.items[i].data;
                genres = splitStringList(movie.Moviegenres, /[,\/\|]+/);
                for (j = 0, j_len = genres.length; j < j_len; j++) {
                    var record = new MovieRecord({
                        idMovie: movie.idMovie,
                        strFilename: movie.strFilename,
                        Movietitle: movie.Movietitle,
                        Moviegenres: movie.Moviegenres,
                        strGenre: genres[j],
                        watched: movie.watched,
                        MovieRelease: movie.MovieRelease,
                        streamdetails: movie.streamdetails,
                        strSet: movie.strSet
                    });
                    storeMovie.add(record);
                }
            }
            storeMovie.commitChanges();
            storeMovie.sort('strGenre', 'ASC');
        }
    },

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

    view: new Ext.grid.GroupingView({
        startCollapsed: true,
        enableGroupingMenu : false,
        enableNoGroups: false,
        headersDisabled: true,
        groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
    }),

    sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),

    listeners: {
        rowcontextmenu: function(grid, rowIndex, e) {
            e.stopEvent();
            gridContextMenu.showAt(e.getXY());
            return false;
        }
    }
});
