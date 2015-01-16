/**
 * Arguments class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

var command = require('./command.js');
var option = require('./option.js');

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
args.option = option.settings;

/**
 * Setter for the application version.
 *
 * @param   string          str         Version string.
 * @return  app                         Returns class instance.
 */
args.prototype.setVersion = function(str)
{
    this.version = str;

    // add implicit --version option
    var me = this;

    this.addOption(['--version']).setAction(function() {
        me.printVersion();
    });

    return this;
}

/**
 * Print version string.
 */
args.prototype.printVersion = function()
{
    console.log(this.version);
}

/**
 * Print help.
 *
 * @param   object          options         Parsed options.
 * @param   object          operands        Parsed operands.
 */
args.prototype.printHelp = function(options, operands)
{
    console.log('HELP', options, operands);
    process.exit(1);
}

/**
 * Define a new command.
 *
 * @param   string          name            Name of command.
 * @return  command                         Instance of new command object.
 */
args.prototype.addCommand = function(name)
{
    if (name != 'help' && !('help' in this.commands)) {
        // add implicit help command as soon as the first command get's added
        var me = this;
        var cmd = command.prototype.addCommand.call(this, 'help');
        cmd.setAction(function(options, operands) {
            me.printHelp(options, operands);
        });
        cmd.addOperand(1);
    }

    this.commands[name] = new command(name);

    return this.commands[name];
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

    var me = this;

    this.addOption(['--help']).setAction(function() {
        me.printHelp();
    });

    command.prototype.parse.call(this, argv.slice(0));
}

// export
module.exports = args;
