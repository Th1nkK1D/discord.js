'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var browser = require('os').platform() === 'browser';
var EventEmitter = require('events').EventEmitter;
var Constants = require('../../util/Constants');
var convertToBuffer = require('../../util/Util').convertToBuffer;
var zlib = require('zlib');
var PacketManager = require('./packets/WebSocketPacketManager');

var WebSocket = void 0,
    erlpack = void 0;
var serialize = JSON.stringify;
if (browser) {
  WebSocket = window.WebSocket; // eslint-disable-line no-undef
} else {
  try {
    WebSocket = require('uws');
  } catch (err) {
    WebSocket = require('ws');
  }

  try {
    erlpack = require('erlpack');
    serialize = erlpack.pack;
  } catch (err) {
    erlpack = null;
  }
}

/**
 * The WebSocket Manager of the Client
 * @private
 */

var WebSocketManager = function (_EventEmitter) {
  _inherits(WebSocketManager, _EventEmitter);

  function WebSocketManager(client) {
    _classCallCheck(this, WebSocketManager);

    /**
     * The Client that instantiated this WebSocketManager
     * @type {Client}
     */
    var _this = _possibleConstructorReturn(this, (WebSocketManager.__proto__ || Object.getPrototypeOf(WebSocketManager)).call(this));

    _this.client = client;

    /**
     * A WebSocket Packet manager, it handles all the messages
     * @type {PacketManager}
     */
    _this.packetManager = new PacketManager(_this);

    /**
     * The status of the WebSocketManager, a type of Constants.Status. It defaults to IDLE.
     * @type {number}
     */
    _this.status = Constants.Status.IDLE;

    /**
     * The session ID of the connection, null if not yet available.
     * @type {?string}
     */
    _this.sessionID = null;

    /**
     * The packet count of the client, null if not yet available.
     * @type {?number}
     */
    _this.sequence = -1;

    /**
     * The gateway address for this WebSocket connection, null if not yet available.
     * @type {?string}
     */
    _this.gateway = null;

    /**
     * Whether READY was emitted normally (all packets received) or not
     * @type {boolean}
     */
    _this.normalReady = false;

    /**
     * The WebSocket connection to the gateway
     * @type {?WebSocket}
     */
    _this.ws = null;

    /**
     * An object with keys that are websocket event names that should be ignored
     * @type {Object}
     */
    _this.disabledEvents = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = client.options.disabledEvents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var event = _step.value;
        _this.disabledEvents[event] = true;
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

    _this.first = true;

    _this.lastHeartbeatAck = true;
    return _this;
  }

  /**
   * Connects the client to a given gateway
   * @param {string} gateway The gateway to connect to
   */


  _createClass(WebSocketManager, [{
    key: '_connect',
    value: function _connect(gateway) {
      var _this2 = this;

      this.client.emit('debug', 'Connecting to gateway ' + gateway);
      this.normalReady = false;
      if (this.status !== Constants.Status.RECONNECTING) this.status = Constants.Status.CONNECTING;
      this.ws = new WebSocket(gateway);
      if (browser) this.ws.binaryType = 'arraybuffer';
      this.ws.onopen = this.eventOpen.bind(this);
      this.ws.onmessage = this.eventMessage.bind(this);
      this.ws.onclose = this.eventClose.bind(this);
      this.ws.onerror = this.eventError.bind(this);
      this._queue = [];
      this._remaining = 120;
      this.client.setInterval(function () {
        _this2._remaining = 120;
        _this2._remainingReset = Date.now();
      }, 60e3);
    }
  }, {
    key: 'connect',
    value: function connect(gateway) {
      var _this3 = this;

      gateway = gateway + '&encoding=' + (erlpack ? 'etf' : 'json');
      if (this.first) {
        this._connect(gateway);
        this.first = false;
      } else {
        this.client.setTimeout(function () {
          return _this3._connect(gateway);
        }, 5500);
      }
    }
  }, {
    key: 'heartbeat',
    value: function heartbeat(normal) {
      if (normal && !this.lastHeartbeatAck) {
        this.ws.close(1007);
        return;
      }

      this.client.emit('debug', 'Sending heartbeat');
      this.client._pingTimestamp = Date.now();
      this.client.ws.send({
        op: Constants.OPCodes.HEARTBEAT,
        d: this.sequence
      }, true);

      this.lastHeartbeatAck = false;
    }

    /**
     * Sends a packet to the gateway
     * @param {Object} data An object that can be JSON stringified
     * @param {boolean} force Whether or not to send the packet immediately
     */

  }, {
    key: 'send',
    value: function send(data) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (force) {
        this._send(serialize(data));
        return;
      }
      this._queue.push(serialize(data));
      this.doQueue();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.ws) this.ws.close(1000);
      this._queue = [];
      this.status = Constants.Status.IDLE;
    }
  }, {
    key: '_send',
    value: function _send(data) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.emit('send', data);
        this.ws.send(data);
      }
    }
  }, {
    key: 'doQueue',
    value: function doQueue() {
      var item = this._queue[0];
      if (!(this.ws.readyState === WebSocket.OPEN && item)) return;
      if (this.remaining === 0) {
        this.client.setTimeout(this.doQueue.bind(this), Date.now() - this.remainingReset);
        return;
      }
      this._remaining--;
      this._send(item);
      this._queue.shift();
      this.doQueue();
    }

    /**
     * Run whenever the gateway connections opens up
     */

  }, {
    key: 'eventOpen',
    value: function eventOpen() {
      this.client.emit('debug', 'Connection to gateway opened');
      this.lastHeartbeatAck = true;
      if (this.status === Constants.Status.RECONNECTING) this._sendResume();else this._sendNewIdentify();
    }

    /**
     * Sends a gateway resume packet, in cases of unexpected disconnections.
     */

  }, {
    key: '_sendResume',
    value: function _sendResume() {
      if (!this.sessionID) {
        this._sendNewIdentify();
        return;
      }
      this.client.emit('debug', 'Identifying as resumed session');
      var payload = {
        token: this.client.token,
        session_id: this.sessionID,
        seq: this.sequence
      };

      this.send({
        op: Constants.OPCodes.RESUME,
        d: payload
      });
    }

    /**
     * Sends a new identification packet, in cases of new connections or failed reconnections.
     */

  }, {
    key: '_sendNewIdentify',
    value: function _sendNewIdentify() {
      this.reconnecting = false;
      var payload = this.client.options.ws;
      payload.token = this.client.token;
      if (this.client.options.shardCount > 0) {
        payload.shard = [Number(this.client.options.shardId), Number(this.client.options.shardCount)];
      }
      this.client.emit('debug', 'Identifying as new session');
      this.send({
        op: Constants.OPCodes.IDENTIFY,
        d: payload
      });
      this.sequence = -1;
    }

    /**
     * @external CloseEvent
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent}
     */

    /**
     * Run whenever the connection to the gateway is closed, it will try to reconnect the client.
     * @param {CloseEvent} event The WebSocket close event
     */

  }, {
    key: 'eventClose',
    value: function eventClose(event) {
      this.emit('close', event);
      this.client.clearInterval(this.client.manager.heartbeatInterval);
      this.status = Constants.Status.DISCONNECTED;
      this._queue = [];
      /**
       * Emitted whenever the client websocket is disconnected
       * @event Client#disconnect
       * @param {CloseEvent} event The WebSocket close event
       */
      if (!this.reconnecting) this.client.emit(Constants.Events.DISCONNECT, event);
      if ([4004, 4010, 4011].includes(event.code)) return;
      if (!this.reconnecting && event.code !== 1000) this.tryReconnect();
    }

    /**
     * Run whenever a message is received from the WebSocket. Returns `true` if the message
     * was handled properly.
     * @param {Object} event The received websocket data
     * @returns {boolean}
     */

  }, {
    key: 'eventMessage',
    value: function eventMessage(event) {
      var data = this.tryParseEventData(event.data);
      if (data === null) {
        this.eventError(new Error(Constants.Errors.BAD_WS_MESSAGE));
        return false;
      }

      this.client.emit('raw', data);

      if (data.op === Constants.OPCodes.HELLO) this.client.manager.setupKeepAlive(data.d.heartbeat_interval);
      return this.packetManager.handle(data);
    }

    /**
     * Parses the raw data from a websocket event, inflating it if necessary
     * @param {*} data Event data
     * @returns {Object}
     */

  }, {
    key: 'parseEventData',
    value: function parseEventData(data) {
      if (erlpack) {
        if (data instanceof ArrayBuffer) data = convertToBuffer(data);
        return erlpack.unpack(data);
      } else {
        if (data instanceof Buffer || data instanceof ArrayBuffer) data = zlib.inflateSync(data).toString();
        return JSON.parse(data);
      }
    }

    /**
     * Tries to call `parseEventData()` and return its result, or returns `null` upon thrown errors.
     * @param {*} data Event data
     * @returns {?Object}
     */

  }, {
    key: 'tryParseEventData',
    value: function tryParseEventData(data) {
      try {
        return this.parseEventData(data);
      } catch (err) {
        return null;
      }
    }

    /**
     * Run whenever an error occurs with the WebSocket connection. Tries to reconnect
     * @param {Error} err The encountered error
     */

  }, {
    key: 'eventError',
    value: function eventError(err) {
      /**
       * Emitted whenever the Client encounters a serious connection error
       * @event Client#error
       * @param {Error} error The encountered error
       */
      if (this.client.listenerCount('error') > 0) this.client.emit('error', err);
      this.tryReconnect();
    }
  }, {
    key: '_emitReady',
    value: function _emitReady() {
      var normal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      /**
       * Emitted when the Client becomes ready to start working
       * @event Client#ready
       */
      this.status = Constants.Status.READY;
      this.client.emit(Constants.Events.READY);
      this.packetManager.handleQueue();
      this.normalReady = normal;
    }

    /**
     * Runs on new packets before `READY` to see if the Client is ready yet, if it is prepares
     * the `READY` event.
     */

  }, {
    key: 'checkIfReady',
    value: function checkIfReady() {
      var _this4 = this;

      if (this.status !== Constants.Status.READY && this.status !== Constants.Status.NEARLY) {
        var unavailableCount = 0;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.client.guilds.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var guildID = _step2.value;

            unavailableCount += this.client.guilds.get(guildID).available ? 0 : 1;
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

        if (unavailableCount === 0) {
          this.status = Constants.Status.NEARLY;
          if (this.client.options.fetchAllMembers) {
            var promises = this.client.guilds.map(function (g) {
              return g.fetchMembers();
            });
            Promise.all(promises).then(function () {
              return _this4._emitReady();
            }, function (e) {
              _this4.client.emit(Constants.Events.WARN, 'Error in pre-ready guild member fetching');
              _this4.client.emit(Constants.Events.ERROR, e);
              _this4._emitReady();
            });
            return;
          }
          this._emitReady();
        }
      }
    }

    /**
     * Tries to reconnect the client, changing the status to Constants.Status.RECONNECTING.
     */

  }, {
    key: 'tryReconnect',
    value: function tryReconnect() {
      if (this.status === Constants.Status.RECONNECTING || this.status === Constants.Status.CONNECTING) return;
      this.status = Constants.Status.RECONNECTING;
      this.ws.close();
      this.packetManager.handleQueue();
      /**
       * Emitted when the Client tries to reconnect after being disconnected
       * @event Client#reconnecting
       */
      this.client.emit(Constants.Events.RECONNECTING);
      this.connect(this.client.ws.gateway);
    }
  }]);

  return WebSocketManager;
}(EventEmitter);

module.exports = WebSocketManager;