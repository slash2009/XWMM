Ext.define("XWMM.view.movie.Main", {
    extend: 'Ext.Container',
    alias: 'widget.moviesmainview',

    requires: [
        'Ext.layout.container.Border',
        'XWMM.view.movie.MoviesList',
        'XWMM.view.movie.MovieDetails'
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
