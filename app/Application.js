Ext.define('XWMM.Application', {
    extend: 'Ext.app.Application',

    name: 'XWMM',

    statics: {
        version: '4.0.0',

        listSeparator: ' / ',
        listSeparatorRe: /[ ]+[,\/\|]+[ ]+/ // Split list separated with , / or |
    },

    views: [
        'FilesView',
        'MoviesView',
        'MusicVideosView',
        'MusicView',
        'TVShowsView'
    ],

    controllers: [
        'Movie'
    ],

    stores: [
        'ContentRatings',
        'DetailedMovies',
        'Genres',
        'Movies',
        'MovieSets'
    ]
});
