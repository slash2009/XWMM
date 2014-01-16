Ext.define('XWMM.model.Movie', {
    extend: 'Ext.data.Model',

    idProperty: 'movieid',
    fields: [
        {name: 'movieid', type: 'int'},
        {name: 'title', type: 'string'},
        {name: 'sorttitle', type: 'string'},
        {name: 'year', type: 'int'},
        {name: 'playcount', type: 'int'},
        {name: 'set', type: 'string'}
    ]
});
