Ext.define('XWMM.Application', {
    name: 'XWMM',

    extend: 'Ext.app.Application',

    views: [
        'FilesView',
        'MoviesView',
        'MusicVideosView',
        'MusicView',
        'TVShowsView'
    ],

    controllers: [
        // TODO: add controllers here
    ],

    stores: [
        // TODO: add stores here
    ]
});
