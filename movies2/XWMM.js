XWMM = {
    /**
     * The version of XWMM
     * @type String
     */
    version: '3.0.1'
};


Ext.namespace('XWMM.settings');
XWMM.settings.ignoreArticle = (docCookies.getItem('sortArticles') == 1);

XWMM.settings.listSeparator = ' / ';
XWMM.settings.listSeparatorRe = /[ ]+[,\/\|]+[ ]+/; // Split list separated with , / or |


XWMM.InitApp = function() {
    console.log('Ext v' + Ext.version);
    Ext.QuickTips.init();
};
