/*
 * Copyright 2011 slash2009.
 * Copyright 2013 Zernable.
 * Copyright 2013 uNiversal.
 * Copyright 2013 nwtn.
 * Copyright 2013, 2014 Andrew Fyfe.
 * Copyright 2014 criticalfiction.
 *
 * This file is part of Web interface Media Manager (WIMM) for kodi.
 *
 * WIMM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * WIMM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with WIMM.  If not, see <http://www.gnu.org/licenses/>.
 */

function setWatched() {
    var movieGrid = Ext.getCmp('Moviegrid');
    var selectedMovie = movieGrid.getSelectionModel().getSelected();

    if (selectedMovie !== undefined && selectedMovie.data.watched === 0) {
        setKodiWatched(selectedMovie.data.movieid, 'movie', true);
        selectedMovie.data.watched = 1;
        movieGrid.getView().refresh();
    }
}

function setUnwatched() {
    var movieGrid = Ext.getCmp('Moviegrid');
    var selectedMovie = movieGrid.getSelectionModel().getSelected();

    if (selectedMovie !== undefined && selectedMovie.data.watched !== 0) {
        setKodiWatched(selectedMovie.data.movieid, 'movie', false);
        selectedMovie.data.watched = 0;
        movieGrid.getView().refresh();
    }
}

function updateKodiAll() {
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
                Ext.getCmp('Moviegrid').store.load();
            }
            else {
                var i = v/29;
                var mesg = '';
                var form;

                if (v === 1) {
                    mesg = 'Checking changes...';

                    form = Ext.getCmp('MoviedetailPanel').getForm();
                    if (form.isDirty()) {
                        updateKodiTables(form, 'movie',
                            Ext.getCmp('Moviegrid').getSelectionModel().getSelected().data.movieid);
                        mesg = 'updating movie info';
                    }

                    form = Ext.getCmp('filedetailPanel').getForm();
                    if (form.isDirty()) {
                        updateKodiTables(form, 'movie',
                            Ext.getCmp('Moviegrid').getSelectionModel().getSelected().data.movieid);
                        mesg = 'updating additional info';
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

    if (record.data.fanart === '') {
        Ext.getCmp('fanart').updateSrc('../resources/images/defaultMovieFanart.jpg');
    }
    else {
        Ext.getCmp('fanart').updateSrc(record.data.fanart);
    }

    if (record.data.thumbnail === '') {
        Ext.getCmp('cover').updateSrc('../resources/images/defaultMovieCover.jpg');
    }
    else {
        Ext.getCmp('cover').updateSrc(record.data.thumbnail);
    }

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
                '../resources/images/flags/video/' + record.data.streamdetails.video[0].codec + '.png' :
                Ext.BLANK_IMAGE_URL;
            aspect.src = (record.data.streamdetails.video[0].aspect !== undefined) ?
                '../resources/images/flags/aspectratio/' +
                    WIMM.util.findAspect(record.data.streamdetails.video[0].aspect) + '.png' :
                Ext.BLANK_IMAGE_URL;
            resolution.src = (record.data.streamdetails.video[0].width !== undefined) ?
                '../resources/images/flags/video/' +
                    WIMM.util.findResolution(record.data.streamdetails.video[0].width) + '.png' :
                Ext.BLANK_IMAGE_URL;
        }
        if (record.data.streamdetails.audio !== undefined &&
            record.data.streamdetails.audio.length > 0) {
            audioChannels.src = (record.data.streamdetails.audio[0].channels !== undefined) ?
                '../resources/images/flags/audio/' + record.data.streamdetails.audio[0].channels + '.png' :
                Ext.BLANK_IMAGE_URL;
            audioCodec.src = (record.data.streamdetails.audio[0].codec !== undefined) ?
                '../resources/images/flags/audio/' + record.data.streamdetails.audio[0].codec + '.png' :
                Ext.BLANK_IMAGE_URL;
        }
    }
}

function loadMovieDetails(record) {
    var request = {
        jsonrpc: '2.0',
        method: 'VideoLibrary.GetMovieDetails',
        params: {
            movieid: record.data.movieid,
            properties: [
                'title', 'genre', 'year', 'rating', 'director', 'trailer', 'tagline', 'plot',
                'plotoutline', 'originaltitle', 'playcount', 'writer', 'studio', 'mpaa',
                'country', 'imdbnumber', 'runtime', 'streamdetails', 'top250', 'votes', 'set',
                'fanart', 'thumbnail', 'file', 'sorttitle', 'tag'
            ]
        },
        id: 'WIMM'
    };
    var response = kodiJsonRPC(request);
    WIMM.util.merge2Objects(record.data, response.moviedetails);

    //fix up some data retrieved
    record.data.genre = WIMM.util.convertArrayToList(response.moviedetails.genre);
    record.data.director = WIMM.util.convertArrayToList(response.moviedetails.director);
    record.data.writer = WIMM.util.convertArrayToList(response.moviedetails.writer);
    record.data.studio = WIMM.util.convertArrayToList(response.moviedetails.studio);
    record.data.country = WIMM.util.convertArrayToList(response.moviedetails.country);
    record.data.tag = WIMM.util.convertArrayToList(response.moviedetails.tag);
    record.data.fanart = WIMM.util.convertArtworkURL(response.moviedetails.fanart);
    record.data.thumbnail = WIMM.util.convertArtworkURL(response.moviedetails.thumbnail);
    record.data.rating = WIMM.util.convertRating(response.moviedetails.rating);
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

    Ext.getCmp('savebutton').enable();
}

/**
 * Update the genre grid selection from the current record.
 * @param {MovieRecord} record The selected record.
 */
function updateMovieGenreGrid(record) {
    var genreGrid = Ext.getCmp('genresGrid');
    var genreIds = [];
    var genres = WIMM.util.convertListToArray(record.data.genre, /[,\/\|]+/); // Split list separated with , / or |.

    var index;
    for (var i = 0, genreCount = genres.length; i < genreCount; i++) {
        index = genreGrid.getStore().findExact('label', genres[i], 0);
        if (index > -1) {
            genreIds.push(index);
        }
    }

    if (genreIds.length > 0) {
        genreGrid.getSelectionModel().clearSelections(false);
        genreGrid.getSelectionModel().selectRows(genreIds, true);
    }
}

function checkWatched(playCount) {
    return playCount > 0 ?
        '<img src="../resources/images/icons/checked.png" width="16" height="16" alt="Watched">' :
        '';
}

function checkSet(value) {
    return value !== '' ?
        '<img src="../resources/images/icons/set.png" width="16" height="16" alt="In Set">' :
        '';
}

var movieColumnModel = new Ext.grid.ColumnModel([
    { header: 'Title', dataIndex: 'Movietitle', id: 'title' },
    { header: '<img src="../resources/images/icons/set.png" width="16" height="16" alt="In Set">', dataIndex: 'set', width: 30, renderer: checkSet, tooltip: 'In Set' },
    { header: '<img src="../resources/images/icons/checked.png" width="16" height="16" alt="Watched">', dataIndex: 'watched', width: 26, renderer: checkWatched, tooltip: 'Watched' }
]);
