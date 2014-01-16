Ext.define('XWMM.view.movie.GenreSelectGrid', {
    extend: 'Ext.Container',

    requires: [
        'Ext.grid.plugin.DragDrop',
        'Ext.layout.container.HBox',
        'XWMM.model.Genre',
        'XWMM.store.Genres'
    ],

    xtype: 'movie-genreselectgrid',


    width: 500,
    height: 200,
    layout: {
        type: 'hbox',
        align: 'stretch',
        padding: 5
    },

    value: [],

    initComponent: function(){
        var group1 = this.id + 'available',
            group2 = this.id + 'selected',
            columns = [{text: 'Genre', flex: 1, sortable: true, hideable: false, resizable: false, dataIndex: 'title'}];

        this.items = [
            {
                itemId: 'available',
                flex: 1,
                xtype: 'grid',
                multiSelect: true,
                viewConfig: {
                    plugins: {
                        ptype: 'gridviewdragdrop',
                        dragGroup: group1,
                        dropGroup: group2
                    }
                },
                emptyText: 'No genres found.',
                enableColumnHide: false,
                store: 'Genres',
                columns: columns,
                stripeRows: true,
                title: 'Available Genres',
                tools: [
                    {
                        type: 'plus',
                        tooltip: 'Add new genre',
                        scope: this,
                        handler: this.onAddClick
                    },
                    {
                        type: 'refresh',
                        tooltip: 'Revert changes',
                        scope: this,
                        handler: this.onResetClick
                    },
                    {
                        type: 'help',
                        tooltip: "Add genres by dragging them to the 'Selected Genres' box."
                    }
                ],
                margins: '0 5 0 0'
            },
            {
                itemId: 'selected',
                flex: 1,
                xtype: 'grid',
                viewConfig: {
                    plugins: {
                        ptype: 'gridviewdragdrop',
                        dragGroup: group2,
                        dropGroup: group1
                    }
                },
                emptyText: 'No genres selected.',
                enableColumnHide: false,
                store: new Ext.data.Store({model: XWMM.model.Genre}),
                columns: columns,
                stripeRows: true,
                title: 'Selected Genres',
                tools: [
                    {
                        type: 'help',
                        tooltip: "Remove genres by dragging them to the 'Available Genres' box."
                    }
                ]
            }
        ];

        this.callParent();
    },

    loadGenre: function(genres) {
        var available = this.down('#available').getStore();
        var selected = this.down('#selected').getStore();

        //available.suspendEvents(true);
        //selected.suspendEvents(true);

        this.value = genres;
        selected.removeAll();
        available.load({
            scope: this,
            callback: function(records, operation, success) {
                if (success) {
                    for (var i = 0, len = genres.length; i < len; i++) {
                        var record = available.findRecord('title', genres[i], false, false, true);
                        if (record !== null) {
                            available.remove(record);
                            selected.add(record);
                        }
                        else {
                            record = new XWMM.model.Genre({title: genres[i]});
                            selected.add(record);
                        }
                    }
                }
            }

        });


        //available.resumeEvents();
        //selected.resumeEvents();
    },

    onAddClick: function() {
        var me = this;
        Ext.MessageBox.prompt(
            'Add Genre',
            'Enter the name of the genre you would like to add:',
            function(btn, text) {
                if (btn == 'ok') {
                    var newGenre = new XWMM.model.Genre({title: text});
                    me.down('#available').getStore().add(newGenre);
                }
            },
            me);
    },

    onResetClick: function() {
        //refresh source grid
        //this.down('#available').getStore().reload();

        //purge destination grid
        //this.down('#selected').getStore().removeAll();

        this.loadGenre(this.value);
    }
});
