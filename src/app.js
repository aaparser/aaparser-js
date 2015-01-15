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
function app()
{
    command.apply(this);

    this.version = null;
}

/**
 * Inherit command.
 */
app.prototype = Object.create(command.prototype);
app.prototype.constructor = app;

/**
 * Setter for the application version.
 *
 * @param   string          str         Version string.
 * @return  app                         Returns class instance.
 */
app.prototype.setVersion = function(str)
{
    this.version = str;

    return this;
}

/**
 * Parse arguments for command.
 *
 * @param   array           _argv           Array of arguments.
 */
app.prototype.parse = function(_argv)
{
    command.prototype.parse.call(this, _argv.slice(0))
}

// export
module.exports = new app();
