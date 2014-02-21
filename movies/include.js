// -----------------------------------------
// MOVIE include.js
//------------------------------------------

Ext.BLANK_IMAGE_URL = '../extjs/resources/images/default/s.gif';
var responseFinale = [];
var movieTable = [];
var selectedMovie;
var currentRecord;
var currentMovie;
var DetailsFlag;
var genresFlag;
var detailPanel;


var gridContextMenu = new Ext.menu.Menu({
    items: [
        { text: 'Mark as watched', handler: setWatched },
        { text: 'Mark as unwatched', handler: setUnwatched }
    ]
});

function setWatched() {
        setXBMCWatched(currentRecord.data.idMovie, 'movie', true);
        currentRecord.data.watched = "1";
        Moviegrid.getView().refresh()
};

function setUnwatched() {
        setXBMCWatched(currentRecord.data.idMovie, 'movie', false);
        currentRecord.data.watched = "";
        Moviegrid.getView().refresh()
};


/**
 * Save set changes back to XBMC.
 * @param {Ext.form.Field} setField The set field.
 */
function updateXBMCSet(setField) {
    var currentMovie = currentRecord;
    var newValue = setField.getValue();

    if (setField.originalValue == newValue) {
        // No change, don't save the value.
        return;
    }

    var rpcCmd = {
        jsonrpc: '2.0',
        method: 'VideoLibrary.SetMovieDetails',
        params: {
            movieid: currentRecord.data.idMovie,
            set: newValue
        },
        id: 1
    };

    var rpcCmdJSON = Ext.util.JSON.encode(rpcCmd);
    //console.debug('XWMM::updateXBMCSet rpcCmd: ' + rpcCmdJSON);
    xbmcJsonRPC(rpcCmdJSON);

    setField.IsDirty = false;
    setField.originalValue = newValue;
    currentMovie.data.strSet = newValue;
    Moviegrid.getView().refresh();
}


function updateXBMCAll() {

    Ext.MessageBox.show({
        title: 'Please wait',
        msg: 'Saving changes',
        progressText: 'Checking changes...',
        width:300,
        progress:true,
        closable:false,
        animEl: 'samplebutton'
    })
    var f = function(v){
        return function(){
        if(v == 30){
            Ext.MessageBox.hide();
        }else{
            var i = v/29;
            if (v == 1) {
                myText = 'Checking changes...';
                if (MoviedetailPanel.getForm().isDirty()) {
                    updateXBMCTables(MoviedetailPanel.getForm(), 'movie', selectedMovie);
                    myText = 'updating movie info';
                };
                if (Ext.getCmp('moviesetcombo').isDirty()) {
                    updateXBMCSet(Ext.getCmp('moviesetcombo'));
                    myText = 'updating Sets'
                }
                if (fileDetailsPanel.getForm().isDirty()) {
                    updateXBMCTables(fileDetailsPanel.getForm(), 'movie', selectedMovie);
                    myText = 'updating additional info';
                };
            };
            if (v == 15) {
                if (Ext.getCmp('moviegenres').isDirty()) {
                    updateXBMCGenreMovie();
                    myText = 'updating Genres'
                };
            };
            Ext.MessageBox.updateProgress(i, myText);
        }
        };
    };
    for(var i = 1; i < 31; i++){
        setTimeout(f(i), i*100)
    }
}

// function LoadAllMoviesdetails(){
    // storeVideoFlags.load();
    // storeAudioFlags.load();
// }

function updateAllForms(r) {

    Ext.getCmp('MoviedetailPanel').getForm().loadRecord(r);
    Ext.getCmp('filedetailPanel').getForm().loadRecord(r);

    Ext.getCmp('movierating').updateSrc(r);
    Ext.getCmp('fanart').updateSrc(r.data.fanart);
    Ext.getCmp('cover').updateSrc(r.data.thumbnail);

    if (r.data.streamdetails != null) {
        if (r.data.streamdetails.video != null && r.data.streamdetails.video[0]) {
            Ext.getCmp('videocodec').getEl().dom.src = "../images/flags/"+r.data.streamdetails.video[0].codec+".png";
            Ext.getCmp('aspect').getEl().dom.src = "../images/flags/"+findAspect(r.data.streamdetails.video[0].aspect)+".png";
            Ext.getCmp('resolution').getEl().dom.src = "../images/flags/"+findResolution(r.data.streamdetails.video[0].width)+".png"
        }

        if (r.data.streamdetails.audio != null && r.data.streamdetails.audio[0]) {
            Ext.getCmp('audiochannels').getEl().dom.src = "../images/flags/"+r.data.streamdetails.audio[0].channels+"c.png";
            Ext.getCmp('audiocodec').getEl().dom.src = "../images/flags/"+r.data.streamdetails.audio[0].codec+".png"
        }
    }
}

function GetMovieDetails(r){

    var jsonResponse = xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.GetMovieDetails", "params": {"movieid": '+r.data.idMovie+', "properties": ["title", "genre", "year", "rating", "director", "trailer", "tagline", "plot", "plotoutline", "originaltitle", "playcount", "writer", "studio", "mpaa", "country", "imdbnumber", "runtime", "streamdetails", "top250", "votes", "set", "fanart", "thumbnail", "file", "sorttitle"]}, "id": 1}');

    mergeJson(r.data, jsonResponse.moviedetails);

    //fix up some data retrieved
    r.data.fanart = jsonResponse.moviedetails.fanart.replace(/image:\/\//g, "").slice(0,-1);
    r.data.thumbnail = jsonResponse.moviedetails.thumbnail.replace(/image:\/\//g, "").slice(0,-1);
    r.data.rating = r.data.rating.toFixed(1);
    r.data.runtime = Math.round(r.data.runtime / 60);

    updateAllForms(r);
    r.data.details = true;
}

function updateXBMCMovieDetails() {

    var changedData = new Array();
    var itemsList = Ext.getCmp('MoviedetailPanel').form.items.items;
    for (var i = 0; i < itemsList.length; i++){
        f = itemsList[i];
        if(f.isDirty()){
            var data = f.getName()+' : '+f.getValue();
            changedData.push(data)
        }
    }
    // also check additional fields
    itemsList = Ext.getCmp('filedetailPanel').form.items.items;
    for (var i = 0; i < itemsList.length; i++){
        f = itemsList[i];
        if(f.isDirty()){
            var data = f.getName()+' : '+f.getValue();
            changedData.push(data)
        }
    }
}

function movieGenreChange(sm){
    var sel = sm.getSelections();
    var strTemp = "";
    for (var i = 0; i < sel.length; i++) {
        if (strTemp == ""){strTemp = sel[i].data.label}
            else{ strTemp = strTemp+' / '+sel[i].data.label};
    }
    currentRecord.data.Moviegenres = strTemp;
    Ext.getCmp('moviegenres').setValue(strTemp)

}


/**
 * Save genre changes back to XBMC.
 */
function updateXBMCGenreMovie() {
    var selection = Genregrid.getSelectionModel().getSelections();
    var genres = [];

    for (var i = 0, len = selection.length; i < len; i++) {
        genres.push(selection[i].data.label);
    }

    var rpcCmd = {
        jsonrpc: '2.0',
        method: 'VideoLibrary.SetMovieDetails',
        params: {
            movieid: currentRecord.data.idMovie,
            genre: genres
        },
        id: 1
    };

    var rpcCmdJSON = Ext.util.JSON.encode(rpcCmd);
    //console.debug('XWMM::updateXBMCGenreMovie rpcCmd: ' + rpcCmdJSON);
    xbmcJsonRPC(rpcCmdJSON);

    currentRecord.data.Moviegenres = genres.join(' / ');
}


/**
 * Update the genre grid selection from the current record.
 * @param {MovieRecord} record The selected record.
 */
function GetMovieGenres(record) {
    var genres = splitStringList(record.data.Moviegenres, /[,\/\|]+/); // Split list separated with , / or |.
    var genreIds = [];

    for (var i = 0, len = genres.length; i < len; i++) {
        var id = storegenre.findExact('label', genres[i]);
        if (id == -1) {
            // Genre not found. This should never happen, but just in case the genre grid gets out of sync add the
            // missing genre.
            var newGenre = new genreRecord({label: genres[i]});
            storegenre.add(newGenre);
            id = storegenre.indexOf(newGenre);
        }
        genreIds[i] = id;
    }

    updateGenreGrid(genreIds);
}


function checkWatched(val) {
 if ((val != "" ) && (val != "0"))
    return '<img src=../images/icons/checked.png>'

}

function checkSet(val) {
 if ((typeof(val[0]) != "undefined" ))
    return '<img src=../images/icons/set.png>'
}

var MoviecolModel = new Ext.grid.ColumnModel([
        {header: "#", dataIndex: 'idMovie', hidden: true, width: 30},
        {header: "Title", dataIndex: 'Movietitle', width: 210},
        {header: "S", dataIndex: 'strSet', width: 26, hidden: false, renderer: checkSet},
        {header: "Genre", dataIndex: 'strGenre', hidden: true},
        {header: "W", dataIndex: 'watched', width: 26, hidden: false, renderer: checkWatched}

    ]);
