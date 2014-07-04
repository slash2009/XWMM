function artworkConvert(value) {
    if (value === undefined) {
        return '';
    }
    else {
        // subtract image:// from the start and / from the end.
        return value.substr(8, value.length - 9);
    }
}

function setWatched() {
    var movieGrid = Ext.getCmp('Moviegrid');
    var selectedMovie = movieGrid.getSelectionModel().getSelected();

    if (selectedMovie !== undefined && selectedMovie.data.watched === 0) {
        setXBMCWatched(selectedMovie.data.idMovie, 'movie', true);
        selectedMovie.data.watched = 1;
        movieGrid.getView().refresh();
    }
}

function setUnwatched() {
    var movieGrid = Ext.getCmp('Moviegrid');
    var selectedMovie = movieGrid.getSelectionModel().getSelected();

    if (selectedMovie !== undefined && selectedMovie.data.watched !== 0) {
        setXBMCWatched(selectedMovie.data.idMovie, 'movie', false);
        selectedMovie.data.watched = 0;
        movieGrid.getView().refresh();
    }
}

/**
 * Save set changes back to XBMC.
 * @param {Ext.form.Field} setField The set field.
 */
function updateXBMCSet(setField) {
    var newValue = setField.getValue();

    if (setField.originalValue === newValue) {
        // No change, don't save the value.
        return;
    }

    var movieGrid = Ext.getCmp('Moviegrid');
    var selectedMovie = movieGrid.getSelectionModel().getSelected();

    var rpcCmd = {
        jsonrpc: '2.0',
        method: 'VideoLibrary.SetMovieDetails',
        params: {
            movieid: selectedMovie.data.idMovie,
            set: newValue
        },
        id: 'XWMM'
    };

    var rpcCmdJSON = Ext.util.JSON.encode(rpcCmd);
    //console.debug('XWMM::updateXBMCSet rpcCmd: ' + rpcCmdJSON);
    xbmcJsonRPC(rpcCmdJSON);

    setField.IsDirty = false;
    setField.originalValue = newValue;
    selectedMovie.data.strSet = newValue;
    movieGrid.getView().refresh();
}

function updateXBMCAll() {
    Ext.MessageBox.show({
        title: 'Please wait',
        msg: 'Saving changes',
        progressText: 'Checking changes...',
        width: 300,
        progress: true,
        closable: false,
        animEl: 'samplebutton'
    });

    var f = function(v) {
        return function() {
            if (v === 30) {
                Ext.MessageBox.hide();
            }
            else {
                var i = v/29;
                var mesg = '';
                var form;

                if (v === 1) {
                    mesg = 'Checking changes...';

                    form = Ext.getCmp('MoviedetailPanel').getForm();
                    if (form.isDirty()) {
                        updateXBMCTables(form, 'movie',
                            Ext.getCmp('Moviegrid').getSelectionModel().getSelected().data.idMovie);
                        mesg = 'updating movie info';
                    }

                    form = Ext.getCmp('moviesetcombo');
                    if (form.isDirty()) {
                        updateXBMCSet(form);
                        mesg = 'updating Sets';
                    }

                    form = Ext.getCmp('filedetailPanel').getForm();
                    if (form.isDirty()) {
                        updateXBMCTables(form, 'movie',
                            Ext.getCmp('Moviegrid').getSelectionModel().getSelected().data.idMovie);
                        mesg = 'updating additional info';
                    }
                }
                else if (v === 15) {
                    if (Ext.getCmp('moviegenres').isDirty()) {
                        saveMovieGenre();
                        mesg = 'updating Genres';
                    }
                }
                Ext.MessageBox.updateProgress(i, mesg);
            }
        };
    };

    for (var i = 1; i < 31; i++) {
        setTimeout(f(i), i*100);
    }
}

function updateMovieDetails(record) {
    Ext.getCmp('MoviedetailPanel').getForm().loadRecord(record);
    Ext.getCmp('filedetailPanel').getForm().loadRecord(record);

    Ext.getCmp('movierating').updateSrc(record);
    Ext.getCmp('fanart').updateSrc(record.data.fanart);
    Ext.getCmp('cover').updateSrc(record.data.thumbnail);

    var videoCodec = Ext.getCmp('videocodec').getEl().dom;
    var aspect = Ext.getCmp('aspect').getEl().dom;
    var resolution = Ext.getCmp('resolution').getEl().dom;
    var audioChannels = Ext.getCmp('audiochannels').getEl().dom;
    var audioCodec = Ext.getCmp('audiocodec').getEl().dom;

    videoCodec.src = Ext.BLANK_IMAGE_URL;
    aspect.src = Ext.BLANK_IMAGE_URL;
    resolution.src = Ext.BLANK_IMAGE_URL;
    audioChannels.src = Ext.BLANK_IMAGE_URL;
    audioCodec.src = Ext.BLANK_IMAGE_URL;

    if (record.data.streamdetails !== undefined) {
        if (record.data.streamdetails.video !== undefined &&
            record.data.streamdetails.video.length > 0) {
            videoCodec.src = (record.data.streamdetails.video[0].codec !== undefined) ?
                '../images/flags/video/' + record.data.streamdetails.video[0].codec + '.png' :
                Ext.BLANK_IMAGE_URL;
            aspect.src = (record.data.streamdetails.video[0].aspect !== undefined) ?
                '../images/flags/aspectratio/' + findAspect(record.data.streamdetails.video[0].aspect) + '.png' :
                Ext.BLANK_IMAGE_URL;
            resolution.src = (record.data.streamdetails.video[0].width !== undefined) ?
                '../images/flags/video/' + findResolution(record.data.streamdetails.video[0].width) + '.png' :
                Ext.BLANK_IMAGE_URL;
        }
        if (record.data.streamdetails.audio !== undefined &&
            record.data.streamdetails.audio.length > 0) {
            audioChannels.src = (record.data.streamdetails.audio[0].channels !== undefined) ?
                '../images/flags/audio/' + record.data.streamdetails.audio[0].channels + '.png' :
                Ext.BLANK_IMAGE_URL;
            audioCodec.src = (record.data.streamdetails.audio[0].codec !== undefined) ?
                '../images/flags/audio/' + record.data.streamdetails.audio[0].codec + '.png' :
                Ext.BLANK_IMAGE_URL;
        }
    }
}

function loadMovieDetails(record) {
    var request = {
        jsonrpc: '2.0',
        method: 'VideoLibrary.GetMovieDetails',
        params: {
            movieid: record.data.idMovie,
            properties: [
                'title', 'genre', 'year', 'rating', 'director', 'trailer', 'tagline', 'plot',
                'plotoutline', 'originaltitle', 'playcount', 'writer', 'studio', 'mpaa',
                'country', 'imdbnumber', 'runtime', 'streamdetails', 'top250', 'votes', 'set',
                'fanart', 'thumbnail', 'file', 'sorttitle'
            ]
        },
        id: 'XWMM'
    };
    var response = xbmcJsonRPC(Ext.util.JSON.encode(request));
    mergeJson(record.data, response.moviedetails);

    //fix up some data retrieved
    record.data.fanart = artworkConvert(response.moviedetails.fanart);
    record.data.thumbnail = artworkConvert(response.moviedetails.thumbnail);
    record.data.rating = response.moviedetails.rating.toFixed(1);
    record.data.runtime = Math.round(response.moviedetails.runtime / 60);
    updateMovieDetails(record);
}

function movieGenreChange(sm) {
    var selectedMovie = Ext.getCmp('Moviegrid').getSelectionModel().getSelected();
    var selectedGenres = sm.getSelections();
    var genres = [];

    for (var i = 0, len = selectedGenres.length; i < len; i++) {
        genres.push(selectedGenres[i].data.label);
    }

    var list = genres.join(' / ');
    selectedMovie.data.genre = list;
    Ext.getCmp('moviegenres').setValue(list);
}

/**
 * Save genre changes back to XBMC.
 */
function saveMovieGenre() {
    var selectedMovie = Ext.getCmp('Moviegrid').getSelectionModel().getSelected();
    var selectedGenres = Ext.getCmp('Genregrid').getSelectionModel().getSelections();
    var genres = [];

    for (var i = 0, len = selectedGenres.length; i < len; i++) {
        genres.push(selectedGenres[i].data.label);
    }

    var request = {
        jsonrpc: '2.0',
        method: 'VideoLibrary.SetMovieDetails',
        params: {
            movieid: selectedMovie.data.idMovie,
            genre: genres
        },
        id: 'XWMM'
    };

    xbmcJsonRPC(Ext.util.JSON.encode(request));
}

/**
 * Update the genre grid selection from the current record.
 * @param {MovieRecord} record The selected record.
 */
function updateMovieGenreGrid(record) {
    var genreIds = [];
    var genres = splitStringList(record.data.Moviegenres, /[,\/\|]+/); // Split list separated with , / or |.

    var index;
    for (var i = 0, genreCount = genres.length; i < genreCount; i++) {
        index = storegenre.findExact('label', genres[i], 0);
        if (index > -1) {
            genreIds.push(index);
        }
    }

    if (genreIds.length > 0) {
        updateGenreGrid(genreIds);
    }
}

function checkWatched(value) {
    return value === 1 ?
        '<img src="../images/icons/checked.png" width="16" height="16" alt="Watched">' :
        '';
}

function checkSet(value) {
    return value !== '' ?
        '<img src="../images/icons/set.png" width="16" height="16" alt="In Set">' :
        '';
}

var movieColumnModel = new Ext.grid.ColumnModel([
    { header: 'Title', dataIndex: 'Movietitle', id: 'title' },
    { header: '&#160;', dataIndex: 'strSet', width: 30, renderer: checkSet, tooltip: 'In Set' },
    { header: '&#160;', dataIndex: 'watched', width: 26, renderer: checkWatched, tooltip: 'Watched' },
    { header: 'Genre', dataIndex: 'strGenre', hidden: true }
]);
