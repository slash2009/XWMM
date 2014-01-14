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

    var searchStore = new Ext.data.SimpleStore({
        fields: ['query'],
        data: []
    });

    var searchBox = new Ext.form.ComboBox({
        id: 'searchBox',
        store: searchStore,
        displayField: 'query',
        typeAhead: false,
        mode: 'local',
        triggerAction: 'all',
        applyTo: 'quicksearch',
        hideTrigger: true
    });

    var searchRec = Ext.data.Record.create([
        {name: 'query', type: 'string'}
    ]);

    var onFilteringBeforeQuery = function(e) {
        //grid.getSelectionModel().clearSelections();
        if (this.getValue().length==0) {
            XWMM.Movies.data.MovieGridStore.clearFilter();
        } else {
            var value = this.getValue().replace(/^\s+|\s+$/g, "");
            if (value=="")
                return;
            XWMM.Movies.data.MovieGridStore.filter('title', value, true, false);
        }
    };

    var onQuickSearchBeforeQuery = function(e) {
        if (this.getValue().length==0) {
        } else {
            var value = this.getValue().replace(/^\s+|\s+$/g, "");
            if (value=="")
                return;
            searchStore.clearFilter();
            var vr_insert = true;
            searchStore.each(function(r) {
                if (r.data['query'].indexOf(value)==0) {
                    // backspace
                    vr_insert = false;
                    return false;
                } else if (value.indexOf(r.data['query'])==0) {
                    // forward typing
                    searchStore.remove(r)
                }
            });
            if (vr_insert==true) {
                searchStore.each(function(r) {
                    if (r.data['query']==value) {
                        vr_insert = false
                    }
                });
            }
            if (vr_insert==true) {
                var vr = new searchRec({query: value});
                searchStore.insert(0, vr)
            }
            var ss_max = 4; // max 5 query history, starts counting from 0; 0==1,1==2,2==3,etc
            if (searchStore.getCount()>ss_max) {
                var ssc = searchStore.getCount();
                var overflow = searchStore.getRange(ssc-(ssc-ss_max), ssc);
                for (var i=0; i<overflow.length; i++) {
                    searchStore.remove(overflow[i])
                }
            }
        }
    };

    searchBox.on("beforequery", onQuickSearchBeforeQuery);
    searchBox.on("beforequery", onFilteringBeforeQuery);
    searchBox.on("select", onFilteringBeforeQuery)
    // end search
});
