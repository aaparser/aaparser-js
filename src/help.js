/**
 * Help system for octoarg.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

var str = require('./str.js');

/**
 * Constructor.
 */
function help()
{
}

/**
 * Print help.
 *
 * @param   Command             command             Command to print help for.
 */
help.prototype.printHelp = function(command)
{
    var cmd = command;
    var tree = []

    do {
        tree.unshift(cmd.getName());

        cmd = cmd.getParent();
    } while (cmd !== null);

    var usage = command.getUsage();
    var buffer = ('usage: ' + tree.shift() + ' ' + tree.join(' [ARGUMENTS] ')).replace(/ +$/, '') + ' ';
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
module.exports = (new help()).printHelp;
