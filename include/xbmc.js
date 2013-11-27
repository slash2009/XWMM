function XBMCExecSql(inputUrl) {
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });
}

function XBMCGetSetId(inputUrl) {
    var response;
        Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){response = t},
        failure: function(t){},
        timeout: 2000
    });
    return t;

}
function setXBMCResponseFormat() {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=setresponseformat(openRecordSet;<recordset>;closeRecordSet;</recordset>;openRecord;<record>;closeRecord;</record>;openField;<field>;closeField;</field>)';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });
}

function setXBMCwatched(idMedia,media) {
    if (media == "movie") {
        xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.SetMovieDetails", "params": {"movieid": '+idMedia+', "playcount": 1}, "id": 1}');
    } else {
        xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.SetEpisodeDetails", "params": {"episodeid": '+idMedia+', "playcount": 1}, "id": 1}');
    }
}

function setXBMCunwatched(idMedia,media) {
    if (media == "movie") {
        xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.SetMovieDetails", "params": {"movieid": '+idMedia+', "playcount": 0, "lastplayed": ""}, "id": 1}');
    } else {
        xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.SetEpisodeDetails", "params": {"episodeid": '+idMedia+', "playcount": 0, "lastplayed": ""}, "id": 1}');
    }
}

function downloadNewXBMCFile(url,myFile) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=FileDownloadFromInternet('+url+'; '+myFile+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });

};

function downloadXBMCFile(url,myFile) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=FileDownloadFromInternet('+url+'; '+myFile+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });
};

function AddXBMCNewMovieSet(record) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(INSERT INTO sets (strSet) VALUES ("'+record.data.strSet+'"))';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });

}

function AddXBMCNewGenre(record) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(INSERT INTO genre (strGenre) VALUES ("'+record.data.label+'"))';
    XBMCExecSql(inputUrl)
}

function updateXBMCAlbumInfo(record) {

    var inputUrl = '/xbmcCmds/xbmcHttp?command=execmusicdatabase(UPDATE albuminfo SET strReview = "'+record.data.strReview+'" ,iRating = "'+record.data.iRating+'" WHERE idAlbum='+record.data.idAlbum+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });
}

function updateXBMCAlbumScraperInfo(record) {

    var inputUrl = '/xbmcCmds/xbmcHttp?command=execmusicdatabase(UPDATE albuminfo SET strMoods = "'+record.data.strMoods+'", strStyles = "'+record.data.strStyles+'", strThemes = "'+record.data.strThemes+'", strLabel = "'+record.data.strLabel+'", strType = "'+record.data.strType+'" ,strExtraGenres = "'+record.data.strExtraGenres+'" WHERE idAlbum='+record.data.idAlbum+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });
}

function updateXBMCAlbum(record) {

    var inputUrl = '/xbmcCmds/xbmcHttp?command=execmusicdatabase(UPDATE album SET idArtist = "'+record.data.idArtist+'", iYear = "'+record.data.iYear+'", idGenre = "'+record.data.idGenre+'", strAlbum = "'+record.data.strAlbum+'" WHERE idAlbum='+record.data.idAlbum+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });

}

function removeXBMCGenre(record) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(DELETE FROM genre WHERE idGenre='+record.data.genreid+')';
    XBMCExecSql(inputUrl);
}

function checkXBMCGenreUsed(record) {
    var found = false;
    // check if genre is used in movie
    var inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT idMovie FROM genrelinkmovie where idGenre='+record.data.genreid+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){
                    if (TrimXbmcXml(t) != '') {found = true}
                },
        failure: function(t){},
        timeout: 2000
    });

    inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT idShow FROM genrelinktvshow where idGenre='+record.data.genreid+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){
                    if (TrimXbmcXml(t) != '') {found = true}
                },
        failure: function(t){},
        timeout: 2000
    });
    return found;

}

function updateXBMCGenreString(record) {

    //update strGenre in Genre Table
    var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(UPDATE genre SET strGenre = "'+record.data.label+'" WHERE idGenre='+record.data.genreid+')';
    XBMCExecSql(inputUrl)

    var oldValue = record.modified.label;
    var newValue = record.data.label;

    //get and update all movies with that genre
    inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT movie.idMovie, movie.c14 FROM movie inner join genrelinkmovie on (genrelinkmovie.idMovie = movie.idMovie) where genrelinkmovie.idGenre = '+record.data.genreid+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){
            var temp = TrimXmltofields(t);
            temp = temp.replace(/<record>/g, "");
            temp = temp.split("<field>"); // temp contain idMovie, genrestring, idMovie, genrestring, etc ...
            for (var i=1; i < temp.length; i=i+2) {
                var myString = temp[i+1].replace(oldValue, newValue);
                var myMovieId = temp[i];
            inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(UPDATE movie SET c14 = "'+myString+'" where idMovie = '+myMovieId+')';
            XBMCExecSql(inputUrl)
            }
        },
        failure: function(t){},
        timeout: 2000
    });

    //get and update all TVShows with that genre
    inputUrl = '/xbmcCmds/xbmcHttp?command=queryvideodatabase(SELECT tvshow.idShow, tvshow.c08 FROM tvshow inner join genrelinktvshow on (genrelinktvshow.idShow = tvshow.idShow) where genrelinktvshow.idGenre = '+record.data.genreid+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){
            var temp = TrimXmltofields(t);
            temp = temp.replace(/<record>/g, "");
            temp = temp.split("<field>"); // temp contain idMovie, genrestring, idMovie, genrestring, etc ...
            for (var i=1; i < temp.length; i=i+2) {
                var myString = temp[i+1].replace(oldValue, newValue);
                var myMovieId = temp[i];
            inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(UPDATE tvshow SET c08 = "'+myString+'" where idShow = '+myMovieId+')';
            XBMCExecSql(inputUrl)
            }
        },
        failure: function(t){},
        timeout: 2000
    });
}

 function getTagAttribute(xmlString, tag) {
    var temp ="";
    for (var i=0 ; i < xmlString.attributes.length; i++) {
        if (xmlString.attributes[i].nodeName == tag) {
            temp = xmlString.attributes[i].nodeValue
        }
    }
    return temp;
 }

function TrimXmltofields(t) {
    var temp = t.responseText.replace(/<html>/g, "");
    temp = temp.replace(/<\/html>/g, "");
    temp = temp.replace(/<recordset>/g, "");
    temp = temp.replace(/<\/record>/g, "");
    temp = temp.replace(/<\/recordset>/g, "");
    temp = temp.replace(/\n/g, '');
    temp = temp.replace(/<\/field>/g, "");

    return temp;
}

function TrimXbmcXml(t){
    var temp = TrimXmltofields(t);
    temp = temp.replace(/<field>/g, "");

    return temp;
}

function getFanartList (String) {

    var result = [];
    if (String == "") return result;

    if (window.DOMParser)
     {
      parser=new DOMParser();
      xmlDoc=parser.parseFromString(String,"text/xml");
     }
    else // Internet Explorer
     {
      xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async="false";
      xmlDoc.loadXML(String);
     }

     var MasterUrl = xmlDoc.getElementsByTagName("fanart")[0].getAttribute("url");
     if (MasterUrl == null){ MasterUrl = ""};


     for (var i=0 ; i < xmlDoc.documentElement.childNodes.length; i++) {
        var downloadUrl = MasterUrl + xmlDoc.getElementsByTagName("thumb")[i].childNodes[0].nodeValue;
        var previewUrl = xmlDoc.getElementsByTagName("thumb")[i].getAttribute("preview");
        if (previewUrl == "" || previewUrl == null) {   previewUrl = downloadUrl}
            else { previewUrl = MasterUrl + previewUrl};
        result.push([previewUrl, downloadUrl, "Remote", ""]);
    }

     return result;
}

function getCoverList(String, r) {

    var result = [];
    if (String == "") return result;

    if (String.match("<thumb><thumb>") == null) {
        String = '<test>'+String+'</test>'
    };
    String = String.replace(/\n/g,"");

    if (window.DOMParser)
     {
      parser=new DOMParser();
      xmlDoc=parser.parseFromString(String,"text/xml");
     }
    else // Internet Explorer
     {
      xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async="false";
      xmlDoc.loadXML(String);
     }

    // result.push(['../cache/Video/'+r.data.cover, "", "Current", ""]);

     var MasterUrl = getTagAttribute(xmlDoc.documentElement, 'url');
     if (MasterUrl == null){ MasterUrl = ""};
     for (var i=0 ; i < xmlDoc.documentElement.childNodes.length; i++) {
        var downloadUrl = MasterUrl + xmlDoc.getElementsByTagName("thumb")[i].childNodes[0].nodeValue;
        var previewUrl = xmlDoc.getElementsByTagName("thumb")[i].getAttribute("preview");
        if (previewUrl == "" || previewUrl == null) { previewUrl = downloadUrl}
            else { previewUrl = MasterUrl + previewUrl};
        // need to change preview url for impawards links
        if (previewUrl.match("impaward") != null) {previewUrl = previewUrl.replace(/posters\//g,"thumbs/imp_")};

        result.push([previewUrl, downloadUrl, "Remote", ""]);
    }
     return result;
}

function XBMCgetMoviesFields(resp, r) { //This function is no longer being called

    //var temp = TrimXbmcXml(resp);

    var temp = resp.responseText.replace(/<\/record>/g, "");
    temp = temp.replace(/<record>/g, "");
    temp = temp.replace(/<recordset>/g, "");
    temp = temp.replace(/<\/recordset>/g, "");
    temp = temp.replace(/<html>/g, "");
    temp = temp.replace(/<\/html>/g, "");
    temp = temp.replace(/<\/field>/g, "");
    temp = temp.split("<field>");
    r.data.MovieFanartUrl = getFanartList(temp[1]);
    r.data.MovieCoverUrl = getCoverList(temp[2], r);
    r.data.idFile = temp[3];

}


function XBMCScanContent(type,path) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=ExecBuiltIn(UpdateLibrary('+type+','+path+'))';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });
}

function removeXbmcActor(record) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(DELETE FROM actors WHERE idActor ='+record.data.idActor+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });
}

function removeXbmcActorEpisode(record) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(DELETE FROM actorlinkepisode WHERE idActor ='+record.data.idActor+' AND idEpisode ='+record.data.idEpisode+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });
}

function removeXbmcActorTVShow(record) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(DELETE FROM actorlinktvshow WHERE idActor ='+record.data.idActor+' AND idShow ='+record.data.idShow+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });
}

function removeXbmcActorMovie(record) {
    var inputUrl = '/xbmcCmds/xbmcHttp?command=execvideodatabase(DELETE FROM actorlinkmovie WHERE idActor ='+record.data.idActor+' AND idMovie ='+record.data.idMovie+')';
    Ext.Ajax.request({
        url: inputUrl,
        method: 'GET',
        async: false,
        success: function (t){},
        failure: function(t){},
        timeout: 2000
    });
}


function updateXBMCTables(myForm, myTable) {
    //TODO: Clean quotes entered into fields so they don't break JSON query
    var sqlData = '';
    var jsParam = '';
    var parmValue = '';
    var parmArray = [];
    var itemsList = myForm.items.items;
    for (var i = 0; i < itemsList.length; i++){
        f = itemsList[i];
        if(f.isDirty()){
            switch(f.name) {
                case "Moviegenres":
                case "TVGenre":
                    continue; //We don't want to save genres here
                    break;
                case "runtime":
                    parmValue = parseInt(f.getValue()) * 60; //JSON uses runtime as # of seconds.
                    break;
                case "rating":
                case "year":
                    parmValue = f.getValue(); //integer
                    break;
                case "country":
                case "studio":
                case "director":
                case "genre":
                case "theme":
                case "mood":
                case "style":
                case "artist":
                    parmArray = f.getValue().split(","); //array.string
                    break;
                default:
                    parmValue = JSON.stringify(f.getValue(), escape); //string
                    break;
            }

            if (parmArray != undefined && parmArray.length == 1 && parmArray[0] != "") {
                if (jsParam == '') {
                    jsParam = '"' + f.name + '": ["' + parmArray[0] + '"]'; }
                else {
                    jsParam = jsParam + ', "' + f.name + '": ["' + parmArray[0] + '"]'; }
            }
            else if (parmArray != undefined && parmArray.length == 1 && parmArray[0] == "") {
                if (jsParam == '') {
                    jsParam = '"' + f.name + '": []'; }
                else {
                    jsParam = jsParam + ', "' + f.name + '": []'; }
            }
            else if (parmArray.length > 1) {
                if (jsParam == '') {
                    jsParam = '"' + f.name + '": ["' + parmArray.join('","') + '"]'; }
                else {
                    jsParam = jsParam + ', "' + f.name + '": ["' + parmArray.join('","') + '"]'; }
            }
            else {
                if (jsParam == '') {
                    jsParam = '"' + f.name + '": ' + parmValue; }
                else {
                    jsParam = jsParam + ', "' + f.name + '": ' + parmValue; }
            }
        }
        //clear out values before looping
        parmValue = '';
        parmArray = [];
    }
    if (myTable == 'episode') {
        var idEpisode = EpisodeGrid.getSelectionModel().getSelected().data.episodeid;
        var myIndex = 'idEpisode='+idEpisode
        if (jsParam != "") {
            xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.SetEpisodeDetails", "params": {"episodeid": '+idEpisode+', '+jsParam+'}, "id": 1}'); }
    };
    if (myTable == 'tvshow') {
        var idShow = TvShowGrid.getSelectionModel().getSelected().data.tvshowid;
        var myIndex = 'idShow='+idShow
        if (jsParam != "") {
            xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.SetTVShowDetails", "params": {"tvshowid": '+idShow+', '+jsParam+'}, "id": 1}'); }
    };

    if (myTable == 'movie') {
        var idMovie = selectedMovie;
        var myIndex = 'idMovie='+idMovie
        if (jsParam != "") {
            xbmcJsonRPC('{"jsonrpc": "2.0", "method": "VideoLibrary.SetMovieDetails", "params": {"movieid": '+idMovie+', '+jsParam+'}, "id": 1}'); }
    };

    if ((myTable == 'album') || (myTable == 'albuminfo')) {
        var idAlbum = AlbumGrid.getSelectionModel().getSelected().data.albumid;
        if (jsParam != "") {
            xbmcJsonRPC('{"jsonrpc": "2.0", "method": "AudioLibrary.SetAlbumDetails", "params": {"albumid": '+idAlbum+', '+jsParam+'}, "id": 1}'); }
    }
}

function escape (key, val) {
    if (typeof(val)!="string") return val;
    return val
      .replace(/[\"]/g, '\\"')
      .replace(/[\\]/g, '\\\\')
      .replace(/[\/]/g, '\\/')
      .replace(/[\b]/g, '\\b')
      .replace(/[\f]/g, '\\f')
      .replace(/[\n]/g, '\\n')
      .replace(/[\r]/g, '\\r')
      .replace(/[\t]/g, '\\t')
    ;
}


Ext.data.JsonXBMCReader = function(meta, recordType){
    meta = meta || {};
    Ext.data.JsonXBMCReader.superclass.constructor.call(this, meta, recordType||meta.fields);
};
Ext.extend(Ext.data.JsonXBMCReader, Ext.data.DataReader, {
    /**
     * This method is only used by a DataProxy which has retrieved data from a remote server.
     * @param {Object} response The XHR object which contains the JSON data in its responseText.
     * @return {Object} data A data block which is used by an Ext.data.Store object as
     * a cache of Ext.data.Records.
     */
    read : function(response){

        var temp = response.responseText.replace(/<html>/g, "");
        temp = temp.replace(/<\/html>/g, "");
        temp = temp.replace(/^M/g, "");
        temp = temp.replace(/<recordset>/g, "");
        temp = temp.replace(/<\/record>/g, "");
        temp = temp.replace(/<\/recordset>/g, "");
        temp = temp.replace(/\n/g, '');
        temp = temp.replace(/\r/g, '');

        var responseArr = temp;


        responseArr = responseArr.split("<record>");

        var j = 0;
        str = '{"data": [';
        for (var i = 0; i < responseArr.length; i++) {
            if (responseArr[i] != "" && responseArr[i].length > 3) {
                responseArr[i] = responseArr[i].replace(/<\/field>/g, "");
                responseArr[i] = responseArr[i].split("<field>");
                str = str+"{";
                for (var j = 1; j < responseArr[i].length; j++) {
                    var tempstr = responseArr[i][j].replace(/\\/g,"\\\\");
                    tempstr = tempstr.replace(/\"/g,'\\\"');

                    if (j == (responseArr[i].length - 1)){
                    str = str+'"field:nth('+j+')": "'+tempstr+'"';
                    }
                    else{
                    str = str+'"field:nth('+j+')": "'+tempstr+'",';
                    }
                };
                if (i == (responseArr.length - 1)) {
                    str = str+'}\n';
                }
                else{
                    str = str+'},\n';
                }
            }
        }

        var json = str+']}';

        var o = eval("("+json+")");

        if(!o) {
            throw {message: "JsonReader.read: Json object not found"};
        }
        if(o.metaData){
            delete this.ef;
            this.meta = o.metaData;
            this.recordType = Ext.data.Record.create(o.metaData.fields);
            this.onMetaChange(this.meta, this.recordType, o);
        }

        return this.readRecords(o);
    },

    // private function a store will implement
    onMetaChange : function(meta, recordType, o){

    },

    /**
     * @ignore
     */
    simpleAccess: function(obj, subsc) {
        return obj[subsc];
    },

    /**
     * @ignore
     */
    getJsonAccessor: function(){
        var re = /[\[\.]/;
        return function(expr) {
            try {
                return(re.test(expr))
                    ? new Function("obj", "return obj." + expr)
                    : function(obj){
                        return obj[expr];
                    };
            } catch(e){}
            return Ext.emptyFn;
        };
    }(),

    /**
     * Create a data block containing Ext.data.Records from an XML document.
     * @param {Object} o An object which contains an Array of row objects in the property specified
     * in the config as 'root, and optionally a property, specified in the config as 'totalProperty'
     * which contains the total size of the dataset.
     * @return {Object} data A data block which is used by an Ext.data.Store object as
     * a cache of Ext.data.Records.
     */
    readRecords : function(o){
        /**
         * After any data loads, the raw JSON data is available for further custom processing.
         * @type Object
         */

        this.jsonData = o;
        var s = this.meta, Record = this.recordType,
            f = Record.prototype.fields, fi = f.items, fl = f.length;

//      Generate extraction functions for the totalProperty, the root, the id, and for each field
        if (!this.ef) {
            if(s.totalProperty) {
                this.getTotal = this.getJsonAccessor(s.totalProperty);
            }
            if(s.successProperty) {
                this.getSuccess = this.getJsonAccessor(s.successProperty);
            }
            this.getRoot = s.root ? this.getJsonAccessor(s.root) : function(p){return p;};
            if (s.id) {
                var g = this.getJsonAccessor(s.id);
                this.getId = function(rec) {
                    var r = g(rec);
                    return (r === undefined || r === "") ? null : r;
                };
            } else {
                this.getId = function(){return null;};
            }
            this.ef = [];
            for(var i = 0; i < fl; i++){
                f = fi[i];
                var map = (f.mapping !== undefined && f.mapping !== null) ? f.mapping : f.name;
                this.ef[i] = this.getJsonAccessor(map);
            }
        }

        var root = this.getRoot(o), c = root.length, totalRecords = c, success = true;
        if(s.totalProperty){
            var v = parseInt(this.getTotal(o), 10);
            if(!isNaN(v)){
                totalRecords = v;
            }
        }
        if(s.successProperty){
            var v = this.getSuccess(o);
            if(v === false || v === 'false'){
                success = false;
            }
        }
        var records = [];
        for(var i = 0; i < c; i++){
            var n = root[i];
            var values = {};
            var id = this.getId(n);
            for(var j = 0; j < fl; j++){
                f = fi[j];
                var v = this.ef[j](n);
                values[f.name] = f.convert((v !== undefined) ? v : f.defaultValue)
            }
            var record = new Record(values, id);
            record.json = n;
            records[i] = record

        }
        return {
            success : success,
            records : records,
            totalRecords : totalRecords
        };
    }
});



Ext.data.XBMCProxy = function(conn){
    Ext.data.XBMCProxy.superclass.constructor.call(this, conn);

    this.conn = conn;
    this.conn.url = null;
    this.useAjax = !conn || !conn.events;

    var actions = Ext.data.Api.actions;
    this.activeRequest = {};
    for (var verb in actions) {
        this.activeRequest[actions[verb]] = undefined
    }
};

Ext.extend(Ext.data.XBMCProxy, Ext.data.DataProxy, {

    getConnection : function() {
        return this.useAjax ? Ext.Ajax : this.conn;
    },

    setUrl : function(url, makePermanent) {
        this.conn.url = url;
        if (makePermanent === true) {
            this.url = url;
            this.api = null;
            Ext.data.Api.prepare(this);
        }
    },

    doRequest : function(action, rs, params, reader, cb, scope, arg) {
        var  o = {
            method: (this.api[action]) ? this.api[action]['method'] : undefined,
            request: {
                callback : cb,
                scope : scope,
                arg : arg
            },
            reader: reader,
            callback : this.createCallback(action, rs),
            scope: this
        };

        o.jsonData = Ext.util.JSON.encode(this.conn.xbmcParams);

        if (params.jsonData) {
            o.jsonData = params.jsonData;
        } else if (params.xmlData) {
            o.xmlData = params.xmlData;
        } else {
            o.params = params || {};
        }

        this.conn.url = this.buildUrl(action, rs);

        if(this.useAjax){

            Ext.applyIf(o, this.conn);

            this.activeRequest[action] = Ext.Ajax.request(o);
        }else{
            this.conn.request(o);
        }
        // request is sent, nullify the connection url in preparation for the next request
        this.conn.url = null;
    },

    createCallback : function(action, rs) {
        return function(o, success, response) {
            this.activeRequest[action] = undefined;
            if (!success) {
                if (action === Ext.data.Api.actions.read) {
                    // @deprecated: fire loadexception for backwards compat.
                    // TODO remove
                    this.fireEvent('loadexception', this, o, response);
                }
                this.fireEvent('exception', this, 'response', action, o, response);
                o.request.callback.call(o.request.scope, null, o.request.arg, false);
                return;
            }
            if (action === Ext.data.Api.actions.read) {
                this.onRead(action, o, response);
            } else {
                this.onWrite(action, o, response, rs);
            }
        };
    },

    onRead : function(action, o, response) {
        var result;
        try {
            result = o.reader.read(response);
        }catch(e){

            this.fireEvent('loadexception', this, o, response, e);

            this.fireEvent('exception', this, 'response', action, o, response, e);
            o.request.callback.call(o.request.scope, null, o.request.arg, false);
            return;
        }
        if (result.success === false) {

            this.fireEvent('loadexception', this, o, response);

            // Get DataReader read-back a response-object to pass along to exception event
            var res = o.reader.readResponse(action, response);
            this.fireEvent('exception', this, 'remote', action, o, res, null);
        }
        else {
            this.fireEvent('load', this, o, o.request.arg);
        }

        o.request.callback.call(o.request.scope, result, o.request.arg, result.success);
    },
    // inherit docs
    destroy: function(){
        if(!this.useAjax){
            this.conn.abort();
        }else if(this.activeRequest){
            var actions = Ext.data.Api.actions;
            for (var verb in actions) {
                if(this.activeRequest[actions[verb]]){
                    Ext.Ajax.abort(this.activeRequest[actions[verb]]);
                }
            }
        }
        Ext.data.HttpProxy.superclass.destroy.call(this);
    }
});
