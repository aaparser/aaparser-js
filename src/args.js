/**
 * Application class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

var command = require('./command.js');

/**
 * Constructor.
 */
function args()
{
    command.apply(this);

    this.version = null;
}

/**
 * Inherit command.
 */
args.prototype = Object.create(command.prototype);
args.prototype.constructor = args;

/**
 * Option settings.
 */
args.option = {
    T_SWITCH      :   1,
    T_VALUE       :   3,
    T_LIST        :   7,
    T_COUNT       :  31,
    T_REQUIRED    : 256
}

/**
 * Setter for the application version.
 *
 * @param   string          str         Version string.
 * @return  app                         Returns class instance.
 */
args.prototype.setVersion = function(str)
{
    this.version = str;

    return this;
}

/**
 * Parse arguments for command. Uses 'process.argv' if no parameter is specified.
 *
 * @param   array            argv       Optional array of arguments.
 */
args.prototype.parse = function(argv)
{
    if (typeof argv == 'undefined') {
        argv = process.argv.slice(1);
    }
    
    command.prototype.parse.call(this, argv.slice(0));
}

// export
module.exports = args;
