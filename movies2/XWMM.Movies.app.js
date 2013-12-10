Ext.BLANK_IMAGE_URL = '../extjs/resources/images/default/s.gif';

Ext.onReady(function() {
    XWMM.InitApp();
    XWMM.Movies.ui.SetupMainMenuBar();

    new Ext.Viewport({
        layout: 'border',
        items: [
            XWMM.Shared.ui.MainMenuBar,
            XWMM.Movies.ui.MainPanel
        ]
    });

    XWMM.Movies.data.MovieSetStore.load();
    XWMM.Movies.data.MovieGridStore.load();
});
