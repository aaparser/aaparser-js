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
    this.options = [];
    this.map = {};

    this.description = '';
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
 * Parse arguments.
 *
 * @param   array           argv            Array of arguments.
 */
command.prototype.parse = function(argv)
{
    var arg;
    var args = [];

    for (var i = 0, cnt = argv.length; i < cnt; ++i) {
        arg = argv[i];

        if (arg == '--') {
            args = argv.splice(i + 1);
            break;
        }
    }
}

// export
module.exports = command;
