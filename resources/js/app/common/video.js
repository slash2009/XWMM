/* global Ext: false, WIMM: false */
/*
 * Copyright 2014 Andrew Fyfe.
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

Ext.ns('WIMM.video');

(function() {

    /**
     * Cleans the video library from non-existent items.
     */
    WIMM.video.cleanLibrary = function() {
        var request = {
            jsonrpc: '2.0',
            method: 'VideoLibrary.Clean',
            id: 'WIMM'
        };

        xbmcJsonRPC(request);
    };

    /**
     * Scans the video sources for new library items.
     * @param {string} directory Scan a specific directory.
     */
    WIMM.video.scanLibrary = function(directory) {
        var request = {
            jsonrpc: '2.0',
            method: 'VideoLibrary.Scan',
            id: 'WIMM'
        };

        if (directory !== undefined) {
            request.params = { directory: directory };
        }

        xbmcJsonRPC(request);
    };

})();
