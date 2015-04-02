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

var myVersion = '4.1.19';

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

var menuBar = new Ext.Toolbar({
    region: 'north',
    height: 30,

    items: [
        {
            xtype: 'tbbutton',
            text: 'Movies',
            width: 60,
            menu: [
                {
                    text: 'by Title',
                    iconCls: 'silk-grid',
                    handler: function() { window.location = 'movies.html'; }
                },
                {
                    text: 'by Genre',
                    iconCls: 'silk-grid',
                    handler: function() { window.location = 'movies-by-genre.html'; }
                },
                {
                    text: 'by Date Added',
                    iconCls: 'silk-grid',
                    handler: function() { window.location = 'movies-by-date-added.html'; }
                }
            ]
        },
        {
            xtype: 'tbbutton',
            text: 'TV Shows',
            width: 60,
            handler: function() { window.location = 'tv-shows.html'; }
        },
        {
            xtype: 'tbbutton',
            text: 'Music',
            width: 60,
            menu: [
                {
                    text: 'Artist / Album',
                    iconCls: 'silk-grid',
                    handler: function() { window.location = 'music-by-artist.html'; }
                },
                {
                    text: 'Genre / Album',
                    iconCls: 'silk-grid',
                    handler: function() { window.location = 'music-by-genre.html'; }
                },
                {
                    text: 'Year / Album',
                    iconCls: 'silk-grid',
                    handler: function() { window.location = 'music-by-year.html'; }
                }
            ]
        }
    ]
});

var currentRecord;
var DetailsFlag;

var videoFlagsPanel = new Ext.Panel({
    border: false,
    defaults: {
        xtype: 'container',
        height: 48,
        autoEl: { tag: 'img', src: Ext.BLANK_IMAGE_URL },
        cls: 'mediaflag'
    },
    items: [
        {
            id: 'videocodec',
            width: 100
        },
        {
            id: 'resolution',
            width: 64
        },
        {
            id: 'aspect',
            width: 64
        }
    ]
});

var audioFlagsPanel = new Ext.Panel({
    border: false,
    defaults:{
        xtype: 'container',
        height: 48,
        autoEl: { tag: 'img', src: Ext.BLANK_IMAGE_URL },
        cls: 'mediaflag'
    },
    items: [
        {
            id: 'audiocodec',
            width: 100
        },
        {
            id: 'audiochannels',
            width: 64
        }
    ]
});


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
    return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = '';
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
          break;
        case String:
          sExpires = '; expires=' + vEnd;
          break;
        case Date:
          sExpires = '; expires=' + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
    return true;
  },


  removeItem: function (sKey, sPath, sDomain) {
    if (!sKey || !this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + ( sDomain ? '; domain=' + sDomain : '') + ( sPath ? '; path=' + sPath : '');
    return true;
  },
  hasItem: function (sKey) {
    return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=')).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    return aKeys;
  }
};
