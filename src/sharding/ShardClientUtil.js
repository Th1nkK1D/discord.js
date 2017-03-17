'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = require('../util/Util');

/**
 * Helper class for sharded clients spawned as a child process, such as from a ShardingManager
 */

var ShardClientUtil = function () {
  /**
   * @param {Client} client Client of the current shard
   */
  function ShardClientUtil(client) {
    _classCallCheck(this, ShardClientUtil);

    this.client = client;
    process.on('message', this._handleMessage.bind(this));
  }

  /**
   * ID of this shard
   * @type {number}
   * @readonly
   */


  _createClass(ShardClientUtil, [{
    key: 'send',


    /**
     * Sends a message to the master process
     * @param {*} message Message to send
     * @returns {Promise<void>}
     */
    value: function send(message) {
      return new Promise(function (resolve, reject) {
        var sent = process.send(message, function (err) {
          if (err) reject(err);else resolve();
        });
        if (!sent) throw new Error('Failed to send message to master process.');
      });
    }

    /**
     * Fetches a Client property value of each shard.
     * @param {string} prop Name of the Client property to get, using periods for nesting
     * @returns {Promise<Array>}
     * @example
     * client.shard.fetchClientValues('guilds.size').then(results => {
     *   console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`);
     * }).catch(console.error);
     */

  }, {
    key: 'fetchClientValues',
    value: function fetchClientValues(prop) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var listener = function listener(message) {
          if (!message || message._sFetchProp !== prop) return;
          process.removeListener('message', listener);
          if (!message._error) resolve(message._result);else reject(Util.makeError(message._error));
        };
        process.on('message', listener);

        _this.send({ _sFetchProp: prop }).catch(function (err) {
          process.removeListener('message', listener);
          reject(err);
        });
      });
    }

    /**
     * Evaluates a script on all shards, in the context of the Clients.
     * @param {string} script JavaScript to run on each shard
     * @returns {Promise<Array>} Results of the script execution
     */

  }, {
    key: 'broadcastEval',
    value: function broadcastEval(script) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var listener = function listener(message) {
          if (!message || message._sEval !== script) return;
          process.removeListener('message', listener);
          if (!message._error) resolve(message._result);else reject(Util.makeError(message._error));
        };
        process.on('message', listener);

        _this2.send({ _sEval: script }).catch(function (err) {
          process.removeListener('message', listener);
          reject(err);
        });
      });
    }

    /**
     * Handles an IPC message
     * @param {*} message Message received
     * @private
     */

  }, {
    key: '_handleMessage',
    value: function _handleMessage(message) {
      if (!message) return;
      if (message._fetchProp) {
        var props = message._fetchProp.split('.');
        var value = this.client;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = props[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var prop = _step.value;
            value = value[prop];
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

        this._respond('fetchProp', { _fetchProp: message._fetchProp, _result: value });
      } else if (message._eval) {
        try {
          this._respond('eval', { _eval: message._eval, _result: this.client._eval(message._eval) });
        } catch (err) {
          this._respond('eval', { _eval: message._eval, _error: Util.makePlainError(err) });
        }
      }
    }

    /**
     * Sends a message to the master process, emitting an error from the client upon failure
     * @param {string} type Type of response to send
     * @param {*} message Message to send
     * @private
     */

  }, {
    key: '_respond',
    value: function _respond(type, message) {
      var _this3 = this;

      this.send(message).catch(function (err) {
        err.message = 'Error when sending ' + type + ' response to master process: ' + err.message;
        _this3.client.emit('error', err);
      });
    }

    /**
     * Creates/gets the singleton of this class
     * @param {Client} client Client to use
     * @returns {ShardClientUtil}
     */

  }, {
    key: 'id',
    get: function get() {
      return this.client.options.shardId;
    }

    /**
     * Total number of shards
     * @type {number}
     * @readonly
     */

  }, {
    key: 'count',
    get: function get() {
      return this.client.options.shardCount;
    }
  }], [{
    key: 'singleton',
    value: function singleton(client) {
      if (!this._singleton) {
        this._singleton = new this(client);
      } else {
        client.emit('warn', 'Multiple clients created in child process; only the first will handle sharding helpers.');
      }
      return this._singleton;
    }
  }]);

  return ShardClientUtil;
}();

module.exports = ShardClientUtil;