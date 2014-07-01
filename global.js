var myVersion = '4.0.2'

/**
 * Protect window.console method calls, e.g. console is not defined on IE
 * unless dev tools are open, and IE doesn't define console.debug
 */
(function() {
    if (!window.console) {
        window.console = {};
    }
    // union of Chrome, FF, IE, and Safari console methods
    var m = [
        'log', 'info', 'warn', 'error', 'debug', 'trace', 'dir', 'group',
        'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'profile', 'profileEnd',
        'dirxml', 'assert', 'count', 'markTimeline', 'timeStamp', 'clear'
    ];
    var noop = function() {};
    // define undefined methods as noops to prevent errors
    for (var i = 0, len = m.length; i < len; i++) {
        if (!window.console[m[i]]) {
            window.console[m[i]] = noop;
        }
    }
})();

function mergeJson(object1, object2) {
    var i;
    for (i in object2)
        object1[i]=object2[i];
}

function removeSpace(string) {
    string = string.replace(/^\s*|\s*$/g,'');
    return string;
}

var menuBar = new Ext.Toolbar({
    region: "north",
    height: 30,
    items: [{
        xtype: 'tbspacer'
        },{
            xtype: 'tbbutton',
            text: 'Movies',
            width: 60,
            menu: [{
                text: 'Movies List',
                iconCls: 'silk-grid',
                handler: function(){window.location = '../movies/index.html'}
            },{
                text: 'Movies by Genre',
                disabled: 'true',
                iconCls: 'silk-grid',
                handler: function(){window.location = '../movies/moviegenre.html'}
            },{
                text: 'Most recent',
                iconCls: 'silk-grid',
                handler: function(){window.location = '../movies/movierecent.html'}
            }]
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbbutton',
            text: ' TV-Shows ',
            width: 60,
            handler: function(){window.location = '../tvshows/index.html'}
        },{
            xtype: 'tbspacer'
        },{
            xtype: 'tbbutton',
            text: 'Music',
            width: 60,
            menu: [{
                text: 'Artist / Album',
                iconCls: 'silk-grid',
                handler: function(){window.location = '../music/index.html'}
            },{
                text: 'Genre / Album',
                iconCls: 'silk-grid',
                handler: function(){window.location = '../music/albumgenres.html'}
            },{
                text: 'Year / Album',
                iconCls: 'silk-grid',
                handler: function(){window.location = '../music/yearalbum.html'}
            }]
        }]
})


Number.prototype.unsign = function(bytes) {
  return this >= 0 ? this : this - Number.MIN_VALUE*2;
};

function parseXBMCXml(xmlString) {

    var tempTable = xmlString.replace(/<\/thumb>/g, ";");
    tempTable = tempTable.replace(/<([^>]+)>/g,'');
    tempTable = tempTable.split(";");
    var x = tempTable.pop();
    return tempTable;
}

function copyXBMCVideoThumb(thumb, r, element, type) {

    var src = 'special://profile/Thumbnails/Video/'+thumb.substring(0,1)+'/'+thumb+'.tbn';
    var dst = 'special://xbmc/web/XWMM/cache/Video/'+thumb.substring(0,1)+'/'+thumb+'.tbn';
    var inputUrl = '/xbmcCmds/xbmcHttp?command=FileCopy('+src+';'+dst+')';
    var temp = '';
    Ext.Ajax.request({
        url: inputUrl,
        //async: false,
        method: 'GET',
        success: function (t){
            // if (type == 'season') {
                // if (t.responseText.substr(11,5) == 'Error'){temp = '../images/nobanner.png'}
                    // else {temp = '../cache/Video/'+thumb.substring(0,1)+'/'+thumb+'.tbn'};
                // r.data.seasonCover = temp;
                // element.el.dom.src = r.data.seasonCover
            // }
            // else {
                if (t.responseText.substr(11,5) == 'Error'){temp = '../images/nobanner.png'}
                    else {temp = '../cache/Video/'+thumb.substring(0,1)+'/'+thumb+'.tbn'};
                r.data.ShowCover = temp;
                element.el.dom.src = r.data.ShowCover
            //};
        },
        failure: function(t){},
        timeout: 2000
    })
};

var responseFinale = [];
var movieTable = [];
var currentShowPath;
var selectedMovie;
var currentRecord;
var currentMovie;
var DetailsFlag;
var detailPanel;

var VideoFlagsPanel = new Ext.Panel({
    border: false,
    defaults:{xtype:'container'},
    items: [{
        id: 'videocodec',
        width:84,
        height:31,
        autoEl: {tag: 'img', src: "../images/flags/default.png"}
    },{
        width:84,
        height:31,
        id: 'resolution',
        autoEl: {tag: 'img', src: "../images/flags/defaultscreen.png"}
    },{
        id: 'aspect',
        width:48,
        height:31,
        autoEl: {tag: 'img', src: "../images/flags/default.png"}
    }]
});

var AudioFlagsPanel = new Ext.Panel({
    border: false,
    defaults:{xtype:'container', width: 64, height: 44},
    items: [{
        id: 'audiocodec',
        autoEl: {tag: 'img', src: "../images/flags/defaultsound.png"}
    },{
        id: 'audiochannels',
        autoEl: {tag: 'img', src: "../images/flags/0c.png"}
    }]
});

function findResolution(iWidth) {

if (iWidth == 0)
    return "defaultscreen";
else if (iWidth < 721)
    return "480";
  // 960x540
else if (iWidth < 961)
    return "540";
  // 1280x720
else if (iWidth < 1281)
    return "720";
  // 1920x1080
else
    return "1080";

}

function findAspect(vAspect) {
if (vAspect == 0)
    return "default";
if (vAspect < 1.4)
    return "1.33";
else if (vAspect < 1.7)
    return "1.66";
else if (vAspect < 1.8)
    return "1.78";
else if (vAspect < 1.9)
    return "1.85";
else if (vAspect < 2.3)
    return "2.20";
else
    return "2.35";
}


var savingMessage = new Ext.LoadMask(Ext.getBody(), {msg:"Please wait..."});



/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path], domain)
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
  getItem: function (sKey) {
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    return true;
  },


  removeItem: function (sKey, sPath, sDomain) {
    if (!sKey || !this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    return aKeys;
  }
};
