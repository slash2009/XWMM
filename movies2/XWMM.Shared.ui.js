Ext.namespace('XWMM.Shared.ui');
Ext.namespace('XWMM.Shared.ui.renderers');


XWMM.Shared.ui.renderers.Watched = function(v) {
    return v ? '<img src="../images/icons/checked.png" title="Watched">' : '';
};


XWMM.Shared.ui.renderers.InSet = function(v) {
    return v ? '<img src="../images/icons/set.png" title="In Set">' : '';
};


XWMM.Shared.ui.MainMenuBar = new Ext.Toolbar({
    region: 'north',
    height: 30,
    items: [
        {
            text: 'Movies',
            menu: [
                {
                    text: 'Movies List',
                    iconCls: 'silk-grid',
                    handler: function() {window.location = '../movies/index.html'}
                },
                {
                    text: 'Movies by Genre',
                    disabled: 'true',
                    iconCls: 'silk-grid',
                    handler: function() {window.location = '../movies/moviegenre.html'}
                },
                {
                    text: 'Most recent',
                    iconCls: 'silk-grid',
                    handler: function() {window.location = '../movies/movierecent.html'}
                }
            ]
        },
        ' ',
        {
            text: 'TV-Shows',
            handler: function() {window.location = '../tvshows/index.html'}
        },
        ' ',
        {
            text: 'Music',
            menu: [
                {
                    text: 'Artist / Album',
                    iconCls: 'silk-grid',
                    handler: function() {window.location = '../music/index.html'}
                },
                {
                    text: 'Genre / Album',
                    iconCls: 'silk-grid',
                    handler: function() {window.location = '../music/albumgenres.html'}
                },
                {
                    text: 'Year / Album',
                    iconCls: 'silk-grid',
                    handler: function() {window.location = '../music/yearalbum.html'}
                }
            ]
        },
        ' ',
        {
            text: 'Files',
            handler: function() {window.location = '../files/index.html'}
        },
        '->',
        {
            text: 'Settings',
            menu: [
                {
                    text: 'Full screen mode',
                    handler: function() {window.location = '../movies/index.html'}
                },
                {
                    xtype: 'menucheckitem',
                    text: 'Ignore article when sorting',
                    checked: XWMM.settings.ignoreArticle,
                    checkHandler: function(cb, checked) {
                        XWMM.settings.ignoreArticle = checked;
                        Ext.state.Manager.set('ignoreArticle', checked);
                        // TODO: reload store.
                    }
                }
            ]
        },
        ' ',
        {
            xtype: 'tbtext',
            text: myVersion
        }
    ]
});
