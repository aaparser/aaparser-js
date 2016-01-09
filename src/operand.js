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
        this.num = parseInt(num);
    } else if (num === '?' || num === '*' || num === '+') {
        this.num = num;
    } else {
        throw 'either an integer > 0 or one of the characters \'?\', \'*\' or \'+\' are required as second parameter. Input was: ' + num;
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
 * @return  object                          Instance for method chaining.
 */
operand.prototype.setHelp = function(str)
{
    this.settings.help = str;

    return this;
}

/**
 * Return help text.
 *
 * @return  string                          Help text.
 */
operand.prototype.getHelp = function()
{
    return this.settings.help;
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
 * Get variable of option.
 *
 * @return  string                          Variable.
 */
operand.prototype.getVariable = function()
{
    return this.settings.variable;
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
 * @param   string          errstr          Optional error string to print if validation fails.
 * @return  object                          Instance for method chaining.
 */
operand.prototype.addValidator = function(fn, errstr)
{
    this.validators.push({
        fn: fn,
        errstr: errstr || ''
    });

    return this;
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
