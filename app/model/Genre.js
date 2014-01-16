Ext.define('XWMM.model.Genre', {
    extend: 'Ext.data.Model',

    idProperty: 'genreid',
    fields: [
        {name: 'genreid', type: 'int'},
        {name: 'title', type: 'string'},
        {name: 'thumbnail', type: 'string'}
    ]
});
