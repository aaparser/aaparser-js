/**
 * Command class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

var option = require('./option.js');
var operand = require('./operand.js');
var events = require('events');
var extend = require('util')._extend;

/**
 * Constructor.
 *
 * @param   string          name            Name of command.
 * @param   command         parent          Parent command.
 * @param   object          settings        Optional additional settings.
 */
function command(name, parent, settings)
{
    settings = extend(
        {
            'help':     '',
            'action':   function() {}
        },
        settings
    );

    this.name = name;
    this.settings = settings;

    this.commands = [];
    this.options = [];
    this.operands = [];

    this.parent = parent;
}

/**
 * Inherit EventEmitter.
 */
command.prototype = Object.create(events.EventEmitter.prototype);
command.prototype.constructor = command;

/**
 * Set help text.
 *
 * @param   string          str             Help text.
 * @return  object                          Instance for method chaining.
 */
command.prototype.setHelp = function(str)
{
    this.settings.help = str;

    return this;
}

/**
 * Return help text.
 *
 * @return  string                          Help text.
 */
command.prototype.getHelp = function()
{
    return this.settings.help;
}

/**
 * Return command name.
 *
 * @return  string                          Name of command.
 */
command.prototype.getName = function()
{
    return this.name;
}

/**
 * Return parent command.
 *
 * @return  Command|null                    Parent command.
 */
command.prototype.getParent = function()
{
    return this.parent;
}

/**
 * Set action to call if command appears in arguments.
 *
 * @param   callable        fn              Function to call.
 * @return  object                          Instance for method chaining.
 */
command.prototype.setAction = function(fn)
{
    this.settings.action = fn;

    return $this;
}

/**
 * Define a new command.
 *
 * @param   string          name            Name of command.
 * @param   object          settings        Optional additional settings.
 * @return  command                         Instance of new command object.
 */
command.prototype.addCommand = function(name, settings)
{
    var ret = new command(name, this, settings);

    this.commands.push(ret);

    return ret;
}

/**
 * Create a new option for command.
 *
 * @param   string          name            Internal name of option.
 * @param   string          flags           Option flags.
 * @param   callable|bool   coercion        Either a coercion callback or a fixed value.
 * @param   object          settings        Optional additional settings.
 * @return  Option                          Instance of created option.
 */
command.prototype.addOption = function(name, flags, coercion, settings)
{
    var ret = new option(name, flags, coercion, settings);

    this.options.push(ret);

    return ret;
}

/**
 * Create a new operand (positional argument).
 *
 * @param   string          name            Internal name of operand.
 * @param   int|string      num             Number of arguments.
 * @param   object          settings        Optional additional settings.
 * @return  Operand                         Instance of created operand.
 */
command.prototype.addOperand = function(name, num, settings)
{
    var ret = new operand(name, num, settings);

    this.operands.push(ret);

    return ret;
}

/**
 * Test if command has subcommands.
 *
 * @return  bool                            Returns true, if command has subcommands.
 */
command.prototype.hasCommands = function()
{
    return this.commands.length > 0;
}

/**
 * Test if command with specified name exists.
 *
 * @param   string          name           Name of command.
 * @return  bool                           Returns true, if specified command exists.
 */
command.prototype.hasCommand = function(name)
{
    return !!this.getCommand(name);
}

/**
 * Return all defined subcommands.
 *
 * @return  array                           Commands.
 */
command.prototype.getCommands = function()
{
    return this.commands.slice(0);
}

/**
 * Lookup a defined command.
 *
 * @param   string          name            Name of command.
 * @return  Command|bool                     Returns the command instance or 'false' if no command was found.
 */
command.prototype.getCommand = function(name)
{
    var ret = false;

    for (var i = 0, cnt = this.commands.length; i < cnt; ++i) {
        if (this.commands[i].getName() === name) {
            ret = this.commands[i];
            break;
        }
    }

    return ret;
}

/**
 * Test if command has defined operands.
 *
 * @return  bool                            Returns true, if command has operands.
 */
command.prototype.hasOperands = function()
{
    return this.operands.length > 0;
}

/**
 * Return all defined operands.
 *
 * @return  array                           Operands.
 */
command.prototype.getOperands = function()
{
    return this.operands.slice(0);
}

/**
 * Test if command has defined options.
 *
 * @return  bool                            Returns true, if command has options.
 */
command.prototype.hasOptions = function()
{
    return this.options.length > 0;
}

/**
 * Return all defined options.
 *
 * @return  array                           Options.
 */
command.prototype.getOptions = function()
{
    return this.options.slice(0);
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
 * Return min/max expected number of operands
 *
 * @return  array                           Min, max expected number of operands.
 */
command.prototype.getMinMaxOperands = function()
{
    var min = 0;
    var max = 0;

    this.operands.forEach(function(operand)  {
        var mm = operand.getExpected();

        min += mm[0];

        if (max !== Infinity) {
            if (mm[1] === Infinity) {
                max = Infinity;
            } else {
                max += mm[1];
            }
        }
    });

    return [min, max];
}

/**
 * Get remaining minimum number of operands expected.
 *
 * @param   int             n               Number of operand to begin with to calculate remaining minimum expected operands.
 * @return  int                             Expected minimum remaining operands.
 */
command.prototype.getMinRemaining = function(n)
{
    var ret = 0;

    this.operands.slice(n).forEach(function(operand) {
        ret += operand.getExpected()[0];
    });

    return ret;
}

/**
 * Process and validate operands.
 *
 * @param   array           args            Operandal arguments to validate.
 * @return  object                          Validated arguments.
 */
command.prototype.processOperands = function(args)
{
    var name, remaining, cnt;

    var operand = null;
    var ret = {};
    var op = 0;
    var minmax = this.getMinMaxOperands();
    var result;

    if (minmax[0] > args.length) {
        console.log('not enough arguments -- available ' + args.length + ', expected ' + minmax[0]);
        process.exit(1);
    } else if (minmax[1] !== Infinity && minmax[1] < args.length) {
        console.log('too many arguments -- available ' + args.length + ', expected ' + minmax[1]);
        process.exit(1);
    }

    while (args.length > 0) {
        if (operand === null) {
            // fetch next operand
            operand = this.operands[op];

            minmax = operand.getExpected();
            name = operand.getName();

            ++op;

            remaining = this.getMinRemaining(op);
        }

        cnt = (typeof ret[name] != 'undefined'
                ? ret[name].length
                : 0);

        if (minmax[1] > cnt || (minmax[1] === Infinity && remaining > args.length)) {
            // expected operand
            arg = args.shift();

            result = operand.isValid(arg);

            if (!result[0]) {
                console.log('invalid value "' + arg + '" for operand');

                if (result[1]) {
                    console.log(result[1].replace(/\$\{value\}/g, arg));
                }

                process.exit(1);
            }

            operand.update(arg);
            ret[name] = operand.getData();
        } else {
            // trigger fetching next operand
            operand = null;
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
    var operands = {};
    var literal = false;
    var subcommand = false;
    var result;

    this.options.forEach(function(option) {
        var data = option.getData();

        if (data !== null) {
            options[option.getName()] = data;
        }
    });

    var mm = this.getMinMaxOperands();

    while ((arg = argv.shift())) {
        if (literal) {
            args.push(arg);
            continue;
        }

        if (arg == '--') {
            // only operands following
            literal = true;
            continue;
        }

        if ((match = arg.match(/^(-[a-z0-9])([a-z0-9]*)()$/i)) ||
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
                    result = option.isValid(arg);

                    if (!result[0]) {
                        console.log('invalid value for argument "' + match[1] + '"')

                        if (result[1]) {
                            console.log(result[1].replace(/\$\{value\}/g, arg));
                        }

                        process.exit(1);
                    } else {
                        option.update(arg);
                        option.settings.action.call(option, arg);
                    }
                } else {
                    console.log('value missing for argument "' + match[1] + '"');
                    process.exit(1);
                }
            } else {
                option.update();
                option.settings.action.apply(option);
            }

            // option.action(option.value);
            options[option.getName()] = option.getData();

            if (match[2].length > 0) {
                // push back combined short argument
                argv.unshift('-' + match[2]);
            }
        } else if (args.length < mm[1]) {
            // expected operand
            args.push(arg);
        } else if ((subcommand = this.getCommand(arg))) {
            // sub command
            break;
        } else {
            // no further arguments should be parsed
            argv.unshift(arg);
            break;
        }
    }

    // check if all required options are available
    this.options.forEach(function(option) {
        if (option.isRequired() && !(option.getName() in options)) {
            console.log('required argument is missing "' + option.getFlags().join(' | ') + '"');
            process.exit(1);
        }
    });

    // parse operands
    operands = this.processOperands(args);

    // action callback for command
    if (action in this.settings) {
        this.settings.action.call(this, options, operands);
    }

    // there's a subcommand to be called
    if (subcommand) {
        do {
            subcommand.parse(argv);

            if ((arg = argv.shift())) {
                if (!(subcommand = this.getCommand(arg))) {
                    // argument does not belong to a subcommand registered at this level
                    argv.unshift(arg);
                    break;
                }
            } else {
                // no more arguments
                break
            }
        } while(true);
    }
}

// export
module.exports = command;
