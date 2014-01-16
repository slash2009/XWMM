Ext.define('XWMM.model.MovieSet', {
    extend: 'Ext.data.Model',

    idProperty: 'setid',
    fields: [
        {name: 'setid', type: 'int'},
        {name: 'title', type: 'string'},
        {name: 'playcount', type: 'int'},
        {name: 'fanart', type: 'string'},
        {name: 'thumbnail', type: 'string'}
    ]
});
