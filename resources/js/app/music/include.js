/*
 * Copyright 2011 slash2009.
 * Copyright 2013 Zernable.
 * Copyright 2013 uNiversal.
 * Copyright 2013, 2014 Andrew Fyfe.
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

function updateMusicAlbum() {
    var record = Ext.getCmp('albumGrid').getSelectionModel().getSelected();

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
            var myText;
            if (v === 30) {
                Ext.MessageBox.hide();
            }
            else {
                var i = v/29;
                if (v === 1) {
                    myText = 'Checking changes...';
                    if (standardInfo.getForm().isDirty()) {
                        updateXBMCTables(standardInfo.form, 'album', AlbumGrid.getSelectionModel().getSelected().data.albumid);
                        myText = 'updating Album info';
                    }
                }
                if (v === 19) {
                    if ((extraInfo.getForm().isDirty()) || (albumDescription.getForm().isDirty())) {
                        updateXBMCTables(extraInfo.form, 'albuminfo', AlbumGrid.getSelectionModel().getSelected().data.albumid);
                        updateXBMCTables(albumDescription.form, 'albuminfo', AlbumGrid.getSelectionModel().getSelected().data.albumid);
                        myText = 'updating Extra info';
                    }
                }
                Ext.MessageBox.updateProgress(i, myText);
            }
        };
    };
    for (var i = 1; i < 31; i++) {
        setTimeout(f(i), i*100);
    }
}

function GetAlbumDetails(record) {
    var request = {
        jsonrpc: '2.0',
        method: 'AudioLibrary.GetAlbumDetails',
        params: {
            albumid: record.data.albumid,
            properties: [
                'description', 'theme', 'mood', 'style',
                'type', 'albumlabel', 'rating', 'thumbnail'
            ]
        },
        id: 'XWMM'
    };
    var response = xbmcJsonRPC(request);
    XWMM.util.merge2Objects(record.data, response.albumdetails);

    record.data.theme = XWMM.util.convertArrayToList(response.albumdetails.theme, ' | ');
    record.data.mood = XWMM.util.convertArrayToList(response.albumdetails.mood, ' | ');
    record.data.style = XWMM.util.convertArrayToList(response.albumdetails.style, ' | ');
    record.data.rating = XWMM.util.convertRating(record.data.rating);
    if (record.data.rating < 0) {
        record.data.rating = 0;
    }
    record.data.thumbnail = '/image/' + encodeURI(record.data.thumbnail);
    record.data.details = true;
}
