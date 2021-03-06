/**
 * Option class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

var extend = require('util')._extend;

/**
 * Constructor.
 *
 * @param   string          name            Name of option.
 * @param   string          flags           Option flags.
 * @param   callable|mixed  coercion        Either a coercion callback or a fixed value.
 * @param   object          settings        Optional additional settings.
 */
function option(name, flags, coercion, settings)
{
    settings = extend(
        {
            'variable': null,
            'default':  null,
            'help':     '',
            'required': false,
            'action':   function() {}
        },
        settings
    );

    this.name = name;
    this.data = null;
    this.flags = [];
    this.variable = null;
    this.settings = settings;
    this.validators = [];

    this.coercion = (typeof coercion === 'function'
                        ? coercion
                        : function(_, _) { return coercion; });

    flags.split(/[, |]+/).forEach(function(part) {
        var match;

        if (/^-[a-z0-9]$/i.test(part)) {
            this.flags.push(part);
        } else if (/^--[a-z][a-z0-9-]+$/i.test(part)) {
            this.flags.push(part);
        } else if ((match = part.match(/^<([^>]+)>$/))) {
            this.variable = (settings.variable !== null ? settings.variable : match[1]);
        } else {
            throw 'unexpected string "' + part + '"';
        }
    }, this);

}

/**
 * Set help text.
 *
 * @param   string          str             Help text.
 * @return  object                          Instance for method chaining.
 */
option.prototype.setHelp = function(str)
{
    this.settings.help = str;

    return this;
}

/**
 * Return help text.
 *
 * @return  string                          Help text.
 */
option.prototype.getHelp = function()
{
    return this.settings.help;
}

/**
 * Return the flags the option corresponds to.
 *
 * @return  array                           Corresponding flags.
 */
option.prototype.getFlags = function()
{
    return this.flags;
}

/**
 * Get variable of option.
 *
 * @return  string                          Variable.
 */
option.prototype.getVariable = function()
{
    return this.variable;
}

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
 * @return  object                          Instance for method chaining.
 */
option.prototype.setAction = function(fn)
{
    this.settings.action = fn;

    return this;
}

/**
 * Add a value validator. This has only effect for options that require a value.
 *
 * @param   callable        fn              Validation callback.
 * @param   string          errstr          Optional error string to print if validation fails.
 * @return  object                          Instance for method chaining.
 */
option.prototype.addValidator = function(fn, errstr)
{
    this.validators.push({
        fn: fn,
        errstr: errstr || ''
    });


    return this;
}

/**
 * Whether the option is required.
 *
 * @return  bool                            Returns true if the option is required.
 */
option.prototype.isRequired = function()
{
    return !!this.settings.required;
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
    return (this.variable !== null);
}

/**
 * Return stored data.
 *
 * @return  mixed                           Data of option.
 */
option.prototype.getData = function()
{
    return this.data;
}

/**
 * Coerce value according to configured coercion function.
 *
 * @param   mixed           value           Value to coerce according to defined coercion type.
 * @return  mixed                           Coerced value.
 */
option.prototype.coerce = function(value)
{
    return this.coercion(value, this.settings.default);
}

/**
 * Update option value.
 *
 * @param   mixed           value           Optional value to set. The resulting value depends on the coercion type defined.
 */
option.prototype.update = function(value)
{
    this.data = this.coercion(value, (this.data === null ? this.settings.default : this.data));
}

// export
module.exports = option;
