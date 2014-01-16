Ext.define('XWMM.store.ContentRatings', {
    extend: 'Ext.data.ArrayStore',

    storeId: 'contentRatingsStore',
    // TODO: Don't auto load, only load the store when the movie tab is first loaded.
    autoLoad: true,

    fields: ['country', 'rating', 'xbmc_value'],
    groupField: 'country',
    data: [
        // source: http://forum.xbmc.org/showthread.php?tid=165818
        // Australia
        ['Australia', 'G', 'Australia:G'],
        ['Australia', 'PG', 'Australia:PG'],
        ['Australia', 'M', 'Australia:M'],
        ['Australia', 'MA', 'Australia:MA'],
        ['Australia', 'R', 'Australia:R'],
        ['Australia', 'X', 'Australia:X'],
        // France
        ['France', 'U', 'France:U'],
        ['France', '10', 'France:-10'],
        ['France', '12', 'France:-12'],
        ['France', '16', 'France:-16'],
        ['France', '18', 'France:-18'],
        // Germany
        ['Germany', '0', 'Germany:0'],
        ['Germany', '6', 'Germany:6'],
        ['Germany', '12', 'Germany:12'],
        ['Germany', '16', 'Germany:16'],
        ['Germany', '18', 'Germany:18'],
        // UK
        ['UK', 'U', 'UK:U'],
        ['UK', 'PG', 'UK:PG'],
        ['UK', '12A', 'UK:12A'],
        ['UK', '12', 'UK:12'],
        ['UK', '15', 'UK:15'],
        ['UK', '18', 'UK:18'],
        // USA
        ['USA', 'G', 'USA:G'],
        ['USA', 'PG', 'USA:PG'],
        ['USA', 'PG-13', 'USA:PG-13'],
        ['USA', 'R', 'USA:R'],
        ['USA', 'NC-17', 'USA:NC-17']
    ]
});
