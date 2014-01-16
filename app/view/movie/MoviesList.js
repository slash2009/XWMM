Ext.define('XWMM.view.movie.MoviesList', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.movieslist',

    requires: [
        'Ext.grid.column.Action'
    ],

    //title: 'Movies',
    store: 'Movies',

    emptyText: 'No movies found.',
    enableColumnHide: false,

    columns: [
        { text: 'Title',  dataIndex: 'title', hideable: false, flex: 1 },
        { text: 'Year', dataIndex: 'year', flex: 0.25, groupable: true },
        { text: 'Watched', dataIndex: 'playcount', flex: 0.25, sortable: false },
        { text: 'In Set', dataIndex: 'set', flex: 0.25, sortable: false },
        {
            xtype: 'actioncolumn',
            width: 25,
            menuDisabled: true,
            items: [{
                iconCls: 'icon-delete',
                //icon: 'resources/images/icons/delete.png',
                tooltip: 'Delete'
            }]
        }
    ],
/*
    tbar: [
        {
            text: 'Refresh',
            handler: function(b, e) { this.refreshLibrary(); }
        },
        {
            text: 'Clean',
            handler: function(b, e) { this.cleanLibrary(); }
        }
    ],
*/
    initComponent: function() {
        this.callParent(arguments);

        this.columns[2].renderer = this.renderWatched;
        this.columns[3].renderer = this.renderInSet;
    },

    renderInSet: function(value, metaData, record, row, col, store, gridView) {
        if (value.length > 0) {
            metaData.innerCls = 'icon-inset';
            //return 'Yes';
        }
        else {
            metaData.innerCls = 'icon-notinset';
            //return 'No';
        }

        return '';
    },

    renderWatched: function(value, metaData, record, row, col, store, gridView) {
        if (value > 0) {
            metaData.innerCls = 'icon-watched';
            //return 'Yes';
        }
        else {
            metaData.innerCls = 'icon-unwatched';
            //return 'No';
        }

        return '';
    },

    refreshLibrary: function() {
        console.log('TODO: Refresh Library...')
    },

    cleanLibrary: function() {
        console.log('TODO: Clean Library...')
    }
});
