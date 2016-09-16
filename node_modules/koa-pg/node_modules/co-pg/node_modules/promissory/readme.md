Promissory
==========

Turn a regular node function into one which returns an ES6 Promise. This can also be used
with generator-based flow control such as [co](https://github.com/tj/co).

This project is a direct port of [tj/thunkify](https://github.com/tj/node-thunkify). Instead
of creating thunks, it creates promises.

This is tested with Node v0.10 up to v5. A Promise polyfill is required to be set globally on v0.10.

Installation
------------

```
$ npm install promissory
```

Example
-------

```js
var promisify = require('promissory').promisify;
var fs = require('fs');

var readPromissory = promisify(fs.readFile);

readPromissory('package.json', 'utf8').then(function(str) {
	console.log('str');
}, function(err) {
	console.error(err);
});
```

License
-------

MIT
