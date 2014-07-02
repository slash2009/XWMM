function setWatched() {
    if (selectedEpisode.data.playcount === 0) {
        setXBMCWatched(selectedEpisode.data.episodeid, 'episode', true);
        selectedEpisode.data.playcount = 1;
        episodeGrid.getView().refresh();
    }
}

function setUnwatched() {
    if (selectedEpisode.data.playcount !== 0) {
        setXBMCWatched(selectedEpisode.data.episodeid, 'episode', false);
        selectedEpisode.data.playcount = 0;
        episodeGrid.getView().refresh();
    }
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

                if (v === 1) {
                    mesg = 'Checking for changes...';
                    if (episodeDetailsPanel.getForm().isDirty()) {
                        updateXBMCTables(episodeDetailsPanel.getForm(), 'episode',
                            episodeGrid.getSelectionModel().getSelected().data.episodeid);
                        mesg = 'Updating episode information...';
                    }
                }
                if (v === 10) {
                    if (tvShowDetailsPanel.getForm().isDirty()) {
                        updateXBMCTables(tvShowDetailsPanel.getForm(), 'tvshow',
                            tvShowGrid.getSelectionModel().getSelected().data.tvshowid);
                        mesg = 'Updating TV show information...';
                    }
                }
                if (v === 20) {
                    if (Ext.getCmp('genreString').isDirty()) {
                        saveTVShowGenre();
                        mesg = 'Updating genres...';
                    }
                }
                Ext.MessageBox.updateProgress(i, mesg);
            }
        };
    };

    for(var i = 1; i < 31; i++) {
        setTimeout(f(i), i*100);
    }
}

function loadTVShowDetails(record) {
    var request = {
        jsonrpc: '2.0',
        method: 'VideoLibrary.GetTVShowDetails',
        params: {
            tvshowid: record.data.tvshowid,
            properties: [
                'title', 'genre', 'year', 'rating', 'plot', 'playcount', 'studio', 'mpaa',
                'premiered', 'votes', 'fanart', 'thumbnail', 'file', 'episodeguide'
            ]
        },
        id: 'XWMM'
    };
    var response = xbmcJsonRPC(Ext.util.JSON.encode(request));
    mergeJson(record.data, response.tvshowdetails);

    //fix up some data retrieved
    record.data.fanart = artworkConvert(response.tvshowdetails.fanart);
    record.data.thumbnail = artworkConvert(response.tvshowdetails.thumbnail);
    updateTVShowDetails(record);
}

function updateTVShowDetails(record) {
    tvshowStars.updateSrc(record);
    Ext.getCmp('tvshowcover').updateSrc(record.data.banner);
    Ext.getCmp('tvShowdetailPanel').getForm().loadRecord(record);
}

function updateEpisodeDetails(record) {
    episodeStars.updateSrc(record);

    Ext.getCmp('episodedetailPanel').getForm().loadRecord(record);
    Ext.getCmp('filedetailPanel').getForm().loadRecord(record);

    var videoCodec = Ext.getCmp('videocodec').getEl().dom;
    var aspect = Ext.getCmp('aspect').getEl().dom;
    var resolution = Ext.getCmp('resolution').getEl().dom;
    var audioChannels = Ext.getCmp('audiochannels').getEl().dom;
    var audioCodec = Ext.getCmp('audiocodec').getEl().dom;

    videoCodec.src = '../images/flags/default.png';
    aspect.src = '../images/flags/default.png';
    resolution.src = '../images/flags/defaultscreen.png';
    audioChannels.src = '../images/flags/0c.png';
    audioCodec.src = '../images/flags/defaultsound.png';

    if (record.data.streamdetails !== undefined) {
        if (record.data.streamdetails.video !== undefined &&
            record.data.streamdetails.video.length > 0) {
            videoCodec.src = (record.data.streamdetails.video[0].codec !== undefined) ?
                '../images/flags/' + record.data.streamdetails.video[0].codec + '.png' :
                '../images/flags/default.png';
            aspect.src = (record.data.streamdetails.video[0].aspect !== undefined) ?
                '../images/flags/' + findAspect(record.data.streamdetails.video[0].aspect) + '.png' :
                '../images/flags/default.png';
            resolution.src = (record.data.streamdetails.video[0].aspwidthect !== undefined) ?
                '../images/flags/' + findResolution(record.data.streamdetails.video[0].width) + '.png' :
                '../images/flags/defaultscreen.png';
        }
        if (record.data.streamdetails.audio !== undefined &&
            record.data.streamdetails.audio.length > 0) {
            audioChannels.src = (record.data.streamdetails.audio[0].channels !== undefined) ?
                '../images/flags/' + record.data.streamdetails.audio[0].channels + 'c.png' :
                '../images/flags/0c.png';
            audioCodec.src = (record.data.streamdetails.audio[0].codec !== undefined) ?
                '../images/flags/' + record.data.streamdetails.audio[0].codec + '.png' :
                '../images/flags/defaultsound.png';
        }
    }
}

function clearEpisodeDetails() {
    episodeStars.updateSrc({data:{}});
    // FIXME: this doesn't work because updateSrc appends /images/
    //Ext.getCmp('seasoncover').updateSrc('../images/nobanner.png');

    Ext.getCmp('episodedetailPanel').getForm().reset();
    Ext.getCmp('filedetailPanel').getForm().reset();

    Ext.getCmp('videocodec').getEl().dom.src = '../images/flags/default.png';
    Ext.getCmp('aspect').getEl().dom.src = '../images/flags/default.png';
    Ext.getCmp('resolution').getEl().dom.src = '../images/flags/defaultscreen.png';
    Ext.getCmp('audiochannels').getEl().dom.src = '../images/flags/0c.png';
    Ext.getCmp('audiocodec').getEl().dom.src = '../images/flags/defaultsound.png';
}

function movieGenreChange(sm) {
    var selectedTVShow = Ext.getCmp('tvshowgrid').getSelectionModel().getSelected();
    var selectedGenres = sm.getSelections();
    var genres = [];

    for (var i = 0, len = selectedGenres.length; i < len; i++) {
        genres.push(selectedGenres[i].data.label);
    }

    var list = genres.join(' / ');
    selectedTVShow.data.genre = list;
    Ext.getCmp('genreString').setValue(list);
}

function saveTVShowGenre() {
    var selectedTVShow = Ext.getCmp('tvshowgrid').getSelectionModel().getSelected();
    var selectedGenres = Genregrid.getSelectionModel().getSelections();
    var genres = [];

    for (var i = 0, len = selectedGenres.length; i < len; i++) {
        genres.push(selectedGenres[i].data.label);
    }

    var request = {
        jsonrpc: '2.0',
        method: 'VideoLibrary.SetTVShowDetails',
        params: {
            tvshowid: selectedTVShow.data.tvshowid,
            genre: genres
        },
        id: 'XWMM'
    };

    xbmcJsonRPC(Ext.util.JSON.encode(request));
}

function updateTVShowGenreGrid(record) {
    var genreIds = [];
    var genres = splitStringList(record.data.TVGenre, /[,\/\|]+/); // Split list separated with , / or |.

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
