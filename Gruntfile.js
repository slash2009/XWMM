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

module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        distdir: 'build/webinterface.XWMM',
        pkg: grunt.file.readJSON('package.json'),

        clean: ['<%= distdir %>/*'],

        concat: {
            angular: {
                src: ['src/vendor/angular/*.js'],
                dest: '<%= distdir %>/js/vendor/angular.js'
            },
            bootstrap_js: {
                src: ['src/vendor/bootstrap/*.js'],
                dest: '<%= distdir %>/js/vendor/js/bootstrap.js'
            },
            jquery: {
                src: ['src/vendor/jquery/*.js'],
                dest: '<%= distdir %>/js/vendor/jquery.js'
            },
            modernizr : {
                src: ['src/vendor/modernizr/*.js'],
                dest: '<%= distdir %>/js/vendor/modernizr.js'
            },
            bootstrap_css: {
                src: ['src/vendor/bootstrap/css/*.css'],
                dest: '<%= distdir %>/css/vendor/bootstrap.css'
            }
        },

        copyto: {
            assets: {
                files: [
                    { cwd: './src/assets/', src: ['**/*'], dest: '<%= distdir %>/'  },
                    { cwd: './', src: ['changelog.txt','LICENSE.txt', 'README.md'], dest: '<%= distdir %>/' }
                ],
                options: {
                    ignore: ['**/README.md']
                }
            },
            bootstrap_assets: {
                files: [
                    { cwd: './src/vendor/bootstrap/fonts/', src: ['**/*'], dest: '<%= distdir %>/fonts/'  },
                ]
            }
        },

        jshint: {
            // define the files to lint
            files: [
                'gruntfile.js',
                'src/app/**/*.js',
                'test/**/*.js'
            ]
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-copy-to');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'concat', 'copyto']);
};
