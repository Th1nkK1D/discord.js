'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Constants = require('../../util/Constants');
var SecretKey = require('./util/SecretKey');
var EventEmitter = require('events').EventEmitter;

var WebSocket = void 0;
try {
  WebSocket = require('uws');
} catch (err) {
  WebSocket = require('ws');
}

/**
 * Represents a Voice Connection's WebSocket
 * @extends {EventEmitter}
 * @private
 */

var VoiceWebSocket = function (_EventEmitter) {
  _inherits(VoiceWebSocket, _EventEmitter);

  function VoiceWebSocket(voiceConnection) {
    _classCallCheck(this, VoiceWebSocket);

    /**
     * The Voice Connection that this WebSocket serves
     * @type {VoiceConnection}
     */
    var _this = _possibleConstructorReturn(this, (VoiceWebSocket.__proto__ || Object.getPrototypeOf(VoiceWebSocket)).call(this));

    _this.voiceConnection = voiceConnection;

    /**
     * How many connection attempts have been made
     * @type {number}
     */
    _this.attempts = 0;

    _this.connect();
    _this.dead = false;
    _this.voiceConnection.on('closing', _this.shutdown.bind(_this));
    return _this;
  }

  _createClass(VoiceWebSocket, [{
    key: 'shutdown',
    value: function shutdown() {
      this.dead = true;
      this.reset();
    }

    /**
     * The client of this voice websocket
     * @type {Client}
     * @readonly
     */

  }, {
    key: 'reset',


    /**
     * Resets the current WebSocket
     */
    value: function reset() {
      if (this.ws) {
        if (this.ws.readyState !== WebSocket.CLOSED) this.ws.close();
        this.ws = null;
      }
      this.clearHeartbeat();
    }

    /**
     * Starts connecting to the Voice WebSocket Server.
     */

  }, {
    key: 'connect',
    value: function connect() {
      if (this.dead) return;
      if (this.ws) this.reset();
      if (this.attempts >= 5) {
        this.emit('debug', new Error('Too many connection attempts (' + this.attempts + ').'));
        return;
      }

      this.attempts++;

      /**
       * The actual WebSocket used to connect to the Voice WebSocket Server.
       * @type {WebSocket}
       */
      this.ws = new WebSocket('wss://' + this.voiceConnection.authentication.endpoint);
      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onclose = this.onClose.bind(this);
      this.ws.onerror = this.onError.bind(this);
    }

    /**
     * Sends data to the WebSocket if it is open.
     * @param {string} data the data to send to the WebSocket
     * @returns {Promise<string>}
     */

  }, {
    key: 'send',
    value: function send(data) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (!_this2.ws || _this2.ws.readyState !== WebSocket.OPEN) {
          throw new Error('Voice websocket not open to send ' + data + '.');
        }
        _this2.ws.send(data, null, function (error) {
          if (error) reject(error);else resolve(data);
        });
      });
    }

    /**
     * JSON.stringify's a packet and then sends it to the WebSocket Server.
     * @param {Object} packet the packet to send
     * @returns {Promise<string>}
     */

  }, {
    key: 'sendPacket',
    value: function sendPacket(packet) {
      try {
        packet = JSON.stringify(packet);
      } catch (error) {
        return Promise.reject(error);
      }
      return this.send(packet);
    }

    /**
     * Called whenever the WebSocket opens
     */

  }, {
    key: 'onOpen',
    value: function onOpen() {
      var _this3 = this;

      this.sendPacket({
        op: Constants.OPCodes.DISPATCH,
        d: {
          server_id: this.voiceConnection.channel.guild.id,
          user_id: this.client.user.id,
          token: this.voiceConnection.authentication.token,
          session_id: this.voiceConnection.authentication.sessionID
        }
      }).catch(function () {
        _this3.emit('error', new Error('Tried to send join packet, but the WebSocket is not open.'));
      });
    }

    /**
     * Called whenever a message is received from the WebSocket
     * @param {MessageEvent} event the message event that was received
     * @returns {void}
     */

  }, {
    key: 'onMessage',
    value: function onMessage(event) {
      try {
        return this.onPacket(JSON.parse(event.data));
      } catch (error) {
        return this.onError(error);
      }
    }

    /**
     * Called whenever the connection to the WebSocket Server is lost
     */

  }, {
    key: 'onClose',
    value: function onClose() {
      if (!this.dead) this.client.setTimeout(this.connect.bind(this), this.attempts * 1000);
    }

    /**
     * Called whenever an error occurs with the WebSocket.
     * @param {Error} error the error that occurred
     */

  }, {
    key: 'onError',
    value: function onError(error) {
      this.emit('error', error);
    }

    /**
     * Called whenever a valid packet is received from the WebSocket
     * @param {Object} packet the received packet
     */

  }, {
    key: 'onPacket',
    value: function onPacket(packet) {
      switch (packet.op) {
        case Constants.VoiceOPCodes.READY:
          this.setHeartbeat(packet.d.heartbeat_interval);
          /**
           * Emitted once the voice websocket receives the ready packet
           * @param {Object} packet the received packet
           * @event VoiceWebSocket#ready
           */
          this.emit('ready', packet.d);
          break;
        case Constants.VoiceOPCodes.SESSION_DESCRIPTION:
          /**
           * Emitted once the Voice Websocket receives a description of this voice session
           * @param {string} encryptionMode the type of encryption being used
           * @param {SecretKey} secretKey the secret key used for encryption
           * @event VoiceWebSocket#sessionDescription
           */
          this.emit('sessionDescription', packet.d.mode, new SecretKey(packet.d.secret_key));
          break;
        case Constants.VoiceOPCodes.SPEAKING:
          /**
           * Emitted whenever a speaking packet is received
           * @param {Object} data
           * @event VoiceWebSocket#speaking
           */
          this.emit('speaking', packet.d);
          break;
        default:
          /**
           * Emitted when an unhandled packet is received
           * @param {Object} packet
           * @event VoiceWebSocket#unknownPacket
           */
          this.emit('unknownPacket', packet);
          break;
      }
    }

    /**
     * Sets an interval at which to send a heartbeat packet to the WebSocket
     * @param {number} interval the interval at which to send a heartbeat packet
     */

  }, {
    key: 'setHeartbeat',
    value: function setHeartbeat(interval) {
      if (!interval || isNaN(interval)) {
        this.onError(new Error('Tried to set voice heartbeat but no valid interval was specified.'));
        return;
      }
      if (this.heartbeatInterval) {
        /**
         * Emitted whenver the voice websocket encounters a non-fatal error
         * @param {string} warn the warning
         * @event VoiceWebSocket#warn
         */
        this.emit('warn', 'A voice heartbeat interval is being overwritten');
        clearInterval(this.heartbeatInterval);
      }
      this.heartbeatInterval = this.client.setInterval(this.sendHeartbeat.bind(this), interval);
    }

    /**
     * Clears a heartbeat interval, if one exists
     */

  }, {
    key: 'clearHeartbeat',
    value: function clearHeartbeat() {
      if (!this.heartbeatInterval) {
        this.emit('warn', 'Tried to clear a heartbeat interval that does not exist');
        return;
      }
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    /**
     * Sends a heartbeat packet
     */

  }, {
    key: 'sendHeartbeat',
    value: function sendHeartbeat() {
      var _this4 = this;

      this.sendPacket({ op: Constants.VoiceOPCodes.HEARTBEAT, d: null }).catch(function () {
        _this4.emit('warn', 'Tried to send heartbeat, but connection is not open');
        _this4.clearHeartbeat();
      });
    }
  }, {
    key: 'client',
    get: function get() {
      return this.voiceConnection.voiceManager.client;
    }
  }]);

  return VoiceWebSocket;
}(EventEmitter);

module.exports = VoiceWebSocket;