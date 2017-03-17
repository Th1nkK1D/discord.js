'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VoiceWebSocket = require('./VoiceWebSocket');
var VoiceUDP = require('./VoiceUDPClient');
var Util = require('../../util/Util');
var Constants = require('../../util/Constants');
var AudioPlayer = require('./player/AudioPlayer');
var VoiceReceiver = require('./receiver/VoiceReceiver');
var EventEmitter = require('events').EventEmitter;
var Prism = require('prism-media');

/**
 * Represents a connection to a voice channel in Discord.
 * ```js
 * // obtained using:
 * voiceChannel.join().then(connection => {
 *
 * });
 * ```
 * @extends {EventEmitter}
 */

var VoiceConnection = function (_EventEmitter) {
  _inherits(VoiceConnection, _EventEmitter);

  function VoiceConnection(voiceManager, channel) {
    _classCallCheck(this, VoiceConnection);

    /**
     * The voice manager that instantiated this connection
     * @type {ClientVoiceManager}
     */
    var _this = _possibleConstructorReturn(this, (VoiceConnection.__proto__ || Object.getPrototypeOf(VoiceConnection)).call(this));

    _this.voiceManager = voiceManager;

    /**
     * The client that instantiated this connection
     * @type {Client}
     */
    _this.client = voiceManager.client;

    /**
     * @external Prism
     * @see {@link https://github.com/hydrabolt/prism-media}
     */

    /**
     * The audio transcoder for this connection
     * @type {Prism}
     */
    _this.prism = new Prism();

    /**
     * The voice channel this connection is currently serving
     * @type {VoiceChannel}
     */
    _this.channel = channel;

    /**
     * The current status of the voice connection
     * @type {number}
     */
    _this.status = Constants.VoiceStatus.AUTHENTICATING;

    /**
     * Whether we're currently transmitting audio
     * @type {boolean}
     */
    _this.speaking = false;

    /**
     * An array of Voice Receivers that have been created for this connection
     * @type {VoiceReceiver[]}
     */
    _this.receivers = [];

    /**
     * The authentication data needed to connect to the voice server
     * @type {Object}
     * @private
     */
    _this.authentication = {};

    /**
     * The audio player for this voice connection
     * @type {AudioPlayer}
     */
    _this.player = new AudioPlayer(_this);

    _this.player.on('debug', function (m) {
      /**
       * Debug info from the connection
       * @event VoiceConnection#debug
       * @param {string} message the debug message
       */
      _this.emit('debug', 'audio player - ' + m);
    });

    _this.player.on('error', function (e) {
      /**
       * Warning info from the connection
       * @event VoiceConnection#warn
       * @param {string|Error} warning the warning
       */
      _this.emit('warn', e);
    });

    /**
     * Map SSRC to speaking values
     * @type {Map<number, boolean>}
     * @private
     */
    _this.ssrcMap = new Map();

    /**
     * Object that wraps contains the `ws` and `udp` sockets of this voice connection
     * @type {Object}
     * @private
     */
    _this.sockets = {};

    _this.authenticate();
    return _this;
  }

  /**
   * Sets whether the voice connection should display as "speaking" or not
   * @param {boolean} value whether or not to speak
   * @private
   */


  _createClass(VoiceConnection, [{
    key: 'setSpeaking',
    value: function setSpeaking(value) {
      var _this2 = this;

      if (this.speaking === value) return;
      this.speaking = value;
      this.sockets.ws.sendPacket({
        op: Constants.VoiceOPCodes.SPEAKING,
        d: {
          speaking: true,
          delay: 0
        }
      }).catch(function (e) {
        _this2.emit('debug', e);
      });
    }

    /**
     * Sends a request to the main gateway to join a voice channel
     * @param {Object} [options] The options to provide
     */

  }, {
    key: 'sendVoiceStateUpdate',
    value: function sendVoiceStateUpdate() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      options = Util.mergeDefault({
        guild_id: this.channel.guild.id,
        channel_id: this.channel.id,
        self_mute: false,
        self_deaf: false
      }, options);

      this.client.ws.send({
        op: Constants.OPCodes.VOICE_STATE_UPDATE,
        d: options
      });
    }

    /**
     * Set the token and endpoint required to connect to the the voice servers
     * @param {string} token The voice token
     * @param {string} endpoint The voice endpoint
     * @returns {void}
     */

  }, {
    key: 'setTokenAndEndpoint',
    value: function setTokenAndEndpoint(token, endpoint) {
      if (!token) {
        this.authenticateFailed('Token not provided from voice server packet.');
        return;
      }
      if (!endpoint) {
        this.authenticateFailed('Endpoint not provided from voice server packet.');
        return;
      }

      endpoint = endpoint.match(/([^:]*)/)[0];

      if (!endpoint) {
        this.authenticateFailed('Failed to find an endpoint.');
        return;
      }

      if (this.status === Constants.VoiceStatus.AUTHENTICATING) {
        this.authentication.token = token;
        this.authentication.endpoint = endpoint;
        this.checkAuthenticated();
      } else if (token !== this.authentication.token || endpoint !== this.authentication.endpoint) {
        this.reconnect(token, endpoint);
      }
    }

    /**
     * Sets the Session ID for the connection
     * @param {string} sessionID The voice session ID
     */

  }, {
    key: 'setSessionID',
    value: function setSessionID(sessionID) {
      if (!sessionID) {
        this.authenticateFailed('Session ID not supplied.');
        return;
      }

      if (this.status === Constants.VoiceStatus.AUTHENTICATING) {
        this.authentication.sessionID = sessionID;
        this.checkAuthenticated();
      } else if (sessionID !== this.authentication.sessionID) {
        this.authentication.sessionID = sessionID;
        /**
         * Emitted when a new session ID is received
         * @event VoiceConnection#newSession
         * @private
         */
        this.emit('newSession', sessionID);
      }
    }

    /**
     * Checks whether the voice connection is authenticated
     * @private
     */

  }, {
    key: 'checkAuthenticated',
    value: function checkAuthenticated() {
      var _authentication = this.authentication,
          token = _authentication.token,
          endpoint = _authentication.endpoint,
          sessionID = _authentication.sessionID;


      if (token && endpoint && sessionID) {
        clearTimeout(this.connectTimeout);
        this.status = Constants.VoiceStatus.CONNECTING;
        /**
         * Emitted when we successfully initiate a voice connection
         * @event VoiceConnection#authenticated
         */
        this.emit('authenticated');
        this.connect();
      }
    }

    /**
     * Invoked when we fail to initiate a voice connection
     * @param {string} reason The reason for failure
     * @private
     */

  }, {
    key: 'authenticateFailed',
    value: function authenticateFailed(reason) {
      clearTimeout(this.connectTimeout);
      this.status = Constants.VoiceStatus.DISCONNECTED;
      if (this.status === Constants.VoiceStatus.AUTHENTICATING) {
        /**
         * Emitted when we fail to initiate a voice connection
         * @event VoiceConnection#failed
         * @param {Error} error The encountered error
         */
        this.emit('failed', new Error(reason));
      } else {
        this.emit('error', new Error(reason));
      }
    }

    /**
     * Move to a different voice channel in the same guild
     * @param {VoiceChannel} channel The channel to move to
     * @private
     */

  }, {
    key: 'updateChannel',
    value: function updateChannel(channel) {
      this.channel = channel;
      this.sendVoiceStateUpdate();
    }

    /**
     * Attempts to authenticate to the voice server
     * @private
     */

  }, {
    key: 'authenticate',
    value: function authenticate() {
      var _this3 = this;

      this.sendVoiceStateUpdate();
      this.connectTimeout = this.client.setTimeout(function () {
        return _this3.authenticateFailed(new Error('Connection not established within 15 seconds.'));
      }, 15000);
    }

    /**
     * Attempts to reconnect to the voice server (typically after a region change)
     * @param {string} token The voice token
     * @param {string} endpoint The voice endpoint
     * @private
     */

  }, {
    key: 'reconnect',
    value: function reconnect(token, endpoint) {
      this.authentication.token = token;
      this.authentication.endpoint = endpoint;

      this.status = Constants.VoiceStatus.RECONNECTING;
      /**
       * Emitted when the voice connection is reconnecting (typically after a region change)
       * @event VoiceConnection#reconnecting
       */
      this.emit('reconnecting');
      this.connect();
    }

    /**
     * Disconnect the voice connection, causing a disconnect and closing event to be emitted.
     */

  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.emit('closing');
      this.sendVoiceStateUpdate({
        channel_id: null
      });
      this.player.destroy();
      this.cleanup();
      this.status = Constants.VoiceStatus.DISCONNECTED;
      /**
       * Emitted when the voice connection disconnects
       * @event VoiceConnection#disconnect
       */
      this.emit('disconnect');
    }

    /**
     * Cleans up after disconnect
     * @private
     */

  }, {
    key: 'cleanup',
    value: function cleanup() {
      var _sockets = this.sockets,
          ws = _sockets.ws,
          udp = _sockets.udp;


      if (ws) {
        ws.removeAllListeners('error');
        ws.removeAllListeners('ready');
        ws.removeAllListeners('sessionDescription');
        ws.removeAllListeners('speaking');
      }

      if (udp) udp.removeAllListeners('error');

      this.sockets.ws = null;
      this.sockets.udp = null;
    }

    /**
     * Connect the voice connection
     * @private
     */

  }, {
    key: 'connect',
    value: function connect() {
      var _this4 = this;

      if (this.status !== Constants.VoiceStatus.RECONNECTING) {
        if (this.sockets.ws) throw new Error('There is already an existing WebSocket connection.');
        if (this.sockets.udp) throw new Error('There is already an existing UDP connection.');
      }

      if (this.sockets.ws) this.sockets.ws.shutdown();
      if (this.sockets.udp) this.sockets.udp.shutdown();

      this.sockets.ws = new VoiceWebSocket(this);
      this.sockets.udp = new VoiceUDP(this);

      var _sockets2 = this.sockets,
          ws = _sockets2.ws,
          udp = _sockets2.udp;


      ws.on('error', function (err) {
        return _this4.emit('error', err);
      });
      udp.on('error', function (err) {
        return _this4.emit('error', err);
      });
      ws.on('ready', this.onReady.bind(this));
      ws.on('sessionDescription', this.onSessionDescription.bind(this));
      ws.on('speaking', this.onSpeaking.bind(this));
    }

    /**
     * Invoked when the voice websocket is ready
     * @param {Object} data The received data
     * @private
     */

  }, {
    key: 'onReady',
    value: function onReady(_ref) {
      var _this5 = this;

      var port = _ref.port,
          ssrc = _ref.ssrc;

      this.authentication.port = port;
      this.authentication.ssrc = ssrc;

      var udp = this.sockets.udp;
      /**
       * Emitted whenever the connection encounters an error.
       * @event VoiceConnection#error
       * @param {Error} error The encountered error
       */
      udp.findEndpointAddress().then(function (address) {
        udp.createUDPSocket(address);
      }, function (e) {
        return _this5.emit('error', e);
      });
    }

    /**
     * Invoked when a session description is received
     * @param {string} mode The encryption mode
     * @param {string} secret The secret key
     * @private
     */

  }, {
    key: 'onSessionDescription',
    value: function onSessionDescription(mode, secret) {
      this.authentication.encryptionMode = mode;
      this.authentication.secretKey = secret;

      this.status = Constants.VoiceStatus.CONNECTED;
      /**
       * Emitted once the connection is ready, when a promise to join a voice channel resolves,
       * the connection will already be ready.
       * @event VoiceConnection#ready
       */
      this.emit('ready');
    }

    /**
     * Invoked when a speaking event is received
     * @param {Object} data The received data
     * @private
     */

  }, {
    key: 'onSpeaking',
    value: function onSpeaking(_ref2) {
      var user_id = _ref2.user_id,
          ssrc = _ref2.ssrc,
          speaking = _ref2.speaking;

      var guild = this.channel.guild;
      var user = this.client.users.get(user_id);
      this.ssrcMap.set(+ssrc, user);
      if (!speaking) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.receivers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var receiver = _step.value;

            receiver.stoppedSpeaking(user);
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
      }
      /**
       * Emitted whenever a user starts/stops speaking
       * @event VoiceConnection#speaking
       * @param {User} user The user that has started/stopped speaking
       * @param {boolean} speaking Whether or not the user is speaking
       */
      if (this.status === Constants.Status.CONNECTED) this.emit('speaking', user, speaking);
      guild._memberSpeakUpdate(user_id, speaking);
    }

    /**
     * Options that can be passed to stream-playing methods:
     * @typedef {Object} StreamOptions
     * @property {number} [seek=0] The time to seek to
     * @property {number} [volume=1] The volume to play at
     * @property {number} [passes=1] How many times to send the voice packet to reduce packet loss
     */

    /**
     * Play the given file in the voice connection.
     * @param {string} file The absolute path to the file
     * @param {StreamOptions} [options] Options for playing the stream
     * @returns {StreamDispatcher}
     * @example
     * // play files natively
     * voiceChannel.join()
     *  .then(connection => {
     *    const dispatcher = connection.playFile('C:/Users/Discord/Desktop/music.mp3');
     *  })
     *  .catch(console.error);
     */

  }, {
    key: 'playFile',
    value: function playFile(file, options) {
      return this.player.playUnknownStream('file:' + file, options);
    }

    /**
     * Play an arbitrary input that can be [handled by ffmpeg](https://ffmpeg.org/ffmpeg-protocols.html#Description)
     * @param {string} input the arbitrary input
     * @param {StreamOptions} [options] Options for playing the stream
     * @returns {StreamDispatcher}
     */

  }, {
    key: 'playArbitraryInput',
    value: function playArbitraryInput(input, options) {
      return this.player.playUnknownStream(input, options);
    }

    /**
     * Plays and converts an audio stream in the voice connection.
     * @param {ReadableStream} stream The audio stream to play
     * @param {StreamOptions} [options] Options for playing the stream
     * @returns {StreamDispatcher}
     * @example
     * // play streams using ytdl-core
     * const ytdl = require('ytdl-core');
     * const streamOptions = { seek: 0, volume: 1 };
     * voiceChannel.join()
     *  .then(connection => {
     *    const stream = ytdl('https://www.youtube.com/watch?v=XAWgeLF9EVQ', {filter : 'audioonly'});
     *    const dispatcher = connection.playStream(stream, streamOptions);
     *  })
     *  .catch(console.error);
     */

  }, {
    key: 'playStream',
    value: function playStream(stream, options) {
      return this.player.playUnknownStream(stream, options);
    }

    /**
     * Plays a stream of 16-bit signed stereo PCM at 48KHz.
     * @param {ReadableStream} stream The audio stream to play
     * @param {StreamOptions} [options] Options for playing the stream
     * @returns {StreamDispatcher}
     */

  }, {
    key: 'playConvertedStream',
    value: function playConvertedStream(stream, options) {
      return this.player.playPCMStream(stream, options);
    }

    /**
     * Plays an Opus encoded stream at 48KHz.
     * <warn>Note that inline volume is not compatible with this method.</warn>
     * @param {ReadableStream} stream The Opus audio stream to play
     * @param {StreamOptions} [options] Options for playing the stream
     * @returns {StreamDispatcher}
     */

  }, {
    key: 'playOpusStream',
    value: function playOpusStream(stream, options) {
      return this.player.playOpusStream(stream, options);
    }

    /**
     * Plays a voice broadcast
     * @param {VoiceBroadcast} broadcast the broadcast to play
     * @returns {StreamDispatcher}
     * @example
     * // play a broadcast
     * const broadcast = client
     *   .createVoiceBroadcast()
     *   .playFile('./test.mp3');
     * const dispatcher = voiceConnection.playBroadcast(broadcast);
     */

  }, {
    key: 'playBroadcast',
    value: function playBroadcast(broadcast) {
      return this.player.playBroadcast(broadcast);
    }

    /**
     * Creates a VoiceReceiver so you can start listening to voice data. It's recommended to only create one of these.
     * @returns {VoiceReceiver}
     */

  }, {
    key: 'createReceiver',
    value: function createReceiver() {
      var receiver = new VoiceReceiver(this);
      this.receivers.push(receiver);
      return receiver;
    }
  }]);

  return VoiceConnection;
}(EventEmitter);

module.exports = VoiceConnection;