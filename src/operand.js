/**
 * Operand class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

/**
 * Constructor.
 *
 * @param   int|string      num             Number of arguments.
 * @param   string          metavar         Optional variable name for usage information.
 * @param   array           values          Optional default values.
 */
function operand(num, metavar, values)
{
    if (parseFloat(num) == parseInt(num) && !isNaN(num) && num > 0) {
        this.num = num;
    } else if (num === '?' || num === '*' || num === '+') {
        this.num = num;
    } else {
        throw 'either an integer > 0 or one of the characters \'?\', \'*\' or \'+\' are required as first parameter. Input was: ' + num;
    }

    this.metavar = metavar;
    this.values = values;

    this.description = '';
    this.validators = [];
}

/**
 * Set help description.
 *
 * @param   string          description     Help description for operand.
 */
operand.prototype.setHelp = function(description)
{
    this.description = description;
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

