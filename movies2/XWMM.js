XWMM = {
    /**
     * The version of XWMM
     * @type String
     */
    version: '3.0.1'
};


XWMM.cookieProvider = new Ext.state.CookieProvider({
    path: '/',
    expires: new Date(new Date().getTime()+(1000*60*60*24*30)) //30 days
});
Ext.state.Manager.setProvider(XWMM.cookieProvider);


Ext.namespace('XWMM.settings');
XWMM.settings.ignoreArticle = Ext.state.Manager.get('ignoreArticle', false);

XWMM.settings.listSeparator = ' / ';
XWMM.settings.listSeparatorRe = /[,\/\|]+/; // Split list separated with , / or |


XWMM.InitApp = function() {
    console.log('Ext v' + Ext.version);
    Ext.QuickTips.init();
};
