'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Constants = require('../util/Constants');

/**
 * Manages the State and Background Tasks of the Client
 * @private
 */

var ClientManager = function () {
  function ClientManager(client) {
    _classCallCheck(this, ClientManager);

    /**
     * The Client that instantiated this Manager
     * @type {Client}
     */
    this.client = client;

    /**
     * The heartbeat interval, null if not yet set
     * @type {?number}
     */
    this.heartbeatInterval = null;
  }

  /**
   * Connects the Client to the WebSocket
   * @param {string} token The authorization token
   * @param {Function} resolve Function to run when connection is successful
   * @param {Function} reject Function to run when connection fails
   */


  _createClass(ClientManager, [{
    key: 'connectToWebSocket',
    value: function connectToWebSocket(token, resolve, reject) {
      var _this = this;

      this.client.emit(Constants.Events.DEBUG, 'Authenticated using token ' + token);
      this.client.token = token;
      var timeout = this.client.setTimeout(function () {
        return reject(new Error(Constants.Errors.TOOK_TOO_LONG));
      }, 1000 * 300);
      this.client.rest.methods.getGateway().then(function (gateway) {
        _this.client.emit(Constants.Events.DEBUG, 'Using gateway ' + gateway);
        _this.client.ws.connect(gateway);
        _this.client.ws.once('close', function (event) {
          if (event.code === 4004) reject(new Error(Constants.Errors.BAD_LOGIN));
          if (event.code === 4010) reject(new Error(Constants.Errors.INVALID_SHARD));
          if (event.code === 4011) reject(new Error(Constants.Errors.SHARDING_REQUIRED));
        });
        _this.client.once(Constants.Events.READY, function () {
          resolve(token);
          _this.client.clearTimeout(timeout);
        });
      }, reject);
    }

    /**
     * Sets up a keep-alive interval to keep the Client's connection valid
     * @param {number} time The interval in milliseconds at which heartbeat packets should be sent
     */

  }, {
    key: 'setupKeepAlive',
    value: function setupKeepAlive(time) {
      var _this2 = this;

      this.heartbeatInterval = this.client.setInterval(function () {
        return _this2.client.ws.heartbeat(true);
      }, time);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _this3 = this;

      this.client.ws.destroy();
      if (this.client.user.bot) {
        this.client.token = null;
        return Promise.resolve();
      } else {
        return this.client.rest.methods.logout().then(function () {
          _this3.client.token = null;
        });
      }
    }
  }]);

  return ClientManager;
}();

module.exports = ClientManager;