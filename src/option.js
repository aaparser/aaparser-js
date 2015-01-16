/**
 * Option class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

/**
 * Constructor.
 *
 * @param   array           flags           Option flags.
 * @param   int             settings        Settings as bit-field.
 * @param   string          metavar         Optional variable name for usage information.
 * @param   mixed           value           Optional default value
 */
function option(flags, settings, metavar, value)
{
    settings = settings || option.settings.T_SWITCH;

    this.flags = flags;
    this.metavar = metavar || 'arg';

    this.type = settings & 0xff;
    this.required = ((settings & option.settings.T_REQUIRED) == option.settings.T_REQUIRED);
    this.default = value;

    this.description = '';

    if (typeof value !== 'undefined') {
        this.setDefaultValue(value);
    } else {
        if (this.type == option.settings.T_COUNT) {
            this.value = 0;
        } else if (this.type == option.settings.T_LIST) {
            this.value = [];
        } else {
            this.value = true;
        }
    }

    this.default = this.value;

    this.validators = [];

    this.action = function() {};
}

/**
 * Option settings.
 */
option.settings = {
    T_SWITCH      :   1,
    T_VALUE       :   3,
    T_LIST        :   7,
    T_COUNT       :  31,
    T_REQUIRED    : 256
};

/**
 * Set action to call if option appears in arguments.
 *
 * @param   callable        fn              Function to call.
 */
option.prototype.setAction = function(fn)
{
    this.action = fn;
}

/**
 * Set help description.
 *
 * @param   string          description     Help description for option.
 */
option.prototype.setHelp = function(description)
{
    this.description = description;
}

/**
 * Return ID of option (which is currently only a join of the option-flags).
 *
 * @return  int                             Option ID.
 */
option.prototype.getId = function()
{
    return this.flags.join('');
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
    return this.required;
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
    return (this.type == option.settings.T_VALUE ||
            this.type == option.settings.T_LIST);
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
    if (this.type == option.settings.T_COUNT) {
        this.value = (!isNaN(value) ? value : 0);
    } else if (this.type == option.settings.T_LIST) {
        this.value = (Object.prototype.toString.call(value) === '[object Array]' ? value : []);
    } else {
        this.value = (/boolean|number|string/.test(value) ? value : true);
    }
}

// export
module.exports = option;
