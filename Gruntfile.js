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

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-copy-to');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-html2js');

    grunt.registerTask('default', ['jshint', 'build']);
    grunt.registerTask('build', ['clean', 'html2js', 'concat', 'copyto']);

    // Project configuration.
    grunt.initConfig({
        distdir: 'build/webinterface.XWMM',
        pkg: grunt.file.readJSON('package.json'),

        banner:
            '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */\n',
        src: {
            js: ['src/**/*.js'],
            jsTpl: ['<%= distdir %>/templates/**/*.js'],
            tpl: {
                app: ['src/app/**/*.tpl.html'],
                common: ['src/common/**/*.tpl.html']
            },
        },

        clean: ['<%= distdir %>/*'],

        concat: {
            dist: {
                options: {
                    banner: "<%= banner %>"
                },
                src: ['<%= src.js %>', '<%= src.jsTpl %>'],
                dest: '<%= distdir %>/js/<%= pkg.name %>.js'
            },
            index: {
                src: ['src/index.html'],
                dest: '<%= distdir %>/index.html',
                options: {
                    process: true
                }
            },
            angular: {
                src: ['vendor/angular/*.js'],
                dest: '<%= distdir %>/js/vendor/angular.js'
            },
            bootstrap_js: {
                src: ['vendor/bootstrap/js/*.js'],
                dest: '<%= distdir %>/js/vendor/bootstrap.js'
            },
            jquery: {
                src: ['vendor/jquery/*.js'],
                dest: '<%= distdir %>/js/vendor/jquery.js'
            },
            modernizr : {
                src: ['vendor/modernizr/*.js'],
                dest: '<%= distdir %>/js/vendor/modernizr.js'
            },
            bootstrap_css: {
                src: ['vendor/bootstrap/css/*.css'],
                dest: '<%= distdir %>/css/vendor/bootstrap.css'
            },
            css: {
                src: ['src/css/*.css'],
                dest: '<%= distdir %>/css/XWMM.css'
            },
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
                    { cwd: './vendor/bootstrap/fonts/', src: ['**/*'], dest: '<%= distdir %>/css/fonts/'  },
                ]
            }
        },

        html2js: {
            app: {
                options: {
                    base: 'src/app'
                },
                src: ['<%= src.tpl.app %>'],
                dest: '<%= distdir %>/templates/app.js',
                module: 'templates.app'
            },
            common: {
                options: {
                    base: 'src/common'
                },
                src: ['<%= src.tpl.common %>'],
                dest: '<%= distdir %>/templates/common.js',
                module: 'templates.common'
            }
        },

        jshint: {
            // define the files to lint
            files:['gruntFile.js', '<%= src.js %>', '<%= src.jsTpl %>'],
            options:{
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                globals: {}
            }
        }

    });

};
