Ext.define('XWMM.view.movie.MovieDetails', {
    extend: 'Ext.form.Panel',
    alias: 'widget.moviedetails',

    requires: [
        'Ext.layout.container.Form',
        'Ext.form.FieldSet',
        'Ext.form.field.Number',
        'Ext.form.field.ComboBox',
        //'Ext.ux.form.field.Image'
        'XWMM.view.movie.GenreSelectGrid'
    ],

    layout: 'form',
    defaultType: 'textfield',
    bodyPadding: 5,
    autoScroll: true,
    trackResetOnLoad: true,

    buttons: [
        {
            text:'Revert',
            id: 'revertbutton',
            disabled: true,
            handler: function(){
                var me = Ext.getCmp('moviedetails');
                me.getForm().reset();
                me.down('#movie-genres').onResetClick();
                this.disable();
            }
        },
        {
            text:'Save',
            id: 'savebutton',
            disabled: true,
            handler: function(){
                /*
                 Ext.Msg.show ({
                 title: 'Not implemented yet!',
                 msg: 'This feature has not been implemented yet.<br><br>'
                 + 'Action: Save ' + Ext.getCmp('moviedetails').getRecord().get('title'),
                 buttons: Ext.window.MessageBox.OK
                 });
                 */
                var me = Ext.getCmp('moviedetails');
                var dirtyFields = me.getValues(false, true);
                console.log(dirtyFields);
                me.updateRecord();
                this.disable()
            }
        }
    ],

    items: [
        {
            title: 'Title',
            xtype: 'fieldset',
            collapsible: true,
            defaults: {anchor: '100%'},
            layout: 'anchor',
            defaultType: 'textfield',
            items: [
                {
                    fieldLabel: 'Title',
                    name: 'title',
                    allowBlank: false
                },
                {
                    fieldLabel: 'Original Title',
                    name: 'originaltitle'
                },
                {
                    fieldLabel: 'Sort Title',
                    name: 'sorttitle'
                }
            ]
        },
        {
            xtype: 'numberfield',
            fieldLabel: 'Year',
            name: 'year',
            allowDecimals: false,
            allowExponential: false,
            autoStripChars: true,
            decimalPrecision: 0,
            maxValue: 2100,
            minValue: 1890,
            step: 1
        },
        {
            //xtype: 'gridpicker',
            xtype: 'combobox',
            fieldLabel: 'Content Rating',
            name: 'mpaa',
            queryMode: 'local',
            typeAhead: true,
            store: 'ContentRatings',
            displayField: 'xbmc_value', //'rating',
            valueField: 'xbmc_value'
            /*
             gridConfig: {
             features: [{
             ftype: 'grouping',
             groupHeaderTpl: '{name}',
             collapsible: true
             }],
             columns: [{dataIndex: 'rating'}]
             }
             */
        },
        {
            xtype: 'combobox',
            fieldLabel: 'Set',
            name: 'set',
            queryMode: 'local',
            typeAhead: true,
            store: 'MovieSets',
            displayField: 'title',
            valueField: 'title'
        },
        {
            xtype: 'numberfield',
            fieldLabel: 'Rating',
            name: 'rating',
            autoStripChars: true,
            decimalPrecision: 1,
            maxValue: 10,
            minValue: 0,
            step: 0.1
        },
        {
            xtype: 'trigger',
            fieldLabel: 'IMDb ID',
            name: 'imdbnumber',
            onTriggerClick: function(e) {
                var value = this.getValue();
                if (value.length > 0) { // TODO: attempt to check it's the right format /tt[0-9]{7}/
                    window.open('http://www.imdb.com/title/' + value + '/', 'XWMM.external');
                }
                else {
                    Ext.MessageBox.show({
                        title: 'IMDb ID',
                        msg: 'You need to enter an IMDb movie ID before<br>you can visit the movie page on IMDb.com',
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.INFO
                    });
                }
                e.stopEvent();
            }
        },
        {
            title: 'Genre',
            xtype: 'fieldset',
            collapsible: true,
            defaults: {anchor: '100%'},
            layout: 'anchor',
            defaultType: 'textfield',
            items: [
                {
                    name: 'genre',
                    xtype: 'movie-genreselectgrid',
                    id: 'movie-genres'
                }
            ]
        },
        {
            title: 'Plot',
            xtype: 'fieldset',
            collapsible: true,
            defaults: {anchor: '100%'},
            layout: 'anchor',
            defaultType: 'textfield',
            items: [
                {
                    fieldLabel: 'Tagline',
                    name: 'tagline'
                },
                {
                    xtype: 'textarea',
                    fieldLabel: 'Plot',
                    name: 'plot'
                },
                {
                    xtype: 'textarea',
                    fieldLabel: 'Outline',
                    name: 'plotoutline'
                }
            ]
        },
        {
            title: 'Production Details',
            xtype: 'fieldset',
            collapsible: true,
            defaults: {anchor: '100%'},
            layout: 'anchor',
            defaultType: 'textfield',
            items: [
                {
                    fieldLabel: 'Director(s)',
                    name: 'director'
                },
                {
                    fieldLabel: 'Writer(s)',
                    name: 'writer'
                },
                {
                    fieldLabel: 'Studio(s)',
                    name: 'studio'
                },
                {
                    fieldLabel: 'Country',
                    name: 'country'
                },
                {
                    fieldLabel: 'Trailer',
                    name: 'trailer'
                }
            ]
        },
        {
            title: 'File Details',
            xtype: 'fieldset',
            collapsible: true,
            defaults: {anchor: '100%'},
            layout: 'anchor',
            defaultType: 'textfield',
            items: [
                {
                    fieldLabel: 'File Name',
                    name: 'file',
                    readOnly: true
                },
                {
                    fieldLabel: 'Directory',
                    name: 'directory',
                    readOnly: true
                },
                {
                    xtype: 'numberfield',
                    fieldLabel: 'Duration',
                    name: 'runtime',
                    allowDecimals: false,
                    allowExponential: false,
                    autoStripChars: true,
                    decimalPrecision: 0,
                    minValue: 0,
                    step: 1
                }
            ]
        }
    ],

    listeners: {
        'dirtychange': function(form, dirty, eOpts) {
            Ext.getCmp('revertbutton').enable();
            Ext.getCmp('savebutton').enable();
        }
    }
});
