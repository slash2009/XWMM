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

angular.module('xwmm', [
    'ngRoute',
    'common',
    'movies',
    'templates.app',
    'templates.common'
]);


angular.module('xwmm').config(['$routeProvider', function($routeProvider) {
    'use strict';

    $routeProvider.when('/about', {
        templateUrl: 'about.tpl.html'
    }).
    otherwise({
        redirectTo: '/about'
    });

    /* NOTE: Don't enable $locationProvider.html5Mode. This requires a
     *       little magic on the server side which we can't do with
     *       XBMC as its not a real web server.
     */
    //$locationProvider.html5Mode(true);
}]);


angular.module('xwmm').controller('AppCtrl', ['$scope', function($scope) {
    'use strict';

    // TODO: pull this from package.json at build time
    $scope.version = '5.0.0';
    $scope.contributors = [
        {
          "name": "Zernable",
          "email": ""
        },
        {
          "name": "MokuJinJin",
          "email": ""
        },
        {
          "name": "nwtn",
          "email": "https://github.com/nwtn"
        },
        {
          "name": "uNiversaI",
          "email": "https://github.com/uNiversaI"
        },
        {
          "name": "fyfe",
          "email": "https://github.com/fyfe"
        }
    ];
}]);


angular.module('xwmm').controller('HeaderCtrl', ['$scope', '$location', function($scope, $location) {
    'use strict';

    /**
     * Check if the location passed in is the currently active
     * @param {string} viewLocation - the location to check
     * @public
     */
    $scope.isPageActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
}]);
