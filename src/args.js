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
 * Print help.
 *
 * @param   string          command         Optional command to print help for.
 */
args.prototype.printHelp = function(command)
{
}

/**
 * Define a new command.
 *
 * @param   string          name            Name of command.
 * @param   object          settings        Optional additional settings.
 * @return  command                         Instance of new command object.
 */
args.prototype.addCommand = function(name, settings)
{
    if (name != 'help') {
        // add implicit help command
        var me = this;

        var cmd = command.prototype.addCommand.call(this, 'help', {
            'help':   'Help',
            'action': function(options, operands) {
                me.printHelp(operands.command[0]);
            }
        });
        cmd.addOperand('command', 1, {
            'help': 'Command to get help for.'
        });
    }

    return command.prototype.addCommand.call(this, name, settings);
}

/**
 * Parse arguments for command. Uses 'process.argv' if no parameter is specified.
 *
 * @param   array            argv       Optional array of arguments.
 */
args.prototype.parse = function(argv)
{
    if (typeof argv == 'undefined') {
        argv = process.argv.slice(2);
    }

    command.prototype.parse.call(this, argv.slice(0));
}

// export
module.exports = args;
