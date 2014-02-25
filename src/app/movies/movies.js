/*
 * XBMC Web Media Manager
 * https://github.com/slash2009/XWMM
 *
 * Copyright (c) 2011-2014 slash2009
 * Copyright (c) 2014 Andrew Fyfe (fyfe)
 *
 * Licensed under the GNU GPLv2 license.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */


angular.module('movies', ['common'])


.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/movies', {
        templateUrl: 'movies/movies-list.tpl.html',
        controller: 'MoviesCtrl'
    });
}])


.controller('MoviesCtrl', ['$scope', 'XbmcService', function ($scope, XbmcService) {
    'use strict';

    $scope.movies = [];

    $scope.orderCol = 'sorttitle';
    $scope.orderDir = false;


    /**
     * Initialise the controller
     * @method
     * @public
     */
    $scope.init = function() {
        $scope.$on('VideoLibrary.OnRemove', onMovieRemoved);
        $scope.$on('VideoLibrary.OnUpdate', onMovieUpdated);
        $scope.$on('VideoLibrary.OnScanStarted', onScanStarted);
        $scope.$on('VideoLibrary.OnScanFinished', onScanFinished);
        $scope.$on('VideoLibrary.OnCleanStarted', onCleanStarted);
        $scope.$on('VideoLibrary.OnCleanFinished', onCleanFinished);

        getMovies();
    };

    /* ============================================================= *
     * UI Methods                                                    *
     * ============================================================= */

    /**
     * Sort the movie list
     * @param {string} col - the column to sort by
     * @method
     * @public
     */
    $scope.sortBy = function(col) {
        if (col === $scope.orderCol) {
            $scope.orderDir = !$scope.orderDir;
        }
        else {
            $scope.orderCol = col;
            $scope.orderDir = false;
        }
    };

    /**
     * Edit a movie
     * @param {Object} movie - the movie to edit
     * @method
     * @public
     */
    $scope.selectMovie = function(movie) {
        if (!movie.hasOwnProperty('plot')) {
            getMovie(movie.movieid);
        }

        // edit movie
        alert('Not implemented yet!');
    };


    /* ============================================================= *
     * XBMC Commands                                                 *
     * ============================================================= */

    /**
     * Scans the video sources for new library items
     * @public
     * @see [VideoLibrary.Scan]{@link http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary.Scan}
     */
    $scope.updateLibrary = function() {
        var promise = XbmcService.sendCommand('VideoLibrary.Scan', {});
    };

    /**
     * Cleans the video library from non-existent items
     * @public
     * @see [VideoLibrary.Clean]{@link http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary.Clean}
     */
    $scope.cleanLibrary = function() {
        var promise = XbmcService.sendCommand('VideoLibrary.Clean', {});
    };

    /**
     * Exports all items from the video library
     * @public
     * @see [VideoLibrary.Export]{@link http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary.Export}
     */
    $scope.exportLibrary = function() {
        console.info('Export Library: This feature has not been implemented yet.');
    };

    /**
     * Removes the given movie from the library
     * @param {number} movieid - the id of the movie to remove
     * @public
     * @see [VideoLibrary.RemoveMovie]{@link http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary.RemoveMovie}
     */
    $scope.removeMovie = function(movieid) {
        var promise = XbmcService.sendCommand('VideoLibrary.RemoveMovie', {
            movieid: movieid
        });
    };

    /**
     * Retrieve all movies
     * @private
     * @see [VideoLibrary.GetMovies]{@link http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary.GetMovies}
     */
    function getMovies() {
        var promise = XbmcService.sendCommand('VideoLibrary.GetMovies', {
            properties: ['title', 'sorttitle', 'year', 'playcount', 'set'],
            sort: {order: 'ascending', ignorearticle: true, method: 'sorttitle'}
        });

        promise.then(
            function(result) {
                if (result === undefined) {
                    return;
                }

                for (var i = 0; i < result.movies.length; i++) {
                    if (result.movies[i].sorttitle === '') {
                        if (result.movies[i].title.substr(0, 4).toLowerCase() === 'the ') {
                            result.movies[i].sorttitle = result.movies[i].title.substr(4);
                        }
                        else {
                            result.movies[i].sorttitle = result.movies[i].title;
                        }
                    }
                }
                $scope.movies = result.movies;
            },
            function(reason) { console.error('Error: ', reason); },
            function(update) { console.log('Update: ', update); }
        );
    }

    /**
     * Retrieve details about a specific movie
     * @param {number} movieid - the id of the movie to retrieve
     * @private
     * @see [VideoLibrary.GetMovieDetails]{@link http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary.GetMovieDetails}
     */
    function getMovie(movieid, detailed) {
        if (movieid < 0) {
            console.error(
                'ERROR: MovieListCtrl.getMovie(): movieid must be >= 0.',
                movieid);
            return;
        }

        var properties;
        if (detailed) {
            properties = [
                'title',
                'genre',
                'year',
                'rating',
                'director',
                'trailer',
                'tagline',
                'plot',
                'plotoutline',
                'originaltitle',
                'lastplayed',
                'playcount',
                'writer',
                'studio',
                'mpaa',
                'cast',
                'country',
                'imdbnumber',
                'runtime',
                'set',
                'showlink',
                'streamdetails',
                'top250',
                'votes',
                'fanart',
                'thumbnail',
                'file',
                'sorttitle',
                'resume',
                'setid',
                'dateadded',
                'tag',
                'art'
            ];
        }
        else {
            properties = ['title', 'sorttitle', 'year', 'playcount', 'set'];
        }

        var promise = XbmcService.sendCommand('VideoLibrary.GetMovieDetails', {
            movieid: movieid,
            properties: properties
        });

        promise.then(
            function(result) {
                if (result === undefined) {
                    return;
                }

                for (var i = 0; i < $scope.movies.length; i++) {
                    if ($scope.movies[i].movieid === result.moviedetails.movieid) {
                        // Replace the basic movie info with the detailed one
                        $scope.movies[i] = result.moviedetails;
                        break;
                    }
                }
            },
            function(reason) { console.error('Error: ', reason); },
            function(update) { console.log('Update: ', update); }
        );
    }


    /* ============================================================= *
     * Notification Handlers                                         *
     * ============================================================= */

    /**
     * A video library scan has started.
     * @param {Object} e - Angular.js [event object]{@link http://docs.angularjs.org/api/ng/type/$rootScope.Scope#$on}
     * @param {?Object} data - null
     * @private
     * @see [VideoLibrary.OnScanStarted]{@link http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary.OnScanStarted}
     */
    function onScanStarted(e, data) {
        $scope.scan_updates = [];  // See note in onMovieUpdated()
    }

    /**
     * Scanning the video library has been finished.
     * @param {Object} e - Angular.js [event object]{@link http://docs.angularjs.org/api/ng/type/$rootScope.Scope#$on}
     * @param {?Object} data - null
     * @private
     * @see [VideoLibrary.OnScanFinished]{@link http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary.OnScanFinished}
     */
    function onScanFinished(e, data) {
        $scope.scan_updates = [];  // See note in onMovieUpdated()
    }

    /**
     * A video library clean operation has started.
     * @param {Object} e - Angular.js [event object]{@link http://docs.angularjs.org/api/ng/type/$rootScope.Scope#$on}
     * @param {?Object} data - null
     * @private
     * @see [VideoLibrary.OnCleanStarted]{@link http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary.OnCleanStarted}
     */
    function onCleanStarted(e, data) {
    }

    /**
     * The video library has been cleaned.
     * @param {Object} e - Angular.js [event object]{@link http://docs.angularjs.org/api/ng/type/$rootScope.Scope#$on}
     * @param {?Object} data - null
     * @private
     * @see [VideoLibrary.OnCleanFinished]{@link http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary.OnCleanFinished}
     */
    function onCleanFinished(e, data) {
    }

    /**
     * A video item has been removed.
     * @param {Object} e - Angular.js [event object]{@link http://docs.angularjs.org/api/ng/type/$rootScope.Scope#$on}
     * @param {Object} data - object containing type of item removed and id of item removed
     * @private
     * @see [VideoLibrary.OnRemove]{@link http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary.OnRemove}
     */
    function onMovieRemoved(e, data) {
        if (data.type !== 'movie') {  // We only care about movies
            return;
        }

        var index = -1;
        for (var i = 0, len = $scope.movies.length; i < len; i++) {
            if ($scope.movies[i].movieid === data.id) {
                index = i;
                break;
            }
        }

        if (index > -1) {
            $scope.$apply(function(){ $scope.movies.splice(index, 1); });
        }
    }

    /**
     * A video item has been updated.
     * @param {Object} e - Angular.js [event object]{@link http://docs.angularjs.org/api/ng/type/$rootScope.Scope#$on}
     * @param {Object} data - object containing type of item removed and id of item removed
     * @private
     * @see [VideoLibrary.OnUpdate]{@link http://wiki.xbmc.org/index.php?title=JSON-RPC_API/v6#VideoLibrary.OnUpdate}
     */
    function onMovieUpdated(e, data) {
        if (data.item.type !== 'movie') {  // We only care about movies
            return;
        }

        /*
         * For some strange reason XBMC sends out duplicate MovieUpdated notifications
         * during scan. This keeps track of what movies we've added in this update, so
         * that each movie is only added once.
         *
         * TODO: Is this a bug in XBMC? Has it been reported?
         */
        if ($.inArray(data.item.id, $scope.scan_updates) > -1) {
            return;  // Update has already been processed
        }
        else {
            $scope.scan_updates.push(data.item.id);
        }

        var promise = getMovie(data.item.id, false);
        if (promise === undefined) {
            return;
        }
        promise.then(
            function(result) { $scope.movies.push(result.moviedetails); },
            function(reason) { console.error('Error: ', reason); },
            function(update) { console.log('Update: ', update); }
        );
    }

}])


.filter('watched', function() {
    return function(input) {
        var playcount = parseInt(input);
        if (isNaN(playcount) || playcount < 1) {
            return '';
        }
        if (playcount === 1) {
            return 'Watched once.';
        }
        if (playcount === 2) {
            return 'Watched twice.';
        }

        return 'Watched ' + playcount + ' times.';
    };
})

;
