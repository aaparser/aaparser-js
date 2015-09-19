/**
 * Class with default coercion functions.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

module.exports = {
    /**
     * Build a collection (array) of values.
     */
    collect: function(value, collection)
    {
        if (Object.prototype.toString.call(settings.default) !== '[object Array]') {
            collection = [];
        }
        
        collection.push(value);

        return collection;
    },

    /**
     * Increase a counter.
     */
    count: function(value, total) {
        if (isNaN(total)) {
            total = 0;
        }
        
        return total += value;
    },

    /**
     * Build a key/value with values provided.
     */
    kv: function(value, collection) {
        if (Object.prototype.toString.call(settings.default) !== '[object Array]') {
            collection = {};
        }
        
        var kv = value.split('=');

        collection[kv[0]] = kv[1];

        return collection;
    },

    /**
     * Split a value by ','.
     */
    listing: function(value) {
        return value.split(/ *, */);
    },

    /**
     * Build a range of numbers.
     */
    range: function(value) {
        return value.split('..').map(Number);
    },

    /**
     * Just store the value.
     */
    value: function(value) {
        return value;
    }
}
