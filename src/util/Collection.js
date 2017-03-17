'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A Map with additional utility methods. This is used throughout discord.js rather than Arrays for anything that has
 * an ID, for significantly improved performance and ease-of-use.
 * @extends {Map}
 */
var Collection = function (_Map) {
  _inherits(Collection, _Map);

  function Collection(iterable) {
    _classCallCheck(this, Collection);

    /**
     * Cached array for the `array()` method - will be reset to `null` whenever `set()` or `delete()` are called.
     * @name Collection#_array
     * @type {?Array}
     * @private
     */
    var _this = _possibleConstructorReturn(this, (Collection.__proto__ || Object.getPrototypeOf(Collection)).call(this, iterable));

    Object.defineProperty(_this, '_array', { value: null, writable: true, configurable: true });

    /**
     * Cached array for the `keyArray()` method - will be reset to `null` whenever `set()` or `delete()` are called.
     * @name Collection#_keyArray
     * @type {?Array}
     * @private
     */
    Object.defineProperty(_this, '_keyArray', { value: null, writable: true, configurable: true });
    return _this;
  }

  _createClass(Collection, [{
    key: 'set',
    value: function set(key, val) {
      this._array = null;
      this._keyArray = null;
      return _get(Collection.prototype.__proto__ || Object.getPrototypeOf(Collection.prototype), 'set', this).call(this, key, val);
    }
  }, {
    key: 'delete',
    value: function _delete(key) {
      this._array = null;
      this._keyArray = null;
      return _get(Collection.prototype.__proto__ || Object.getPrototypeOf(Collection.prototype), 'delete', this).call(this, key);
    }

    /**
     * Creates an ordered array of the values of this collection, and caches it internally. The array will only be
     * reconstructed if an item is added to or removed from the collection, or if you change the length of the array
     * itself. If you don't want this caching behaviour, use `Array.from(collection.values())` instead.
     * @returns {Array}
     */

  }, {
    key: 'array',
    value: function array() {
      if (!this._array || this._array.length !== this.size) this._array = Array.from(this.values());
      return this._array;
    }

    /**
     * Creates an ordered array of the keys of this collection, and caches it internally. The array will only be
     * reconstructed if an item is added to or removed from the collection, or if you change the length of the array
     * itself. If you don't want this caching behaviour, use `Array.from(collection.keys())` instead.
     * @returns {Array}
     */

  }, {
    key: 'keyArray',
    value: function keyArray() {
      if (!this._keyArray || this._keyArray.length !== this.size) this._keyArray = Array.from(this.keys());
      return this._keyArray;
    }

    /**
     * Obtains the first item in this collection.
     * @returns {*}
     */

  }, {
    key: 'first',
    value: function first() {
      return this.values().next().value;
    }

    /**
     * Obtains the first key in this collection.
     * @returns {*}
     */

  }, {
    key: 'firstKey',
    value: function firstKey() {
      return this.keys().next().value;
    }

    /**
     * Obtains the last item in this collection. This relies on the `array()` method, and thus the caching mechanism
     * applies here as well.
     * @returns {*}
     */

  }, {
    key: 'last',
    value: function last() {
      var arr = this.array();
      return arr[arr.length - 1];
    }

    /**
     * Obtains the last key in this collection. This relies on the `keyArray()` method, and thus the caching mechanism
     * applies here as well.
     * @returns {*}
     */

  }, {
    key: 'lastKey',
    value: function lastKey() {
      var arr = this.keyArray();
      return arr[arr.length - 1];
    }

    /**
     * Obtains a random item from this collection. This relies on the `array()` method, and thus the caching mechanism
     * applies here as well.
     * @returns {*}
     */

  }, {
    key: 'random',
    value: function random() {
      var arr = this.array();
      return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Obtains a random key from this collection. This relies on the `keyArray()` method, and thus the caching mechanism
     * applies here as well.
     * @returns {*}
     */

  }, {
    key: 'randomKey',
    value: function randomKey() {
      var arr = this.keyArray();
      return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Searches for all items where their specified property's value is identical to the given value
     * (`item[prop] === value`).
     * @param {string} prop The property to test against
     * @param {*} value The expected value
     * @returns {Array}
     * @example
     * collection.findAll('username', 'Bob');
     */

  }, {
    key: 'findAll',
    value: function findAll(prop, value) {
      if (typeof prop !== 'string') throw new TypeError('Key must be a string.');
      if (typeof value === 'undefined') throw new Error('Value must be specified.');
      var results = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          if (item[prop] === value) results.push(item);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return results;
    }

    /**
     * Searches for a single item where its specified property's value is identical to the given value
     * (`item[prop] === value`), or the given function returns a truthy value. In the latter case, this is identical to
     * [Array.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find).
     * <warn>All collections used in Discord.js are mapped using their `id` property, and if you want to find by id you
     * should use the `get` method. See
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get) for details.</warn>
     * @param {string|Function} propOrFn The property to test against, or the function to test with
     * @param {*} [value] The expected value - only applicable and required if using a property for the first argument
     * @returns {*}
     * @example
     * collection.find('username', 'Bob');
     * @example
     * collection.find(val => val.username === 'Bob');
     */

  }, {
    key: 'find',
    value: function find(propOrFn, value) {
      if (typeof propOrFn === 'string') {
        if (typeof value === 'undefined') throw new Error('Value must be specified.');
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var item = _step2.value;

            if (item[propOrFn] === value) return item;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return null;
      } else if (typeof propOrFn === 'function') {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _step3$value = _slicedToArray(_step3.value, 2),
                key = _step3$value[0],
                val = _step3$value[1];

            if (propOrFn(val, key, this)) return val;
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return null;
      } else {
        throw new Error('First argument must be a property string or a function.');
      }
    }

    /* eslint-disable max-len */
    /**
     * Searches for the key of a single item where its specified property's value is identical to the given value
     * (`item[prop] === value`), or the given function returns a truthy value. In the latter case, this is identical to
     * [Array.findIndex()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex).
     * @param {string|Function} propOrFn The property to test against, or the function to test with
     * @param {*} [value] The expected value - only applicable and required if using a property for the first argument
     * @returns {*}
     * @example
     * collection.findKey('username', 'Bob');
     * @example
     * collection.findKey(val => val.username === 'Bob');
     */
    /* eslint-enable max-len */

  }, {
    key: 'findKey',
    value: function findKey(propOrFn, value) {
      if (typeof propOrFn === 'string') {
        if (typeof value === 'undefined') throw new Error('Value must be specified.');
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _step4$value = _slicedToArray(_step4.value, 2),
                key = _step4$value[0],
                val = _step4$value[1];

            if (val[propOrFn] === value) return key;
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        return null;
      } else if (typeof propOrFn === 'function') {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = this[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var _step5$value = _slicedToArray(_step5.value, 2),
                key = _step5$value[0],
                val = _step5$value[1];

            if (propOrFn(val, key, this)) return key;
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        return null;
      } else {
        throw new Error('First argument must be a property string or a function.');
      }
    }

    /**
     * Searches for the existence of a single item where its specified property's value is identical to the given value
     * (`item[prop] === value`).
     * <warn>Do not use this to check for an item by its ID. Instead, use `collection.has(id)`. See
     * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has) for details.</warn>
     * @param {string} prop The property to test against
     * @param {*} value The expected value
     * @returns {boolean}
     * @example
     * if (collection.exists('username', 'Bob')) {
     *  console.log('user here!');
     * }
     */

  }, {
    key: 'exists',
    value: function exists(prop, value) {
      if (prop === 'id') throw new RangeError('Don\'t use .exists() with IDs. Instead, use .has(id).');
      return Boolean(this.find(prop, value));
    }

    /**
     * Identical to
     * [Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),
     * but returns a Collection instead of an Array.
     * @param {Function} fn Function used to test (should return a boolean)
     * @param {Object} [thisArg] Value to use as `this` when executing function
     * @returns {Collection}
     */

  }, {
    key: 'filter',
    value: function filter(fn, thisArg) {
      if (thisArg) fn = fn.bind(thisArg);
      var results = new Collection();
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var _step6$value = _slicedToArray(_step6.value, 2),
              key = _step6$value[0],
              val = _step6$value[1];

          if (fn(val, key, this)) results.set(key, val);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return results;
    }

    /**
     * Identical to
     * [Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).
     * @param {Function} fn Function used to test (should return a boolean)
     * @param {Object} [thisArg] Value to use as `this` when executing function
     * @returns {Array}
     */

  }, {
    key: 'filterArray',
    value: function filterArray(fn, thisArg) {
      if (thisArg) fn = fn.bind(thisArg);
      var results = [];
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var _step7$value = _slicedToArray(_step7.value, 2),
              key = _step7$value[0],
              val = _step7$value[1];

          if (fn(val, key, this)) results.push(val);
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      return results;
    }

    /**
     * Identical to
     * [Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).
     * @param {Function} fn Function that produces an element of the new array, taking three arguments
     * @param {*} [thisArg] Value to use as `this` when executing function
     * @returns {Array}
     */

  }, {
    key: 'map',
    value: function map(fn, thisArg) {
      if (thisArg) fn = fn.bind(thisArg);
      var arr = new Array(this.size);
      var i = 0;
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var _step8$value = _slicedToArray(_step8.value, 2),
              key = _step8$value[0],
              val = _step8$value[1];

          arr[i++] = fn(val, key, this);
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      return arr;
    }

    /**
     * Identical to
     * [Array.some()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some).
     * @param {Function} fn Function used to test (should return a boolean)
     * @param {Object} [thisArg] Value to use as `this` when executing function
     * @returns {boolean}
     */

  }, {
    key: 'some',
    value: function some(fn, thisArg) {
      if (thisArg) fn = fn.bind(thisArg);
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = this[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var _step9$value = _slicedToArray(_step9.value, 2),
              key = _step9$value[0],
              val = _step9$value[1];

          if (fn(val, key, this)) return true;
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      return false;
    }

    /**
     * Identical to
     * [Array.every()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every).
     * @param {Function} fn Function used to test (should return a boolean)
     * @param {Object} [thisArg] Value to use as `this` when executing function
     * @returns {boolean}
     */

  }, {
    key: 'every',
    value: function every(fn, thisArg) {
      if (thisArg) fn = fn.bind(thisArg);
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = this[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var _step10$value = _slicedToArray(_step10.value, 2),
              key = _step10$value[0],
              val = _step10$value[1];

          if (!fn(val, key, this)) return false;
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      return true;
    }

    /**
     * Identical to
     * [Array.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce).
     * @param {Function} fn Function used to reduce, taking four arguments; `accumulator`, `currentValue`, `currentKey`,
     * and `collection`
     * @param {*} [initialValue] Starting value for the accumulator
     * @returns {*}
     */

  }, {
    key: 'reduce',
    value: function reduce(fn, initialValue) {
      var accumulator = void 0;
      if (typeof initialValue !== 'undefined') {
        accumulator = initialValue;
        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = this[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var _step11$value = _slicedToArray(_step11.value, 2),
                key = _step11$value[0],
                val = _step11$value[1];

            accumulator = fn(accumulator, val, key, this);
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11.return) {
              _iterator11.return();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }
      } else {
        var first = true;
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = this[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var _step12$value = _slicedToArray(_step12.value, 2),
                key = _step12$value[0],
                val = _step12$value[1];

            if (first) {
              accumulator = val;
              first = false;
              continue;
            }
            accumulator = fn(accumulator, val, key, this);
          }
        } catch (err) {
          _didIteratorError12 = true;
          _iteratorError12 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion12 && _iterator12.return) {
              _iterator12.return();
            }
          } finally {
            if (_didIteratorError12) {
              throw _iteratorError12;
            }
          }
        }
      }
      return accumulator;
    }

    /**
     * Creates an identical shallow copy of this collection.
     * @returns {Collection}
     * @example const newColl = someColl.clone();
     */

  }, {
    key: 'clone',
    value: function clone() {
      return new this.constructor(this);
    }

    /**
     * Combines this collection with others into a new collection. None of the source collections are modified.
     * @param {...Collection} collections Collections to merge
     * @returns {Collection}
     * @example const newColl = someColl.concat(someOtherColl, anotherColl, ohBoyAColl);
     */

  }, {
    key: 'concat',
    value: function concat() {
      var newColl = this.clone();

      for (var _len = arguments.length, collections = Array(_len), _key = 0; _key < _len; _key++) {
        collections[_key] = arguments[_key];
      }

      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = collections[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          var coll = _step13.value;
          var _iteratorNormalCompletion14 = true;
          var _didIteratorError14 = false;
          var _iteratorError14 = undefined;

          try {
            for (var _iterator14 = coll[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
              var _step14$value = _slicedToArray(_step14.value, 2),
                  key = _step14$value[0],
                  val = _step14$value[1];

              newColl.set(key, val);
            }
          } catch (err) {
            _didIteratorError14 = true;
            _iteratorError14 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion14 && _iterator14.return) {
                _iterator14.return();
              }
            } finally {
              if (_didIteratorError14) {
                throw _iteratorError14;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion13 && _iterator13.return) {
            _iterator13.return();
          }
        } finally {
          if (_didIteratorError13) {
            throw _iteratorError13;
          }
        }
      }

      return newColl;
    }

    /**
     * Calls the `delete()` method on all items that have it.
     * @returns {Promise[]}
     */

  }, {
    key: 'deleteAll',
    value: function deleteAll() {
      var returns = [];
      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = this.values()[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          var item = _step15.value;

          if (item.delete) returns.push(item.delete());
        }
      } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion15 && _iterator15.return) {
            _iterator15.return();
          }
        } finally {
          if (_didIteratorError15) {
            throw _iteratorError15;
          }
        }
      }

      return returns;
    }

    /**
     * Checks if this collection shares identical key-value pairings with another.
     * This is different to checking for equality using equal-signs, because
     * the collections may be different objects, but contain the same data.
     * @param {Collection} collection Collection to compare with
     * @returns {boolean} Whether the collections have identical contents
     */

  }, {
    key: 'equals',
    value: function equals(collection) {
      if (!collection) return false;
      if (this === collection) return true;
      if (this.size !== collection.size) return false;
      return !this.find(function (value, key) {
        var testVal = collection.get(key);
        return testVal !== value || testVal === undefined && !collection.has(key);
      });
    }
  }]);

  return Collection;
}(Map);

module.exports = Collection;