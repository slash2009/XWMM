Ext.BLANK_IMAGE_URL = '../extjs/resources/images/default/s.gif';

Ext.onReady(function() {
    XWMM.InitApp();
    XWMM.Movies.ui.SetupMainMenuBar();

    XWMM.Shared.data.GenreStore.proxy.conn.xbmcParams.params.type = 'movie';
    XWMM.Shared.ui.GenreGrid.genreField = 'XWMM.Movies.ui.MovieDetails.GenresField';

    new Ext.Viewport({
        layout: 'border',
        items: [
            XWMM.Shared.ui.MainMenuBar,
            XWMM.Movies.ui.MainPanel
        ]
    });

    XWMM.Shared.data.GenreStore.load();
    XWMM.Movies.data.MovieSetStore.load();
    XWMM.Movies.data.MovieGridStore.load();
});
