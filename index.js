const is = require('is_js');

const vakt = {};
vakt.VERSION = require('./package.json').version;

vakt.is = is;

vakt.types = [
  'array',
  'boolean',
  'date',
  'decimal',
  'function',
  'integer',
  'number',
  'object',
  'regexp',
  'string',
];

vakt.customTypes = {};

// helper function which validates variable argument to make sure it matches { name: value }
vakt._variableIsValid = variable =>
  vakt.is.object(variable) && vakt.is.not.array(variable) && Object.keys(variable).length === 1;

// helper function which returns the proper article for a word (most of the time)
vakt._getArticle = word => (['a', 'e', 'i', 'o', 'u', 'y'].includes(word[0]) ? 'an' : 'a');

// helper function which formats error messages
vakt._formatErrorMessage = (name, type) => `${name} must be ${vakt._getArticle(type)} ${type}`;

vakt.check = (variable, type) => {
  // handle multiple checks at once
  if (vakt.is.array(variable) && vakt.is.undefined(type)) {
    variable.forEach(x => vakt.check(x[0], x[1]));
    return;
  }

  // sanity checks
  if (!vakt._variableIsValid(variable)) throw new Error('Variable must be passed to vakt as an object with a single property');
  if (vakt.is.not.string(type)) throw new Error('Type must be passed to vakt as a string');

  const name = Object.keys(variable)[0];
  const value = variable[name];
  let valid = null;

  if (vakt.is.function(vakt.customTypes[type])) {
    // call the custom type checking function
    valid = vakt.customTypes[type](value);
  } else if (vakt.types.includes(type)) {
    // call is's type checking function
    valid = vakt.is[type](value);
  } else {
    throw new Error(`Unknown type passed to vakt: '${type}'`);
  }

  if (!valid) {
    // throw with a formatted error message if the type is invalid
    throw new TypeError(vakt._formatErrorMessage(name, type));
  }
};

module.exports = vakt;
