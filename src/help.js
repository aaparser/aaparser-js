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
        tree.unshift(cmd.name);

        cmd = cmd.parent;
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

    if (command.options.length > 0) {
        console.log('\nOptions:');

        command.options.forEach(function(option) {
            console.log('    ' + option.flags.join(' | '));
            console.log(str.wordwrap(option.settings.help, 10, 78) + '\n');
        });
    }

    if (command.operands.length > 0) {
        console.log('Operands:');

        command.operands.forEach(function(operand) {
            console.log('    ' + operand.name);
            console.log(str.wordwrap(operand.settings.help, 10, 78) + '\n');
        });
    }

    for (i in command.commands) {
        console.log('Commands:');

        var names = Object.keys(command.commands).sort();
        var size = names.reduce(function(size, name) {
            return Math.max(size, name.length);
        }, 0);

        names.forEach(function(name) {
            console.log('    ' + name + str.repeat(' ', size - name.length) + '    ' + command.commands[name].settings.help);
        });

        break;
    }
}

// exports
module.exports = (new help()).printHelp;
