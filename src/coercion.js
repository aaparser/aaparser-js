/**
 * Class with default coercion functions.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

module.exports = {
    collect: function(value, collection) {
        collection.push(value);

        return collection;
    },

    count: function(value, total) {
        return total += value;
    },

    kv: function(value, collection) {
        var kv = value.split('=');

        collection[k[0]] = v[0];

        return collection;
    },

    list: function(value) {
        return value.split(',');
    },

    range: function(value) {
        return value.split('..');
    },

    value: function(value) {
        return value;
    }
}
