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
            'name':           name,
            'version':        '0.0.0',
            'version_string': '${name} ${version}'
        },
        settings
    );

    command.call(this, name, null, settings);

    // add implicit --version option
    var me = this;

    command.prototype.addOption.call(this, 'version', '--version', true, {
        'help': 'Print version info.'
    }).setAction(function() {
        me.printVersion();
    });
}

/**
 * Inherit command.
 */
args.prototype = Object.create(command.prototype);
args.prototype.constructor = args;

// export coercion
args.coercion = require('./coercion.js');

/**
 * Setter for the application version.
 *
 * @param   string          str         Version number.
 * @return  app                         Returns class instance.
 */
args.prototype.setVersion = function(str)
{
    this.settings.version = str;

    return this;
}

/**
 * Getter for application version.
 *
 * @return  string                      Version number.
 */
args.prototype.getVersion = function()
{
    return this.settings.version;
}

/**
 * Print versin.
 */
args.prototype.printVersion = function()
{
    var me = this;

    console.log(this.settings.version_string.replace(/\$\{([^}]+)\}/g, function(_, m1) {
        var ret = '${' + m1 + '}';

        if (m1 in me.settings) {
            ret = me.settings[m1];
        }

        return ret;
    }));

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
                        var command = cmd.getCommand(name);

                        if (!command) {
                            console.log('unknown command "' + name + '"');
                            process.exit(1);
                        }

                        return command;
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
    var arg, args;

    if (typeof argv == 'undefined') {
        args = process.argv.slice(2);
    } else {
        args = argv.slice(0);
    }

    command.prototype.parse.call(this, args);

    if ((arg = args.shift())) {
        console.log('too many arguments at "' + arg + '"');
        process.exit(1);
    }
}

// export
module.exports = args;
