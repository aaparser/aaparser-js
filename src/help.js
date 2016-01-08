/**
 * Help system for aaparser.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

var str = require('./str.js');

function getOptionUsage(option)
{
    var usage = option.getFlags().join(' | ');
    var ch;

    if (option.isRequired()) {
        if (option.getFlags().length > 1) {
            ch = ['(', ')'];
        } else {
            ch = ['', ''];
        }
    } else {
        ch = ['[', ']'];
    }

    if (option.takesValue()) {
        usage = usage + ' <' + option.getVariable() + '>';
    }

    return ch[0] + usage + ch[1];
}

function getOperandUsage(operand)
{
    var usage = [];
    var minmax = operand.getExpected();

    if (minmax[0] > 0) {
        usage.push(
            Array.apply(
                null,
                new Array(minmax[0])
            ).map(
                String.prototype.valueOf,
                '<' + operand.getVariable() + '>'
            ).join(' ')
        );
    }

    if (minmax[1] == Infinity) {
        usage.push('[' + operand.getVariable() + ' ...]');
    } else if (minmax[0] == 0) {
        usage.push('[' + operand.getVariable() + ']');
    }

    return usage.join(' ');
}

function getUsage(command)
{
    var usage = [];

    command.getOptions().forEach(function(option) {
        usage.push(getOptionUsage(option));
    });
    command.getOperands().forEach(function(operand) {
        usage.push(getOperandUsage(operand));
    });

    if (command.hasCommands()) {
        usage.push('<command> [ARGUMENTS]');
    }

    return usage;
}

/**
 * Print help.
 *
 * @param   Command             command             Command to print help for.
 */
function printHelp(command)
{
    // collect

    // render usage summary
    var cmd = command;
    var tree = []

    do {
        tree.unshift(cmd.getName());

        cmd = cmd.getParent();
    } while (cmd !== null);

    var usage = getUsage(command);
    var buffer = ('Usage: ' + tree.shift() + ' ' + tree.join(' [ARGUMENTS] ')).replace(/ +$/, '') + ' ';
    var len = buffer.length;

    for (var i = 0, cnt = usage.length; i < cnt; ++i) {
        if (buffer.length + usage[i].length <= 78 || buffer.length == len) {
            buffer = buffer + usage[i] + ' ';
        } else {
            console.log(buffer);

            buffer = str.repeat(' ', len) + usage[i] + ' ';
        }
    }

    if (buffer.length > len) {
        console.log(buffer);
    }

    // render lists of available options, operands and subcommands
    if (command.hasOptions() || command.hasOperands() || command.hasCommands()) {
        console.log();
    }

    if (command.hasOptions()) {
        console.log('Options:');

        command.getOptions().forEach(function(option) {
            console.log('    ' + option.getFlags().join(' | '));
            console.log(str.wordwrap(option.getHelp(), 10, 78) + '\n');
        });
    }

    if (command.hasOperands()) {
        console.log('Operands:');

        command.getOperands().forEach(function(operand) {
            console.log('    ' + operand.getName());
            console.log(str.wordwrap(operand.getHelp(), 10, 78) + '\n');
        });
    }

    if (command.hasCommands()) {
        console.log('Commands:');

        var commands = {};
        var size = command.getCommands().reduce(function(size, cmd) {
            var name = cmd.getName();

            commands[name] = cmd;

            return Math.max(size, name.length);
        }, 0);
        var names = Object.keys(commands).sort();

        names.forEach(function(name) {
            console.log('    ' + name + str.repeat(' ', size - name.length) + '    ' + commands[name].getHelp());
        });
    }
}

// exports
module.exports = printHelp;
