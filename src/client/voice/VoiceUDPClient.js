'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var udp = require('dgram');
var dns = require('dns');
var Constants = require('../../util/Constants');
var EventEmitter = require('events').EventEmitter;

/**
 * Represents a UDP Client for a Voice Connection
 * @extends {EventEmitter}
 * @private
 */

var VoiceConnectionUDPClient = function (_EventEmitter) {
  _inherits(VoiceConnectionUDPClient, _EventEmitter);

  function VoiceConnectionUDPClient(voiceConnection) {
    _classCallCheck(this, VoiceConnectionUDPClient);

    /**
     * The voice connection that this UDP client serves
     * @type {VoiceConnection}
     */
    var _this = _possibleConstructorReturn(this, (VoiceConnectionUDPClient.__proto__ || Object.getPrototypeOf(VoiceConnectionUDPClient)).call(this));

    _this.voiceConnection = voiceConnection;

    /**
     * The UDP socket
     * @type {?Socket}
     */
    _this.socket = null;

    /**
     * The address of the discord voice server
     * @type {?string}
     */
    _this.discordAddress = null;

    /**
     * The local IP address
     * @type {?string}
     */
    _this.localAddress = null;

    /**
     * The local port
     * @type {?string}
     */
    _this.localPort = null;

    _this.voiceConnection.on('closing', _this.shutdown.bind(_this));
    return _this;
  }

  _createClass(VoiceConnectionUDPClient, [{
    key: 'shutdown',
    value: function shutdown() {
      if (this.socket) {
        this.socket.removeAllListeners('message');
        try {
          this.socket.close();
        } finally {
          this.socket = null;
        }
      }
    }

    /**
     * The port of the discord voice server
     * @type {number}
     * @readonly
     */

  }, {
    key: 'findEndpointAddress',


    /**
     * Tries to resolve the voice server endpoint to an address
     * @returns {Promise<string>}
     */
    value: function findEndpointAddress() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        dns.lookup(_this2.voiceConnection.authentication.endpoint, function (error, address) {
          if (error) {
            reject(error);
            return;
          }
          _this2.discordAddress = address;
          resolve(address);
        });
      });
    }

    /**
     * Send a packet to the UDP client
     * @param {Object} packet the packet to send
     * @returns {Promise<Object>}
     */

  }, {
    key: 'send',
    value: function send(packet) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        if (!_this3.socket) throw new Error('Tried to send a UDP packet, but there is no socket available.');
        if (!_this3.discordAddress || !_this3.discordPort) throw new Error('Malformed UDP address or port.');
        _this3.socket.send(packet, 0, packet.length, _this3.discordPort, _this3.discordAddress, function (error) {
          if (error) reject(error);else resolve(packet);
        });
      });
    }
  }, {
    key: 'createUDPSocket',
    value: function createUDPSocket(address) {
      var _this4 = this;

      this.discordAddress = address;
      var socket = this.socket = udp.createSocket('udp4');

      socket.once('message', function (message) {
        var packet = parseLocalPacket(message);
        if (packet.error) {
          _this4.emit('error', packet.error);
          return;
        }

        _this4.localAddress = packet.address;
        _this4.localPort = packet.port;

        _this4.voiceConnection.sockets.ws.sendPacket({
          op: Constants.VoiceOPCodes.SELECT_PROTOCOL,
          d: {
            protocol: 'udp',
            data: {
              address: packet.address,
              port: packet.port,
              mode: 'xsalsa20_poly1305'
            }
          }
        });
      });

      var blankMessage = Buffer.alloc(70);
      blankMessage.writeUIntBE(this.voiceConnection.authentication.ssrc, 0, 4);
      this.send(blankMessage);
    }
  }, {
    key: 'discordPort',
    get: function get() {
      return this.voiceConnection.authentication.port;
    }
  }]);

  return VoiceConnectionUDPClient;
}(EventEmitter);

function parseLocalPacket(message) {
  try {
    var packet = Buffer.from(message);
    var address = '';
    for (var i = 4; i < packet.indexOf(0, i); i++) {
      address += String.fromCharCode(packet[i]);
    }var port = parseInt(packet.readUIntLE(packet.length - 2, 2).toString(10), 10);
    return { address: address, port: port };
  } catch (error) {
    return { error: error };
  }
}

module.exports = VoiceConnectionUDPClient;