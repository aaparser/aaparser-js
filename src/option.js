/**
 * Option class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

var extend = require('util')._extend;


var option_types = {
    bool:   1,
    value:  2,
    count:  3,
    list:   4
}

var option_vtypes = [types.value, types.list];

/**
 * Constructor.
 *
 * @param   string          name            Name of option.
 * @param   string          type            Type of option.
 * @param   array           flags           Option flags.
 * @param   object          options         Optional additional settings.
 */
function option(name, type, flags, options)
{
    if (!(type in option_types)) {
        throw 'invalid option type "' + type + '"';
    }

    options = extend(
        {
            'variable': name,
            'default':  (type == option.type.bool ? false : null),
            'store':    (type == option.type.bool ? true : null),
            'help':     '',
            'required': false,
            'action':   function() {}
        },
        options
    );

    this.data = null;
    this.flags = flags;
    this.options = options;

    switch (this.options.type) {
        case option.type.bool:
            this.data = !!options.default;
            break;
        case option.type.count:
            this.data = (parseFloat(options.default) == parseInt(options.default) && !isNaN(options.default)
                            ? options.default
                            : 0);
            break;
        case option.type.list:
            this.data = (Object.prototype.toString.call(options.default) === '[object Array]'
                            ? options.default
                            : []);
            break;
        case option.type.value:
            this.data = (/boolean|number|string/.test(options.default)
                            ? '' + options.default
                            : null);
            break;
    }

    this.validators = [];
}

/**
 * Option types.
 */
option.type = option_types;

/**
 * Return option name.
 *
 * @return  string                          Name of option.
 */
option.prototype.getName = function()
{
    return this.name;
}

/**
 * Set action to call if option appears in arguments.
 *
 * @param   callable        fn              Function to call.
 */
option.prototype.setAction = function(fn)
{
    this.options.action = fn;
}

/**
 * Add a value validator. This has only effect for options that require a value.
 *
 * @param   callable        fn              Validation callback.
 */
option.prototype.addValidator = function(fn)
{
    this.validators.push(fn);
}

/**
 * Whether the option is required.
 *
 * @return  bool                            Returns true if the option is required.
 */
option.prototype.isRequired = function()
{
    return !!this.options.required;
}

/**
 * Test if specified flag represents the option.
 *
 * @param   string          flag            Flag name.
 * @return  bool                            Returns true if the option is represented by the flag.
 */
option.prototype.isFlag = function(flag)
{
    return (this.flags !== null && this.flags.indexOf(flag) >= 0)
}

/**
 * Validate the value of an option.
 *
 * @param   mixed           value           Value to validate.
 * @return  bool                            Returns true if the value is valid or if no validators are available.
 */
option.prototype.isValid = function(value)
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
 * Returns true if the option is expected to take a value.
 *
 * @return  bool                            Returns true or false.
 */
option.prototype.takesValue = function()
{
    return (option_vtypes.indexOf(this.options.type) >= 0);
}

/**
 * Return stored data.
 *
 * @return  mixed                           Data of option.
 */
option.prototype.getData = function()
{
    return (this.type == option.type.list
            ? this.data.slice(0)
            : this.data);
}

/**
 * Update option value(s) according to it's set 'type'. This should only be used to update the option
 * value(s) during option parsing.
 *
 * @param   mixed           value           Optional value to set (ignored for 'type' == 'count' and 'type' == 'bool').
 */
option.prototype.update = function(value)
{
    switch (this.options.type) {
        case option.type.bool:
            this.data = !!this.options.store;
            break;
        case option.type.count:
            this.data++;
            break;
        case option.type.list:
            this.data.push(value);
            break;
        case option.type.value:
            this.data = value;
            break;
    }
}

// export
module.exports = option;
