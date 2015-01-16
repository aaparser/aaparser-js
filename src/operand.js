/**
 * Operand class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

/**
 * Constructor.
 *
 * @param   string          name            Internal name of operand.
 * @param   int|string      num             Number of arguments.
 * @param   object          options         Optional additional settings.
 */
function operand(name, num, options)
{
    options = extend(
        {
            'variable': name,
            'default':  [],
            'help':     '',
            'required': false,
            'action':   function() {}
        },
        options
    );

    if (parseFloat(num) == parseInt(num) && !isNaN(num) && num > 0) {
        this.num = num;
    } else if (num === '?' || num === '*' || num === '+') {
        this.num = num;
    } else {
        throw 'either an integer > 0 or one of the characters \'?\', \'*\' or \'+\' are required as first parameter. Input was: ' + num;
    }

    this.name = name;
    this.options = options;

    this.index = 0;
    this.data = options.default;
    this.validators = [];
}

/**
 * Return option name.
 *
 * @return  string                          Name of option.
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
