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
 * @param   string          name            Internal name of option.
 * @param   string          type            Type of option.
 * @param   array           flags           Option flags.
 * @param   object          options         Optional additional settings.
 *
 * @param   array           flags           Option flags.
 * @param   int             settings        Settings as bit-field.
 * @param   string          metavar         Optional variable name for usage information.
 * @param   mixed           value           Optional default value
 */
function option(name, type, flags, options)
{
    options = extend(
        {
            'variable': 'arg',
            'default': null,
            'choice': [],
            'help': '',
            'required': false,
            'append': false,
            'action': function() {}
        }, 
        options
    );

    if (!(type in option_types)) {
        throw 'invalid option type "' + type + '"';
    }

    this.name = name;
    this.value = null;
    this.flags = flags;
    this.options = options;

    this.setDefaultValue(this.options.default);

    this.validators = [];
}

/**
 * Option types.
 */
option.type = option_types;

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
 * Set help description.
 *
 * @param   string          str             Help string for option.
 */
option.prototype.setHelp = function(str)
{
    this.options.help = str;
}

/**
 * Return internal name of option.
 *
 * @return  string                          Name of option.
 */
option.prototype.getName = function()
{
    return this.name;
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
 * Return value of option.
 *
 * @return  mixed                           Value of option.
 */
option.prototype.getValue = function()
{
    return this.value;
}

/**
 * Update value of option according to it's set 'action' option. This should only
 * be used to set/update the option value for a parsed option. See 'setDefaultValue'
 * for modifying the default value for an option.
 *
 * @param   mixed           value           Optional value to set (ignored for 'action' == 'count').
 * @param   bool            validate        Optionally validate value (default: true, ignored for 'action' == 'count').
 */
option.prototype.updateValue = function(value, validate)
{
    if (!this.takesValue()) {
        // does not take a value
        if (this.type == option.settings.T_COUNT) {
            // counter
            this.value++;
        } else {
            // switch
            this.value = !this.default;
        }
    } else {
        validate = (typeof validate == 'undefined' ? true : !!validate);

        if (validate && this.isValid(value)) {
            if (this.type == option.settings.T_VALUE) {
                this.value = value;
            } else {
                this.value.push(value);
            }
        }
    }
}

/**
 * Overwrite the default value for this option. Note that this method will silently ignore
 * invalid values and will initialize the value instead.
 *
 * @param   mixed           value           Value to set.
 */
option.prototype.setDefaultValue = function(value)
{
    switch (this.options.type) {
        case option.type.bool:
            this.value = !!value;
            break;
        case option.type.count:
            this.value = (parseFloat(num) == parseInt(num) && !isNaN(num)
                            ? value
                            : 0);
            break;
        case option.type.list:
            this.value = (Object.prototype.toString.call(value) === '[object Array]' 
                            ? value 
                            : []);
            break;
        case option.type.value:
            this.value = (/boolean|number|string/.test(value) 
                            ? '' + value 
                            : null);
            break;
    }
}

// export
module.exports = option;
