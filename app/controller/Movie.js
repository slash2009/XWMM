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
        {ref: 'movieDetails', selector: 'moviedetails'},
        {ref: 'moviePoster', selector: '#movie-poster'},
        {ref: 'movieFanart', selector: '#movie-fanart'},
        {ref: 'movieVideoCodec', selector: '#movie-video-codec'},
        {ref: 'movieVideoAspect', selector: '#movie-video-aspect'},
        {ref: 'movieVideoResolution', selector: '#movie-video-resolution'},
        {ref: 'movieAudioCodec', selector: '#movie-audio-codec'},
        {ref: 'movieAudioChannel', selector: '#movie-audio-channel'}
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
        if (selection.length == 0 ) {
            return;
        }
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
            this.getMovieDetails().down('#movie-genres').loadGenre(record.get('genre'));

            this.getMoviePoster().setSrc('/image/' + record.get('poster'));
            this.getMovieFanart().setSrc('/image/' + record.get('fanart'));

            var streamDetails = record.get('streamdetails');
            if (streamDetails.video.length > 0) {
                this.getMovieVideoCodec().setSrc('resources/images/flags/source/' + streamDetails.video[0].codec + '.png');
                this.getMovieVideoAspect().setSrc('resources/images/flags/aspectratio/' + this.findAspect(streamDetails.video[0].aspect) + '.png');
                this.getMovieVideoResolution().setSrc('resources/images/flags/resolution/' + this.findResolution(streamDetails.video[0].width) + '.png');
            }
            if (streamDetails.audio.length > 0) {
                this.getMovieAudioCodec().setSrc('resources/images/flags/audio/' + streamDetails.audio[0].codec + '.png');
                this.getMovieAudioChannel().setSrc('resources/images/flags/' + streamDetails.audio[0].channels + 'c.png');
            }
        }
    },

    onListAction: function(view, cell, rowIndex, colIndex, e) {
        var action = e.getTarget().className.match(/\bxaction-(\w+)\b/)[1];
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

    onSaveMovie: function(record, dirtyFields) {
        for (var field in dirtyFields) {
            switch (field) {
                case 'runtime':
                    dirtyFields[field] = parseInt(dirtyFields[field]) * 60; // JSON uses runtime as # of seconds.
                    break;

                case 'rating':
                    dirtyFields[field] = parseFloat(dirtyFields[field]).toFixed(1);
                    break;

                case 'director':
                case 'writer':
                case 'studio':
                case 'country':
                    dirtyFields[field] = XWMM.util.XBMC.splitStringList(dirtyFields[field], XWMM.Application.listSeparatorRE);
                    break;
            }
        }

        if (Ext.JSON.encode(dirtyFields).length === 2) {
            // Nothing to update.
            return;
        }

        dirtyFields.movieid = record.get('movieid');
        var rpcCmd = {
            jsonrpc: '2.0',
            method: 'VideoLibrary.SetMovieDetails',
            params: dirtyFields,
            id: 1
        };

        //var rpcCmdJSON = Ext.JSON.encode(rpcCmd);
        //console.debug('XWMM.controller.Movie#onSaveMovie rpcCmd: ' + rpcCmdJSON);
        XWMM.util.XBMC.sendCmd(rpcCmd);
    },

    findAspect: function(aspect) {
        if (aspect == 0)
            return 'defaultaspect';
        else if (aspect < 1.4)
            return '1.33';
        else if (aspect < 1.7)
            return '1.66';
        else if (aspect < 1.8)
            return '1.78';
        else if (aspect < 1.9)
            return '1.85';
        else if (aspect < 2.3)
            return '2.20';
        else
            return '2.35';
    },

    findResolution: function(width) {
        if (width == 0)
            return 'defaultscreen';
        else if (width < 721)
            return '480';
        // 960x540
        else if (width < 961)
            return '540';
        // 1280x720
        else if (width < 1281)
            return '720';
        // 1920x1080
        else
            return '1080';
    }

});
