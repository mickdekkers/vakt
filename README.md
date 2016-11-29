<p align="center">
  <img alt="vakt" src="https://github.com/soullesswaffle/vakt/blob/master/header.svg?raw=true" height="96">
</p>

<p align="center">
  A modern type guard utility for Node.js
</p>

## Installation

Requires Node.js v6 [LTS] or greater.

```bash
$ npm install vakt
```

## Usage

### Basic usage

vakt throws an error when a variable is not of the expected type.

```js
const vakt = require('vakt');

const greet = (name) => {
  vakt.check({ name }, 'string');

  return `Hello, ${name}!`;
};

greet('Alice'); // => Hello, Alice!

greet(3.14159); // => TypeError: name must be a string
```

vakt takes advantage of the [ES6/ES2015 property value shorthand][es6pvs] so you don't have to write the variable twice.

### With Promises

You can also use a vakt check in a Promise, since thrown errors automatically become rejections.

```js
const vakt = require('vakt');

const delay = (ms) => {
  return new Promise((resolve, reject) => {
    vakt.check({ ms }, 'number');

    // if we reach this part, ms is guaranteed to be a number
    setTimeout(resolve, ms);
    resolve();
  });
};

delay(5000).then(() => {
  console.log('5 seconds have passed!');
});
// => 5 seconds have passed!

delay(false).catch((err) => {
  console.error(err);
});
// => TypeError: ms must be a number
```

### Define custom types

vakt lets you create your own type checks by providing it a validation function that returns true or false.

```js
const vakt = require('vakt');

vakt.customTypes['non-negative integer'] = (value) => vakt.is.integer(value) && value >= 0;

const pick = (array, index) => {
  vakt.check({ array }, 'array');
  vakt.check({ index }, 'non-negative integer');

  return array[index];
};

pick([4, 8, 15, 16, 23, 42], 3); // => 16

pick(['rainbows', 'unicorns'], -12.5); // => TypeError: index must be a non-negative integer
```

### Multiple checks at once

vakt also has a handy shorthand for checking multiple variables with one call.

```js
const vakt = require('vakt');

const doMaths = (num1, num2, round) => {
  vakt.check([
    [{ num1 },  'number'],
    [{ num2 },  'number'],
    [{ round }, 'boolean'],
  ]);

  let value = 1 / (num1 * num2);

  if (round) value = Math.round(value);

  return value;
};

doMaths(1, 2, false); // => 0.5

doMaths(1, 2, 3) // => TypeError: round must be a boolean
```

## API

### `vakt.check(variable, type)`
### `vakt.check([[variable, type], [variable, type], [...]])`

#### `variable`

Type: `object`

The variable to check. Should be in the form of `{ name: value }`.
Since you will practically always want to pass both the name and value of a variable,
you can make use of the [ES6/ES2015 property value shorthand][es6pvs] to save you some typing: `{ name }`

#### `type`

Type: `string`

The type to validate against, passed as a string.

### `vakt.types`

Type: `array`

An array of the types vakt can check out of the box:
```js
[
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
]
```

### `vakt.is`

Type: `object`

An instance of the [_is.js_ micro check library][isjs] which vakt uses to perform type checks.

### `vakt.customTypes`

Type: `object`

An object containing the custom types that have been added to vakt. To define a new custom type you can add a validation function directly to the object. The validation function should return `true` or `false`.

```js
vakt.customTypes['cat'] = (value) => vakt.is.object(value) && vakt.is.function(value['meow']);
```

Once you have defined a custom type, you can use it with `vakt.check`:

```js
const dog = {
  woof () {
    console.log('woof!');
  },
};

vakt.check({ dog }, 'cat'); // => TypeError: dog must be a cat
```

### `vakt.VERSION`

Type: `string`

The version of vakt in [semver] format.

## License

MIT © [Mick Dekkers][gh-profile]

[lts]: https://github.com/nodejs/LTS#lts-schedule
[es6pvs]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Object_initializer#Property_definitions
[isjs]: http://is.js.org/
[semver]: http://semver.org/
[gh-profile]: https://github.com/soullesswaffle
