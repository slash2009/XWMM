Ext.define("XWMM.view.MoviesView", {
    extend: 'Ext.Container',
    alias: 'widget.moviestab',

    requires: [
        'Ext.layout.container.Border',
        'XWMM.view.MoviesList',
        'XWMM.view.MovieDetails'
    ],

    layout: 'border',

    items: [
        {
            xtype: 'movieslist',
            region: 'west',
            width: 400,
            minWidth: 300,
            maxWidth: 600,
            split: true
        },
        {
            id: 'moviedetails',
            xtype: 'moviedetails',
            region: 'center'
        }
    ]
});
