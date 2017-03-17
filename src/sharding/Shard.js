'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var childProcess = require('child_process');
var path = require('path');
var Util = require('../util/Util');

/**
 * Represents a Shard spawned by the ShardingManager.
 */

var Shard = function () {
  /**
   * @param {ShardingManager} manager The sharding manager
   * @param {number} id The ID of this shard
   * @param {Array} [args=[]] Command line arguments to pass to the script
   */
  function Shard(manager, id) {
    var _this = this;

    var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    _classCallCheck(this, Shard);

    /**
     * Manager that created the shard
     * @type {ShardingManager}
     */
    this.manager = manager;

    /**
     * ID of the shard
     * @type {number}
     */
    this.id = id;

    /**
     * The environment variables for the shard
     * @type {Object}
     */
    this.env = Object.assign({}, process.env, {
      SHARD_ID: this.id,
      SHARD_COUNT: this.manager.totalShards,
      CLIENT_TOKEN: this.manager.token
    });

    /**
     * Process of the shard
     * @type {ChildProcess}
     */
    this.process = childProcess.fork(path.resolve(this.manager.file), args, {
      env: this.env
    });
    this.process.on('message', this._handleMessage.bind(this));
    this.process.once('exit', function () {
      if (_this.manager.respawn) _this.manager.createShard(_this.id);
    });

    this._evals = new Map();
    this._fetches = new Map();
  }

  /**
   * Sends a message to the shard's process.
   * @param {*} message Message to send to the shard
   * @returns {Promise<Shard>}
   */


  _createClass(Shard, [{
    key: 'send',
    value: function send(message) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var sent = _this2.process.send(message, function (err) {
          if (err) reject(err);else resolve(_this2);
        });
        if (!sent) throw new Error('Failed to send message to shard\'s process.');
      });
    }

    /**
     * Fetches a Client property value of the shard.
     * @param {string} prop Name of the Client property to get, using periods for nesting
     * @returns {Promise<*>}
     * @example
     * shard.fetchClientValue('guilds.size').then(count => {
     *   console.log(`${count} guilds in shard ${shard.id}`);
     * }).catch(console.error);
     */

  }, {
    key: 'fetchClientValue',
    value: function fetchClientValue(prop) {
      var _this3 = this;

      if (this._fetches.has(prop)) return this._fetches.get(prop);

      var promise = new Promise(function (resolve, reject) {
        var listener = function listener(message) {
          if (!message || message._fetchProp !== prop) return;
          _this3.process.removeListener('message', listener);
          _this3._fetches.delete(prop);
          resolve(message._result);
        };
        _this3.process.on('message', listener);

        _this3.send({ _fetchProp: prop }).catch(function (err) {
          _this3.process.removeListener('message', listener);
          _this3._fetches.delete(prop);
          reject(err);
        });
      });

      this._fetches.set(prop, promise);
      return promise;
    }

    /**
     * Evaluates a script on the shard, in the context of the Client.
     * @param {string} script JavaScript to run on the shard
     * @returns {Promise<*>} Result of the script execution
     */

  }, {
    key: 'eval',
    value: function _eval(script) {
      var _this4 = this;

      if (this._evals.has(script)) return this._evals.get(script);

      var promise = new Promise(function (resolve, reject) {
        var listener = function listener(message) {
          if (!message || message._eval !== script) return;
          _this4.process.removeListener('message', listener);
          _this4._evals.delete(script);
          if (!message._error) resolve(message._result);else reject(Util.makeError(message._error));
        };
        _this4.process.on('message', listener);

        _this4.send({ _eval: script }).catch(function (err) {
          _this4.process.removeListener('message', listener);
          _this4._evals.delete(script);
          reject(err);
        });
      });

      this._evals.set(script, promise);
      return promise;
    }

    /**
     * Handles an IPC message
     * @param {*} message Message received
     * @private
     */

  }, {
    key: '_handleMessage',
    value: function _handleMessage(message) {
      var _this5 = this;

      if (message) {
        // Shard is requesting a property fetch
        if (message._sFetchProp) {
          this.manager.fetchClientValues(message._sFetchProp).then(function (results) {
            return _this5.send({ _sFetchProp: message._sFetchProp, _result: results });
          }, function (err) {
            return _this5.send({ _sFetchProp: message._sFetchProp, _error: Util.makePlainError(err) });
          });
          return;
        }

        // Shard is requesting an eval broadcast
        if (message._sEval) {
          this.manager.broadcastEval(message._sEval).then(function (results) {
            return _this5.send({ _sEval: message._sEval, _result: results });
          }, function (err) {
            return _this5.send({ _sEval: message._sEval, _error: Util.makePlainError(err) });
          });
          return;
        }
      }

      /**
       * Emitted upon recieving a message from a shard
       * @event ShardingManager#message
       * @param {Shard} shard Shard that sent the message
       * @param {*} message Message that was received
       */
      this.manager.emit('message', this, message);
    }
  }]);

  return Shard;
}();

module.exports = Shard;