/**
 * Option class.
 *
 * @copyright   copyright (c) 2015 by Harald Lapp
 * @author      Harald Lapp <harald@octris.org>
 */

/**
 * Constructor. Options can be an object with the following properties:
 *
 * * value -- default value
 * * action -- ( store [default] | switch | append | count )
 * * required -- ( true | false )
 *
 * @param   string          flags           Mandatory option flags separated by one of ',', '|' or ' '.
 * @param   string          description     Optional description for option.
 * @param   object          options         Optional additional options.
 */
function option(flags, description, options)
{
    options = options || {};

    this.flags = [];
    this.metavar = null;
    
    var me = this;

    flags.split(/[, |]+/).forEach(function(part) {
        var match;
    
        if (/^-[a-z0-9]$/.test(part) || /^--[a-z][a-z0-9-]+$/.test(part)) {
            me.flags.push(part);
        } else if ((match = part.match(/^<([^>]+)>$/))) {
            me.metavar = match[1];
        } else {
            console.log('invalid option format');
        }
    });

    this.flags = flags;
    this.description = description || '';

    this.required = ('required' in options && options.required);
    this.action = ('action' in options && ['store', 'append', 'count'].indexOf(options.action)
                    ? options.action
                    : 'store');

    if ('value' in options) {
        this.setDefaultValue(options.value);
    } else {
        if (this.action == 'count') {
            this.value = 0;
        } else if (this.action == 'append') {
            this.value = [];
        } else {
            this.value = true;
        }
    }

    this.validators = [];
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
    return (this.flags.indexOf(flag) >= 0)
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
    return (this.metavar !== null);
}

/**
 * Set a value for option according to it's set 'action' option. This should only
 * be used to set/update the option value for a parsed option. See 'setDefaultValue'
 * for modifying the default value for an option.
 *
 * @param   mixed           value           Value to set (ignored for 'action').
 * @param   bool            validate        Optionally validate value (default: true).
 */
option.prototype.setValue = function(value, validate)
{
    validate = (typeof validate == 'undefined' ? true | !!validate);

    if (validate && this.isValid(value)) {
        this.value = value;
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
    if (this.action == 'count') {
        this.value = (!isNaN(value) ? value : 0);
    } else if (this.action == 'append') {
        this.value = (Object.prototype.toString.call(value) === '[object Array]' ? value : []);
    } else {
        this.value = (/boolean|number|string/.test(value) ? value : true);
    }
}

// export
module.exports = option;
