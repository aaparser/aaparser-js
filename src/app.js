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

    this.commands = {};
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
 * Define a new command.
 *
 * @param   string          name            Name of command.
 * @return  command                         Instance of new command object.
 */
app.prototype.addCommand = function(name)
{
    this.commands[name] = new command(name);

    return this.commands[name];
}

// export
module.exports = new app();
