'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatErrorMessage = exports.getArticle = exports.variableIsValid = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _is_js = require('is_js');

var _is_js2 = _interopRequireDefault(_is_js);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vakt = {};
vakt.VERSION = '0.1.0';

vakt.is = _is_js2.default;

vakt.types = ['array', 'boolean', 'date', 'decimal', 'function', 'integer', 'number', 'object', 'regexp', 'string'];

vakt.customTypes = {};

// helper function which validates variable argument to make sure it matches { name: value }
var variableIsValid = exports.variableIsValid = function variableIsValid(variable) {
  return vakt.is.object(variable) && vakt.is.not.array(variable) && (0, _keys2.default)(variable).length === 1;
};

// helper function which returns the proper article for a word (most of the time)
var getArticle = exports.getArticle = function getArticle(word) {
  return ['a', 'e', 'i', 'o', 'u', 'y'].includes(word[0]) ? 'an' : 'a';
};

// helper function which formats error messages
var formatErrorMessage = exports.formatErrorMessage = function formatErrorMessage(name, type) {
  return name + ' must be ' + getArticle(type) + ' ' + type;
};

vakt.check = function (variable, type) {
  // handle multiple checks at once
  if (vakt.is.array(variable) && vakt.is.undefined(type)) {
    variable.forEach(function (x) {
      return vakt.check(x[0], x[1]);
    });
    return;
  }

  // sanity checks
  if (!variableIsValid(variable)) throw new Error('Variable must be passed to vakt as an object with a single property');
  if (vakt.is.not.string(type)) throw new Error('Type must be passed to vakt as a string');

  var name = (0, _keys2.default)(variable)[0];
  var value = variable[name];
  var valid = null;

  if (vakt.is.function(vakt.customTypes[type])) {
    // call the custom type checking function
    valid = vakt.customTypes[type](value);
  } else if (vakt.types.includes(type)) {
    // call is's type checking function
    valid = vakt.is[type](value);
  } else {
    throw new Error('Unknown type passed to vakt: \'' + type + '\'');
  }

  if (!valid) {
    // throw with a formatted error message if the type is invalid
    throw new TypeError(formatErrorMessage(name, type));
  }
};

exports.default = vakt;