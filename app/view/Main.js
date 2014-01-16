Ext.define('XWMM.view.Main', {
    extend: 'Ext.tab.Panel',

    xtype: 'app-main',

    tabPosition: 'left',

    items: [
        {
            title: 'Movies',
            xtype: 'moviestab'
        },
        {
            title: 'TV Shows',
            xtype: 'tvshowstab'
        },
        {
            title: 'Music Videos',
            xtype: 'musicvideostab'
        },
        {
            title: 'Music',
            xtype: 'musictab'
        },
        {
            title: 'Files',
            xtype: 'filestab'
        }
    ],

    listeners: {
        beforetabchange: function(tabs, newTab, oldTab) {
            // TODO: check for unsaved changes and prompt user.
            //console.debug('XWMM.view.Main beforetabchange');
            return true;
        }
    }
});