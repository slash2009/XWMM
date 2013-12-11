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
                    handler: function(btn, e) {
                        /*
                         * TODO: there is an API for entering/exiting full screen mode, but it's not consistent across
                         * browsers yet.
                         * https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode
                         */
                        console.log(e);
                        Ext.MessageBox.show({
                            title: 'Full screen mode',
                            msg: 'To enter/leave full screen mode press F11.',
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.INFO
                        });
                        e.stopEvent();
                    }
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


XWMM.Shared.ui.GenreChkBoxModel = new Ext.grid.CheckboxSelectionModel({
    alwaysSelectOnCheck: 'true',
    header: false,
    listeners: {
        selectionchange: function(sm) {
            XWMM.Shared.ui.GenreGrid.updateField();
        }
    }
});


XWMM.Shared.ui.GenreColModel = new Ext.grid.ColumnModel([
    XWMM.Shared.ui.GenreChkBoxModel,
    {header: 'Genre', width: 200, dataIndex: 'title'}
]);


XWMM.Shared.ui.ActorColModel = new Ext.grid.ColumnModel({
    defaults: {
        menuDisabled: true,
        resizable: false
    },
    columns: [
        {header: 'Actor', dataIndex: 'name'},
        {header: 'Role', dataIndex: 'role'}
    ]
});


XWMM.Shared.ui.GenreGrid = new Ext.grid.GridPanel({
    title: 'Genres', // TODO: why has this got a different style header??
    genreField: false, // Set when initialising app.
    store: XWMM.Shared.data.GenreStore,
    cm: XWMM.Shared.ui.GenreColModel,
    enableDragDrop: false,
    sm: XWMM.Shared.ui.GenreChkBoxModel,
    stripeRows: true,
    viewconfig: {forceFit: true},
    tbar: [
        {
            text: 'Add',
            iconCls: 'silk-add',
            handler: function(b, e) {
                Ext.MessageBox.prompt(
                    'Add Genre',
                    'Enter the name of the genre you would like to add:',
                    XWMM.Shared.ui.GenreGrid.addGenre,
                    XWMM.Shared.ui.GenreGrid);
            }
        }
    ],
    addGenre: function(btn, text) {
        if (btn != 'ok') {
            return;
        }

        var newGenre = new XWMM.Shared.data.GenreRecord({title: text});
        this.store.add(newGenre);
    },
    updateSelection: function(genres) {
        var genreList = genres.split(XWMM.settings.listSeparatorRe);
        var genreIds = [];

        for (var i = 0, len = genreList.length; i < len; i++) {
            var id = this.store.findExact('title', genreList[i]);
            if (id == -1) {
                // Genre not found. This should never happen, but just in case the genre grid gets out of sync add the
                // missing genre.
                var newGenre = new XWMM.Shared.data.GenreRecord({title: genreList[i]});
                this.store.add(newGenre);
                id = this.store.indexOf(newGenre);
            }
            genreIds[i] = id;
        }

        var sm = this.getSelectionModel();
        sm.suspendEvents(); // Don't start an update storm!
        sm.clearSelections(false);
        sm.selectRows(genreIds, true);
        sm.resumeEvents();
    },
    updateField: function() {
        if (this.genreField === false) {
            console.error('Genre field has not been set!');
            return;
        }

        var field = Ext.getCmp(this.genreField);
        if (field === undefined) {
            console.error('Genre field was not found!');
            return;
        }

        var selection = this.getSelectionModel().getSelections();
        var genres = [];
        for (var i = 0, len = selection.length; i < len; i++) {
            genres.push(selection[i].data.title);
        }
        genres.sort();

        var oldValue = field.getValue();
        var newValue = genres.join(XWMM.settings.listSeparator);
        field.setValue(newValue);
        // This is a bit of a hack, setValue doesn't fire a change event so do it manually.
        // This might not be the right way to do it.
        field.fireEvent('change', {this: field, newValue: newValue, oldValue: oldValue});
    }
});
