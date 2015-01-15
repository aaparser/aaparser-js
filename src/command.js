/**
 * Command class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

var option = require('./option.js');

/**
 * Constructor.
 */
function command(name)
{
    this.commands = {};
    this.options = [];
    this.map = {};

    this.description = '';
    this.action = function() {};
}

/**
 * Setter for the command description.
 *
 * @param   string          str         Command description.
 * @return  string|app                  Returns class instance.
 */
command.prototype.setDescription = function(str)
{
    this.description = str;

    return this;
}

/**
 * Set action to call if command appears in arguments.
 *
 * @param   callable        fn              Function to call.
 */
command.prototype.setAction = function(fn)
{
    this.action = fn;
}

/**
 * Define a new command.
 *
 * @param   string          name            Name of command.
 * @return  command                         Instance of new command object.
 */
command.prototype.addCommand = function(name)
{
    this.commands[name] = new command(name);

    return this.commands[name];
}

/**
 * Create a new option for command. Options can be an object with the
 * following properties:
 *
 * * value -- default value
 * * metavar -- name of argument for the help
 * * action -- ( store [default] | append | count )
 * * required -- ( true | false )
 *
 * @param   array           flags           Mandatory option flags.
 * @param   string          description     Optional description for option.
 * @param   object          options         Optional additional options.
 * @return  Option                          Instance of created option.
 */
command.prototype.addOption = function(flags, description, options)
{
    var ret = new option(flags, description, options);

    this.options.push(ret);

    return ret;
}

/**
 * Lookup a defined option for a specified flag.
 *
 * @param   string          flag            Option flag.
 * @return  Option|bool                     Returns the option instance or 'false' if no option was found.
 */
command.prototype.getOption = function(flag)
{
    var ret = false;

    for (var i = 0, cnt = this.options.length; i < cnt; ++i) {
        if (this.options[i].isFlag(flag)) {
            ret = this.options[i];
            break;
        }
    }

    return ret;
}

/**
 * Parse arguments for command.
 *
 * @param   array           argv            Array of arguments.
 */
command.prototype.parse = function(argv)
{
    var arg, match, option;

    var args = [];
    var options = {};
    var literal = false;

    while ((arg = argv.shift())) {
        if (literal) {
            args.push(arg);
            continue;
        }

        if (arg == '--') {
            // only positional arguments following
            literal = true;
            continue;
        }

        if ((match = arg.match(/^(-[a-z0-9])([a-z0-9]*)()$/)) ||
            (match = arg.match(/^(--[a-z][a-z0-9-]*)()(=.*|)$/i))) {
            // option argument

            if (match[3].length > 0) {
                // push back value
                argv.unshift(match[3].substring(1));
            }

            if (!(option = this.getOption(match[1]))) {
                // unknown option
                console.log('unknown argument "' + match[1] + '"');
                process.exit(1);
            }

            if (option.takesValue()) {
                if ((arg = argv.shift())) {
                    // value required
                    if (!option.isValid(arg)) {
                        console.log('invalid value for argument "' + match[1] + '"')
                        process.exit(1);
                    } else {
                        option.updateValue(arg);
                    }
                } else {
                    console.log('value missing for argument "' + match[1] + '"');
                    process.exit(1);
                }
            } else {
                option.updateValue();
            }

            options[option.getId()] = option;

            if (match[2].length > 0) {
                // push back combined short argument
                argv.unshift('-' + match[2]);
            }
        } else {
            if (arg in this.commands) {
                // could be a command
                this.commands.parse(argv);
            }
        }
    }

    console.log(options);
}

// export
module.exports = command;
