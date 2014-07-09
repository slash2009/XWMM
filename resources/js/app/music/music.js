/*
 * Copyright 2011 slash2009.
 * Copyright 2013 Zernable.
 * Copyright 2013 uNiversal.
 * Copyright 2013, 2014 Andrew Fyfe.
 *
 * This file is part of XBMC Web Media Manager (XWMM).
 *
 * XWMM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * XWMM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with XWMM.  If not, see <http://www.gnu.org/licenses/>.
 */

// -----------------------------------------
// music.js
// last modified : 31-12-2009
//
//------------------------------------------

Ext.ns('Audio');


//Main Panel
Audio.Mainpanel = Ext.extend(Ext.Panel, {
    initComponent: function() {
        Ext.applyIf(this, {
        frame: true,
        title: 'Audio List',
        width: 1250,
        height: 700,
        loadMask: true,
        layout: 'border',
        renderTo: Ext.getBody(),
        items: [
            menuBar,
            AlbumGrid,
        {
            xtype: 'panel',
            region: 'center',
            defaults:{xtype:'container'},
            items: [
                albumDetailPanel,
                SongGrid
            ]
        },{
            xtype: 'panel',
            region:'east',
            margins:'5 5 5 5',
            split:true,
            width: 200,
            items: [{
                layout:'accordion',
                height: 500,
                items:[Genregrid, ArtistGrid]
            }]
        }]
        });

        Audio.Mainpanel.superclass.initComponent.call(this);
    },

    initEvents: function() {
        Audio.Mainpanel.superclass.initEvents.call(this);
        var currentAlbum = this.getComponent('albumGrid').getSelectionModel();

        currentAlbum.on('rowselect', this.onRowSelect, this);

        //add double-click event to cover object
        var element = AlbumCover.getEl();
        element.on('dblclick', function(){ChangeImages(currentRecord);});
    },

    onRowSelect: function(sm, rowIdx, r) {

        currentRecord = r;

        if (r.data.details === undefined){
            GetAlbumDetails(r);
        }

        //albumDetailPanel.getForm().loadRecord(r);
        standardInfo.getForm().loadRecord(r);
        extraInfo.getForm().loadRecord(r);
        albumDescription.getForm().loadRecord(r);
        albumDetailPanel.setTitle('<div align="center">'+r.data.strAlbum+'  /  '+r.data.strArtist+'</div>');

        AlbumCover.updateSrc(r.data.currentThumbnail);

        if (r.data.rating < 10) { AlbumStars.updateSrc(r);}

        r.data.details = true;

        SongStore.proxy.conn.jsonData = {'jsonrpc': '2.0', 'method': 'AudioLibrary.GetSongs', 'params': {'properties': [ 'track', 'artist', 'duration'], 'filter': {'albumid': r.data.albumid}},'id': 1};

        //SongStore.proxy.conn.url = '/xbmcCmds/xbmcHttp?command=querymusicdatabase(select idSong, strTitle, iTrack, iDuration, iYear, strFileName, rating, idAlbum, strAlbum, strPath, idArtist, strArtist, idGenre, strGenre FROM songview WHERE idAlbum = '+r.data.albumid+')';
        SongStore.load();
        Ext.getCmp('savebutton').disable();
    }
});
Ext.reg('Mainpanel', Audio.Mainpanel);
