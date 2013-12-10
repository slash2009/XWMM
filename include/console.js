/**
 * Protect window.console method calls, e.g. console is not defined on IE
 * unless dev tools are open, and IE doesn't define console.debug
 */
(function() {
    if (!window.console) {
        window.console = {};
    }
    // union of Chrome, FF, IE, and Safari console methods
    var m = [
        'log', 'info', 'warn', 'error', 'debug', 'trace', 'dir', 'group',
        'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'profile', 'profileEnd',
        'dirxml', 'assert', 'count', 'markTimeline', 'timeStamp', 'clear'
    ];
    var noop = function() {};
    // define undefined methods as noops to prevent errors
    for (var i = 0, len = m.length; i < len; i++) {
        if (!window.console[m[i]]) {
            window.console[m[i]] = noop;
        }
    }
})();
