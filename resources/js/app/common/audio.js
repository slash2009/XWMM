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

Ext.ns('WIMM.audio');

(function() {

    /**
     * Cleans the audio library from non-existent items.
     */
    WIMM.audio.cleanLibrary = function() {
        var request = {
            jsonrpc: '2.0',
            method: 'AudioLibrary.Clean',
            id: 'WIMM'
        };

        kodiJsonRPC(request);
    };

    /**
     * Scans the audio sources for new library items.
     * @param {string} directory Scan a specific directory.
     */
    WIMM.audio.scanLibrary = function(directory) {
        var request = {
            jsonrpc: '2.0',
            method: 'AudioLibrary.Scan',
            id: 'WIMM'
        };

        if (directory !== undefined) {
            request.params = { directory: directory };
        }

        kodiJsonRPC(request);
    };

})();
