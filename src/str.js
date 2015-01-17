/**
 * String helper class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

var str = require('./str.js');

module.exports = {
    repeat: function(str, len) {
        return new Array(len + 1).join(str);
    },
    wordwrap: function(str, start, stop) {
        var words = str.split(' ');
        var prefix = this.repeat(' ', start);
        var buffer = prefix;
        var len = buffer.length;
        var ret = [];
        
        for (var i = 0, cnt = words.length; i < cnt; ++i) {
            if (buffer.length + words[i].length <= stop || buffer.length == len) {
                buffer = buffer + words[i] + ' ';
            } else {
                ret.push(buffer);
            
                buffer = prefix + words[i] + ' ';
            }
        }

        if (buffer.length > len) {
            ret.push(buffer);
        }
        
        return ret.join('\n');
    }
}
