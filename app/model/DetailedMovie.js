Ext.define('XWMM.model.DetailedMovie', {
    extend: 'Ext.data.Model',

    idProperty: 'movieid',
    fields: [
        {name: 'movieid', type: 'int'},
        {name: 'title', type: 'string'},
        {name: 'sorttitle', type: 'string'},
        {name: 'year', type: 'int'},
        {name: 'playcount', type: 'int'},
        {name: 'set', type: 'string'},

        {name: 'genre'},
        {
            name: 'rating',
            convert: function(v, r) {
                if (v == undefined || v.length == 0) {
                    return 0;
                }
                else {
                    return parseFloat(v).toFixed(1);
                }
            }
        },
        {
            name: 'runtime',
            convert: function(v, r) {
                if (v == undefined || v.length == 0) {
                    return 0;
                }
                else {
                    return Math.round(v / 60);
                }
            }
        },
        {name: 'plot', type: 'string'},
        {name: 'plotoutline', type: 'string'},
        {name: 'tagline', type: 'string'},
        {
            name: 'director',
            convert: function(v, r) {
                if (v == undefined || v.length == 0) {
                    return '';
                }
                else {
                    return v.join(XWMM.Application.listSeparator);
                }
            }
        },
        {
            name: 'writer',
            convert: function(v, r) {
                if (v == undefined || v.length == 0) {
                    return '';
                }
                else {
                    return v.join(XWMM.Application.listSeparator);
                }
            }
        },
        {name: 'mpaa', type: 'string'},
        {
            name: 'studio',
            convert: function(v, r) {
                if (v == undefined || v.length == 0) {
                    return '';
                }
                else {
                    return v.join(XWMM.Application.listSeparator);
                }
            }
        },
        {name: 'trailer', type: 'string'},
        {
            name: 'streamdetails',
            convert: function(v, r) {
                if (v == undefined || v.length == 0) {
                    return false;
                }
                else {
                    return v;
                }
            }
        },
        {name: 'originaltitle', type: 'string'},
        {name: 'set', type: 'string'},
        {name: 'imdbnumber', type: 'string'},
        {
            name: 'country',
            convert: function(v, r) {
                if (v == undefined || v.length == 0) {
                    return '';
                }
                else {
                    return v.join(XWMM.Application.listSeparator);
                }
            }
        },
        {
            name: 'file',
            convert: function (v, r) {
                if (v == undefined || v.length == 0) {
                    return '';
                }
                else {
                    var x;
                    x = v.lastIndexOf('/');
                    if (x >= 0) // Unix-based path
                        return v.substr(x+1);
                    x = v.lastIndexOf('\\');
                    if (x >= 0) // Windows-based path
                        return v.substr(x+1);
                    return v; // just the filename
                }
            }
        },
        {
            name: 'directory',
            mapping: 'file',
            convert: function (v, r) {
                if (v == undefined || v.length == 0) {
                    return '';
                }
                else {
                    var x;
                    x = v.lastIndexOf('/');
                    if (x >= 0) // Unix-based path
                        return v.substr(0, x+1);
                    x = v.lastIndexOf('\\');
                    if (x >= 0) // Windows-based path
                        return v.substr(0, x+1);
                    return v; // just the directory
                }
            }
        },

        // Artwork
        {
            name: 'poster',
            mapping: 'thumbnail',
            convert: function(v, r) {
                if (v == undefined || v.length == 0) {
                    return '';
                }
                else {
                    // subtract image:// from the start and / from the end.
                    return v.substr(8, v.length - 9);
                }
            }
        },
        {
            name: 'fanart',
            convert: function(v, r) {
                if (v == undefined || v.length == 0) {
                    return '';
                }
                else {
                    // subtract image:// from the start and / from the end.
                    return v.substr(8, v.length - 9);
                }
            }
        }
    ]
});
