'use strict';
var assert = require('assert');
var util = require('util');
var slice = Array.prototype.slice;

/**
 *
 * @param {function} fn
 * @returns {function}
 */
function promisify(fn) {
	assert(typeof fn == 'function', 'function required');

	return function() {
		var args = slice.call(arguments);
		var ctx = this;

		return new Promise(function(resolve, reject) {
			args.push(function promisedWork() {
				var args = slice.call(arguments);

				//if error
				if (args[0]) {
					reject(args[0]);
				//if pass and no return values
				} else if (args.length == 1) {
					resolve();
				//if pass and one value
				} else if (args.length == 2) {
					resolve(args[1]);
				//if pass and many values
				} else {
					resolve(args.slice(1));
				}
			});
			fn.apply(ctx, args);
		});
	};
}

/**
 *
 * @param {object} source
 * @param {string[]} whitelist
 * @param {string} [suffix='Async']
 * @returns {object}
 */
function promissoryObject(source, whitelist, suffix) {
	var dest = Object.create(source);
	setMethods(dest, whitelist, suffix);
	return dest;
}

/**
 *
 * @param {function} source
 * @param {string[]} objWhitelist
 * @param {string[]} [classWhitelist]
 * @param {string} [suffix='Async']
 * @returns {function}
 */
function promissoryClass(source, objWhitelist, classWhitelist, suffix) {
	var dest;
	classWhitelist = classWhitelist || [];

	dest = function PromisoryClass() {
		PromisoryClass.super_.apply(this, arguments);
	};
	if (Object.setPrototypeOf) {
		Object.setPrototypeOf(dest, source);
	} else {
		/*jshint proto: true */
		dest.__proto__ = source;
	}
	util.inherits(dest, source);

	setMethods(dest.prototype, objWhitelist, suffix);
	if (classWhitelist) {
		setMethods(dest, classWhitelist, suffix);
	}
	return dest;
}

function getDescriptor(obj, prop) {
	var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
	if (descriptor) {
		return descriptor;
	} else if (Object.getPrototypeOf(obj)) {
		return getDescriptor(Object.getPrototypeOf(obj), prop);
	} else {
		return null;
	}
}

function setMethods(source, whitelist, suffix) {
	var i, key, val, type, descriptor, props;
	suffix = suffix || 'Async';

	type = typeof source;
	assert(type === 'object' || type === 'function', 'Source should be a class or an object');

	props = {};
	for (i = 0; i < whitelist.length; i++) {
		key = whitelist[i];
		if (!(key in source)) {
			continue;
		}
		val = source[key];
		assert(typeof val === 'function', util.format('Source property `%s` is not a function', key));
		descriptor = getDescriptor(source, key);
		descriptor.value = promisify(val);
		props[key + suffix] = descriptor;
	}
	Object.defineProperties(source, props);

	return source;
}

exports = module.exports = promisify;
exports.promisify = promisify;
exports.object = promissoryObject;
exports.class = promissoryClass;
