/* eslint import/no-extraneous-dependencies: ['error', {'devDependencies': true}] */

import fsp from 'fs-promise';
import test from 'ava';
import vakt from './index';

test.serial('vakt starts without any custom types defined', (t) => {
  t.is(Object.keys(vakt.customTypes).length, 0);
});

test.serial('vakt.check throws when an unknown type is passed', (t) => {
  t.throws(() => {
    const nni = 1;
    vakt.check({ nni }, 'non-negative integer');
  }, /unknown type/i);
});

test.serial('vakt allows you to define custom types and checks them correctly', (t) => {
  vakt.customTypes['non-negative integer'] = x => vakt.is.integer(x) && x >= 0;

  t.is(typeof vakt.customTypes['non-negative integer'], 'function');

  t.throws(() => {
    const nni = 1.5;
    vakt.check({ nni }, 'non-negative integer');
  }, /non-negative integer/);

  t.notThrows(() => {
    const nni = 2;
    vakt.check({ nni }, 'non-negative integer');
  });
});

test('vakt.VERSION === package.json version', async (t) => {
  const packageData = await fsp.readFile('./package.json', 'utf8');
  const packageVersion = JSON.parse(packageData).version;
  t.is(vakt.VERSION, packageVersion);
});

test('variableIsValid validates whether a variable is passed correctly', (t) => {
  const array = ['nope'];
  const boolean = true;
  const emptyObject = {};
  const objectWithTooManyProperties = { a: array, b: boolean };
  const validObject = { a: array };

  t.false(vakt._variableIsValid(array));
  t.false(vakt._variableIsValid(boolean));
  t.false(vakt._variableIsValid(emptyObject));
  t.false(vakt._variableIsValid(objectWithTooManyProperties));
  t.true(vakt._variableIsValid(validObject));
});

test('getArticle returns the proper article for a word (most of the time)', (t) => {
  t.is(vakt._getArticle('array'), 'an');
  t.is(vakt._getArticle('boolean'), 'a');
  t.is(vakt._getArticle('date'), 'a');
  t.is(vakt._getArticle('cat'), 'a');
  t.is(vakt._getArticle('integer'), 'an');
  t.is(vakt._getArticle('regexp'), 'a');
});

test('formatErrorMessage returns a correctly formatted error message', (t) => {
  t.is(vakt._formatErrorMessage('names', 'array'), 'names must be an array');
  t.is(vakt._formatErrorMessage('predicate', 'function'), 'predicate must be a function');
  t.is(vakt._formatErrorMessage('snuggles', 'cat'), 'snuggles must be a cat');
});

test('vakt.check throws if the variable is not passed correctly', (t) => {
  const invalidVariableErrorMessage = /as an object with a single property/;

  t.throws(() => {
    const array = ['nope'];
    vakt.check(array, 'array');
  }, invalidVariableErrorMessage);
  t.throws(() => {
    const boolean = true;
    vakt.check(boolean, 'boolean');
  }, invalidVariableErrorMessage);
  t.throws(() => {
    const emptyObject = {};
    vakt.check(emptyObject, 'object');
  }, invalidVariableErrorMessage);
});

test('vakt.check throws if the type is not passed as a string', (t) => {
  const invalidTypeErrorMessage = /as a string/;

  t.throws(() => {
    const boolean = true;
    vakt.check({ boolean }, false);
  }, invalidTypeErrorMessage);
  t.throws(() => {
    const array = ['Hello!'];
    vakt.check({ array }, []);
  }, invalidTypeErrorMessage);
  t.throws(() => {
    const func = x => x;
    vakt.check({ func }, y => y);
  }, invalidTypeErrorMessage);
});

test('vakt.check calls `is` check for the `array` type correctly', (t) => {
  // array
  t.notThrows(() => {
    const array = ['Hello!'];
    vakt.check({ array }, 'array');
  });
  t.throws(() => {
    const array = false;
    vakt.check({ array }, 'array');
  }, TypeError);
});

test('vakt.check calls `is` check for the `boolean` type correctly', (t) => {
  // boolean
  t.notThrows(() => {
    const boolean = true;
    vakt.check({ boolean }, 'boolean');
  });
  t.throws(() => {
    const boolean = { nope: 0 };
    vakt.check({ boolean }, 'boolean');
  }, TypeError);
});

test('vakt.check calls `is` check for the `date` type correctly', (t) => {
  // date
  t.notThrows(() => {
    const date = new Date();
    vakt.check({ date }, 'date');
  });
  t.throws(() => {
    const date = 3.14159;
    vakt.check({ date }, 'date');
  }, TypeError);
});

test('vakt.check calls `is` check for the `decimal` type correctly', (t) => {
  // decimal
  t.notThrows(() => {
    const decimal = 1.5;
    vakt.check({ decimal }, 'decimal');
  });
  t.throws(() => {
    const decimal = 2;
    vakt.check({ decimal }, 'decimal');
  }, TypeError);
});

test('vakt.check calls `is` check for the `function` type correctly', (t) => {
  // function
  t.notThrows(() => {
    const func = x => x;
    vakt.check({ func }, 'function');
  });
  t.throws(() => {
    const func = [];
    vakt.check({ func }, 'function');
  }, TypeError);
});

test('vakt.check calls `is` check for the `integer` type correctly', (t) => {
  // integer
  t.notThrows(() => {
    const integer = 16;
    vakt.check({ integer }, 'integer');
  });
  t.throws(() => {
    const integer = 1.5;
    vakt.check({ integer }, 'integer');
  }, TypeError);
});

test('vakt.check calls `is` check for the `number` type correctly', (t) => {
  // number
  t.notThrows(() => {
    const number = 12;
    vakt.check({ number }, 'number');

    const alsoANumber = 9 + (3 / 4);
    vakt.check({ alsoANumber }, 'number');
  });
  t.throws(() => {
    const number = false;
    vakt.check({ number }, 'number');
  }, TypeError);
});

test('vakt.check calls `is` check for the `object` type correctly', (t) => {
  // object
  t.notThrows(() => {
    const object = {};
    vakt.check({ object }, 'object');
  });
  t.throws(() => {
    const object = '!';
    vakt.check({ object }, 'object');
  }, TypeError);
});

test('vakt.check calls `is` check for the `regexp` type correctly', (t) => {
  // regexp
  t.notThrows(() => {
    const regexp = /a regexp/gi;
    vakt.check({ regexp }, 'regexp');

    const alsoARegexp = new RegExp('also a regexp', 'gi');
    vakt.check({ alsoARegexp }, 'regexp');
  });
  t.throws(() => {
    const regexp = 'not a regexp';
    vakt.check({ regexp }, 'regexp');
  }, TypeError);
});

test('vakt.check calls `is` check for the `string` type correctly', (t) => {
  // string
  t.notThrows(() => {
    const string = 'I know words';
    vakt.check({ string }, 'string');
  });
  t.throws(() => {
    const string = -12.5;
    vakt.check({ string }, 'string');
  }, TypeError);
});

test('vakt.check supports checking multiple variables with one call', (t) => {
  t.notThrows(() => {
    const quote = 'I know words';
    const greetings = ['Hello!', 'Bonjour!'];
    const dozen = 12;
    vakt.check([
      [{ quote }, 'string'],
      [{ greetings }, 'array'],
      [{ dozen }, 'number'],
    ]);
  });
  t.throws(() => {
    const quote = 'I know words';
    const greetings = false;
    const dozen = 12;
    vakt.check([
      [{ quote }, 'string'],
      [{ greetings }, 'array'],
      [{ dozen }, 'number'],
    ]);
  }, /greetings/);
});
