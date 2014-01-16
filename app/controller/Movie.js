Ext.define('XWMM.controller.Movie', {
    extend: 'Ext.app.Controller',

    requires: [
        'Ext.window.MessageBox',
        'XWMM.util.XBMC'
    ],

    models: [
        'Movie',
        'DetailedMovie',
        'Genre',
        'MovieSet'
    ],

    stores: [
        'Movies',
        'DetailedMovies',
        'ContentRatings',
        'Genres',
        'MovieSets'
    ],

    refs: [
        {ref: 'moviesList', selector: 'movieslist'},
        {ref: 'movieDetails', selector: 'moviedetails'}//,
        //{ref: 'moviePoster', selector: '#movieposter'}
    ],

    init: function() {
        this.control({
            'movieslist': {
                selectionchange: this.onMovieSelect
            },

            'movieslist actioncolumn': {
                click: this.onListAction
            }
        });
    },

    onLaunch: function() {
        var moviesStore = this.getMoviesStore();
        moviesStore.load({
            callback: this.onMoviesLoad,
            scope: this
        });
    },

    onMoviesLoad: function(records, operation, success) {
        // Select the first movie.
        if (success === true) {
            var moviesList = this.getMoviesList();
            moviesList.getSelectionModel().select(0);
        }
    },

    onMovieSelect: function(selModel, selection) {
        var record = selection[0];
        var store = this.getDetailedMoviesStore();

        var details = store.getById(record.get('movieid'));
        if (details == null) {
            store.load({
                callback: this.onMovieDetailsLoaded,
                addRecords: true,
                params: {
                    params: {
                        movieid: record.get('movieid'),
                        properties: store.fieldList
                    }
                },
                scope: this
            });
        }
        else {
            this.onMovieDetailsLoaded([details], null, true);
        }
    },

    onMovieDetailsLoaded: function(records, operation, success) {
        if (success === true && records.length > 0) {
            var record = records[0];

            this.getMovieDetails().getForm().loadRecord(record);
            //this.getMoviePoster().imgEl.dom.src = '/image/' + record.get('poster');
            //this.getMoviePoster().setValue(record.get('poster'));
        }
    },

    onListAction: function(view, cell, rowIndex, colIndex, e) {
        var action = e.getTarget().className.match(/\bicon-(\w+)\b/)[1];
        var record = view.getStore().getAt(rowIndex);

        switch (action) {
            case 'delete':
                this.onDeleteMovie(record);
                break;
        }
    },

    onDeleteMovie: function(record) {
        var me = this;

        Ext.MessageBox.show ({
            title: 'Delete Movie?',
            msg: "Are you sure you want to delete '" + record.get('title') + "'?",
            buttons: Ext.MessageBox.YESNO,
            icon: Ext.MessageBox.QUESTION,
            fn: function(btn) {
                if (btn == 'yes') {
                    XWMM.util.XBMC.sendCmd(
                        {
                            jsonrpc: '2.0',
                            method: 'VideoLibrary.RemoveMovie',
                            params: {movieid: record.get('movieid')},
                            id: 1
                        },
                        function(options, success, response) {
                            if (success) {
                                var me = this;
                                var movieid = options.jsonData.params.movieid;
                                var moviesStore = me.getMoviesStore();
                                var detailedMoviesStore = me.getDetailedMoviesStore();

                                // Change the selection before we delete the record.
                                var record = moviesStore.getById(movieid);
                                var sm = me.getMoviesList().getSelectionModel();
                                if (sm.isSelected(record)) {
                                    var index = moviesStore.indexOf(record);
                                    if (index == 0) {
                                        index++;
                                    }
                                    sm.select(index);
                                }

                                // Delete the records
                                detailedMoviesStore.remove(detailedMoviesStore.getById(movieid));
                                moviesStore.remove(record);
                            }
                        },
                        me
                    );
                }
            }
        });
    },

    onSaveMovie: function(dirtyFields) {
        Ext.MessageBox.show ({
            title: 'Not implemented yet!',
            msg: 'This feature has not been implemented yet.<br><br>'
                + 'Action: Save ' + record.get('title'),
            buttons: Ext.MessageBox.OK,
            icon: Ext.MessageBox.WARNING
        });
    }
});
