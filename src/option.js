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
 * @param   callable|bool   coercion        Either a coercion callback or a fixed value.
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
    this.coercion = coercion;
    this.settings = settings;
    this.validators = [];

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
 */
option.prototype.setHelp = function(str)
{
    this.settings.help = str;
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
 */
option.prototype.setAction = function(fn)
{
    this.settings.action = fn;
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
 * Update option value.
 *
 * @param   mixed           value           Optional value to set (ignored for 'type' == 'count' and 'type' == 'bool').
 */
option.prototype.update = function(value)
{
    if (typeof this.coercion === 'function') {
        this.coercion.call(this, value, this.data, this.settings.default);
    } else {
        this.data = this.coercion;
    }
}

// export
module.exports = option;
