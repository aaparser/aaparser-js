/**
 * Operand class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

var extend = require('util')._extend;

/**
 * Constructor.
 *
 * @param   string          name            Internal name of operand.
 * @param   int|string      num             Number of arguments.
 * @param   object          settings        Optional additional settings.
 */
function operand(name, num, settings)
{
    settings = extend(
        {
            'variable': name,
            'default':  [],
            'help':     '',
            'action':   function() {}
        },
        settings
    );

    if (parseFloat(num) == parseInt(num) && !isNaN(num) && num > 0) {
        this.num = num;
    } else if (num === '?' || num === '*' || num === '+') {
        this.num = num;
    } else {
        throw 'either an integer > 0 or one of the characters \'?\', \'*\' or \'+\' are required as first parameter. Input was: ' + num;
    }

    this.name = name;
    this.settings = settings;

    this.index = 0;
    this.data = settings.default;
    this.validators = [];
}

/**
 * Set help text.
 *
 * @param   string          str             Help text.
 */
operand.prototype.setHelp = function(str)
{
    this.settings.help = str;
}

/**
 * Get usage infomation.
 *
 * @return  string                          Usage information.
 */
operand.prototype.getUsage = function()
{
    var usage = [];
    
    if (this.num === '+' || (parseFloat(this.num) == parseInt(this.num) && !isNaN(this.num))) {
        usage.push(
            Array.apply(
                null, 
                new Array((this.num == '+' ? 1 : this.num))
            ).map(
                String.prototype.valueOf, 
                '<' + this.settings.variable + '>'
            ).join(' ')
        );
    }

    if (this.num === '*' || this.num === '+') {
        usage.push('[' + this.settings.variable + ' ...]');
    } else if (this.num == '?') {
        usage.push('[' + this.settings.variable + ']');
    }

    return usage.join(' ');
}

/**
 * Return operand name.
 *
 * @return  string                          Name of operand.
 */
operand.prototype.getName = function()
{
    return this.name;
}

/**
 * Return min/max number of operands this instance matches.
 *
 * @return  array                           Min, max number of operands.
 */
operand.prototype.getExpected = function()
{
    var ret;

    if (this.num === '?') {
        ret = [0, 1];
    } else if (this.num === '*') {
        ret = [0, Infinity];
    } else if (this.num === '+') {
        ret = [1, Infinity];
    } else {
        ret = [this.num, this.num];
    }

    return ret;
}

/**
 * Add a value validator. This has only effect for options that require a value.
 *
 * @param   callable        fn              Validation callback.
 */
operand.prototype.addValidator = function(fn)
{
    this.validators.push(fn);
}

/**
 * Validate the value of an operand.
 *
 * @param   mixed           value           Value to validate.
 * @return  bool                            Returns true if the value is valid or if no validators are available.
 */
operand.prototype.isValid = function(value)
{
    var ret = true;

    for (var i = 0, cnt = this.validators.length; i < cnt; ++i) {
        if (!(ret = this.validators[i](value))) {
            break;
        }
    }

    return ret;
}

/**
 * Return stored data up to the current index.
 *
 * @return  mixed                           Data of option.
 */
operand.prototype.getData = function()
{
    return this.data.slice(0, this.index);
}

/**
 * Update operand data.
 *
 * @param   mixed           value           Value to add.
 */
operand.prototype.update = function(value)
{
    ++this.index;

    if (this.index > this.data.length) {
        this.data.push(value);
    } else {
        // overwrite default value
        this.data[this.index - 1] = value;
    }
}

// export
module.exports = operand;
