'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var path = require('path');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var Shard = require('./Shard');
var Collection = require('../util/Collection');
var Util = require('../util/Util');

/**
 * This is a utility class that can be used to help you spawn shards of your Client. Each shard is completely separate
 * from the other. The Shard Manager takes a path to a file and spawns it under the specified amount of shards safely.
 * If you do not select an amount of shards, the manager will automatically decide the best amount.
 * @extends {EventEmitter}
 */

var ShardingManager = function (_EventEmitter) {
  _inherits(ShardingManager, _EventEmitter);

  /**
   * @param {string} file Path to your shard script file
   * @param {Object} [options] Options for the sharding manager
   * @param {number|string} [options.totalShards='auto'] Number of shards to spawn, or "auto"
   * @param {boolean} [options.respawn=true] Whether shards should automatically respawn upon exiting
   * @param {string[]} [options.shardArgs=[]] Arguments to pass to the shard script when spawning
   * @param {string} [options.token] Token to use for automatic shard count and passing to shards
   */
  function ShardingManager(file) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ShardingManager);

    var _this = _possibleConstructorReturn(this, (ShardingManager.__proto__ || Object.getPrototypeOf(ShardingManager)).call(this));

    options = Util.mergeDefault({
      totalShards: 'auto',
      respawn: true,
      shardArgs: [],
      token: null
    }, options);

    /**
     * Path to the shard script file
     * @type {string}
     */
    _this.file = file;
    if (!file) throw new Error('File must be specified.');
    if (!path.isAbsolute(file)) _this.file = path.resolve(process.cwd(), file);
    var stats = fs.statSync(_this.file);
    if (!stats.isFile()) throw new Error('File path does not point to a file.');

    /**
     * Amount of shards that this manager is going to spawn
     * @type {number|string}
     */
    _this.totalShards = options.totalShards;
    if (_this.totalShards !== 'auto') {
      if (typeof _this.totalShards !== 'number' || isNaN(_this.totalShards)) {
        throw new TypeError('Amount of shards must be a number.');
      }
      if (_this.totalShards < 1) throw new RangeError('Amount of shards must be at least 1.');
      if (_this.totalShards !== Math.floor(_this.totalShards)) {
        throw new RangeError('Amount of shards must be an integer.');
      }
    }

    /**
     * Whether shards should automatically respawn upon exiting
     * @type {boolean}
     */
    _this.respawn = options.respawn;

    /**
     * An array of arguments to pass to shards.
     * @type {string[]}
     */
    _this.shardArgs = options.shardArgs;

    /**
     * Token to use for obtaining the automatic shard count, and passing to shards
     * @type {?string}
     */
    _this.token = options.token ? options.token.replace(/^Bot\s*/i, '') : null;

    /**
     * A collection of shards that this manager has spawned
     * @type {Collection<number, Shard>}
     */
    _this.shards = new Collection();
    return _this;
  }

  /**
   * Spawns a single shard.
   * @param {number} id The ID of the shard to spawn. **This is usually not necessary.**
   * @returns {Promise<Shard>}
   */


  _createClass(ShardingManager, [{
    key: 'createShard',
    value: function createShard() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.shards.size;

      var shard = new Shard(this, id, this.shardArgs);
      this.shards.set(id, shard);
      /**
       * Emitted upon launching a shard
       * @event ShardingManager#launch
       * @param {Shard} shard Shard that was launched
       */
      this.emit('launch', shard);
      return Promise.resolve(shard);
    }

    /**
     * Spawns multiple shards.
     * @param {number} [amount=this.totalShards] Number of shards to spawn
     * @param {number} [delay=5500] How long to wait in between spawning each shard (in milliseconds)
     * @returns {Promise<Collection<number, Shard>>}
     */

  }, {
    key: 'spawn',
    value: function spawn() {
      var _this2 = this;

      var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.totalShards;
      var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5500;

      if (amount === 'auto') {
        return Util.fetchRecommendedShards(this.token).then(function (count) {
          _this2.totalShards = count;
          return _this2._spawn(count, delay);
        });
      } else {
        if (typeof amount !== 'number' || isNaN(amount)) throw new TypeError('Amount of shards must be a number.');
        if (amount < 1) throw new RangeError('Amount of shards must be at least 1.');
        if (amount !== Math.floor(amount)) throw new TypeError('Amount of shards must be an integer.');
        return this._spawn(amount, delay);
      }
    }

    /**
     * Actually spawns shards, unlike that poser above >:(
     * @param {number} amount Number of shards to spawn
     * @param {number} delay How long to wait in between spawning each shard (in milliseconds)
     * @returns {Promise<Collection<number, Shard>>}
     * @private
     */

  }, {
    key: '_spawn',
    value: function _spawn(amount, delay) {
      var _this3 = this;

      return new Promise(function (resolve) {
        if (_this3.shards.size >= amount) throw new Error('Already spawned ' + _this3.shards.size + ' shards.');
        _this3.totalShards = amount;

        _this3.createShard();
        if (_this3.shards.size >= _this3.totalShards) {
          resolve(_this3.shards);
          return;
        }

        if (delay <= 0) {
          while (_this3.shards.size < _this3.totalShards) {
            _this3.createShard();
          }resolve(_this3.shards);
        } else {
          var interval = setInterval(function () {
            _this3.createShard();
            if (_this3.shards.size >= _this3.totalShards) {
              clearInterval(interval);
              resolve(_this3.shards);
            }
          }, delay);
        }
      });
    }

    /**
     * Send a message to all shards.
     * @param {*} message Message to be sent to the shards
     * @returns {Promise<Shard[]>}
     */

  }, {
    key: 'broadcast',
    value: function broadcast(message) {
      var promises = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.shards.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var shard = _step.value;
          promises.push(shard.send(message));
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

      return Promise.all(promises);
    }

    /**
     * Evaluates a script on all shards, in the context of the Clients.
     * @param {string} script JavaScript to run on each shard
     * @returns {Promise<Array>} Results of the script execution
     */

  }, {
    key: 'broadcastEval',
    value: function broadcastEval(script) {
      var promises = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.shards.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var shard = _step2.value;
          promises.push(shard.eval(script));
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

      return Promise.all(promises);
    }

    /**
     * Fetches a Client property value of each shard.
     * @param {string} prop Name of the Client property to get, using periods for nesting
     * @returns {Promise<Array>}
     * @example
     * manager.fetchClientValues('guilds.size').then(results => {
     *   console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`);
     * }).catch(console.error);
     */

  }, {
    key: 'fetchClientValues',
    value: function fetchClientValues(prop) {
      if (this.shards.size === 0) return Promise.reject(new Error('No shards have been spawned.'));
      if (this.shards.size !== this.totalShards) return Promise.reject(new Error('Still spawning shards.'));
      var promises = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.shards.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var shard = _step3.value;
          promises.push(shard.fetchClientValue(prop));
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

      return Promise.all(promises);
    }
  }]);

  return ShardingManager;
}(EventEmitter);

module.exports = ShardingManager;