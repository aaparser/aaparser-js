/**
 * Application class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

var command = require('./command.js');
var extend = require('util')._extend;

/**
 * Constructor.
 *
 * @param   string          name            Name of application.
 * @param   object          settings        Optional settings.
 */
function args(name, settings)
{
    settings = extend(
        {
            'version':        null,
            'version_string': '{version}'
        },
        settings
    );

    command.call(this, name, null, settings);

    this.version = null;

    if (this.settings.version !== null) {
        this.setVersion(this.settings.verion);
    }
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
 * @param   string
 * @return  app                         Returns class instance.
 */
args.prototype.setVersion = function(str)
{
    if (this.version === null) {
        this.version = str;

        // add implicit --version option
        var me = this;

        command.prototype.addOption.call(this, 'version', 'bool', ['--version'], {
            'help': 'Print version info.'
        }).setAction(function() {
            me.printVersion();
        });
    }

    return this;
}

/**
 * Print versin.
 */
args.prototype.printVersion = function()
{
    console.log(this.version);
    process.exit(1);
}

/**
 * Print help.
 *
 * @param   string          command         Optional command to print help for.
 */
args.prototype.printHelp = function(command)
{
    require('./help.js')(command);

    process.exit(1);
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
                var command = me;

                if ('command' in operands) {
                    // resolve actual command
                    command = operands.command.reduce(function(cmd, name) {
                        if (!(name in cmd.commands)) {
                            console.log('unknown command "' + name + '"');
                            process.exit(1);
                        }

                        return cmd.commands[name];
                    }, me);
                }

                me.printHelp(command);
            }
        });
        cmd.addOperand('command', '*', {
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
