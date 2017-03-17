'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VolumeInterface = require('../util/VolumeInterface');
var VoiceBroadcast = require('../VoiceBroadcast');

var secretbox = require('../util/Secretbox');

var nonce = Buffer.alloc(24);
nonce.fill(0);

/**
 * The class that sends voice packet data to the voice connection.
 * ```js
 * // obtained using:
 * voiceChannel.join().then(connection => {
 *   // you can play a file or a stream here:
 *   const dispatcher = connection.playFile('./file.mp3');
 * });
 * ```
 * @extends {EventEmitter}
 */

var StreamDispatcher = function (_VolumeInterface) {
  _inherits(StreamDispatcher, _VolumeInterface);

  function StreamDispatcher(player, stream, streamOptions) {
    _classCallCheck(this, StreamDispatcher);

    /**
     * The Audio Player that controls this dispatcher
     * @type {AudioPlayer}
     */
    var _this = _possibleConstructorReturn(this, (StreamDispatcher.__proto__ || Object.getPrototypeOf(StreamDispatcher)).call(this, streamOptions));

    _this.player = player;
    /**
     * The stream that the dispatcher plays
     * @type {ReadableStream|VoiceBroadcast}
     */
    _this.stream = stream;
    if (!(_this.stream instanceof VoiceBroadcast)) _this.startStreaming();
    _this.streamOptions = streamOptions;

    var data = _this.streamingData;
    data.length = 20;
    data.missed = 0;

    /**
     * Whether playing is paused
     * @type {boolean}
     */
    _this.paused = false;
    /**
     * Whether this dispatcher has been destroyed
     * @type {boolean}
     */
    _this.destroyed = false;

    _this._opus = streamOptions.opus;
    return _this;
  }

  /**
   * How many passes the dispatcher should take when sending packets to reduce packet loss. Values over 5
   * aren't recommended, as it means you are using 5x more bandwidth. You _can_ edit this at runtime.
   * @type {number}
   */


  _createClass(StreamDispatcher, [{
    key: 'pause',


    /**
     * Stops sending voice packets to the voice connection (stream may still progress however)
     */
    value: function pause() {
      this.setPaused(true);
    }

    /**
     * Resumes sending voice packets to the voice connection (may be further on in the stream than when paused)
     */

  }, {
    key: 'resume',
    value: function resume() {
      this.setPaused(false);
    }

    /**
     * Stops the current stream permanently and emits an `end` event.
     * @param {string} [reason='user'] An optional reason for stopping the dispatcher.
     */

  }, {
    key: 'end',
    value: function end() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'user';

      this.destroy('end', reason);
    }
  }, {
    key: 'setSpeaking',
    value: function setSpeaking(value) {
      if (this.speaking === value) return;
      this.speaking = value;
      /**
       * Emitted when the dispatcher starts/stops speaking
       * @event StreamDispatcher#speaking
       * @param {boolean} value Whether or not the dispatcher is speaking
       */
      this.emit('speaking', value);
    }
  }, {
    key: 'sendBuffer',
    value: function sendBuffer(buffer, sequence, timestamp, opusPacket) {
      opusPacket = opusPacket || this.player.opusEncoder.encode(buffer);
      var packet = this.createPacket(sequence, timestamp, opusPacket);
      this.sendPacket(packet);
    }
  }, {
    key: 'sendPacket',
    value: function sendPacket(packet) {
      var _this2 = this;

      var repeats = this.passes;
      /**
       * Emitted whenever the dispatcher has debug information
       * @event StreamDispatcher#debug
       * @param {string} info the debug info
       */
      this.setSpeaking(true);
      while (repeats--) {
        this.player.voiceConnection.sockets.udp.send(packet).catch(function (e) {
          _this2.setSpeaking(false);
          _this2.emit('debug', 'Failed to send a packet ' + e);
        });
      }
    }
  }, {
    key: 'createPacket',
    value: function createPacket(sequence, timestamp, buffer) {
      var packetBuffer = Buffer.alloc(buffer.length + 28);
      packetBuffer.fill(0);
      packetBuffer[0] = 0x80;
      packetBuffer[1] = 0x78;

      packetBuffer.writeUIntBE(sequence, 2, 2);
      packetBuffer.writeUIntBE(timestamp, 4, 4);
      packetBuffer.writeUIntBE(this.player.voiceConnection.authentication.ssrc, 8, 4);

      packetBuffer.copy(nonce, 0, 0, 12);
      buffer = secretbox.close(buffer, nonce, this.player.voiceConnection.authentication.secretKey.key);
      for (var i = 0; i < buffer.length; i++) {
        packetBuffer[i + 12] = buffer[i];
      }return packetBuffer;
    }
  }, {
    key: 'processPacket',
    value: function processPacket(packet) {
      try {
        if (this.destroyed) {
          this.setSpeaking(false);
          return;
        }

        var data = this.streamingData;

        if (this.paused) {
          this.setSpeaking(false);
          data.pausedTime = data.length * 10;
          return;
        }

        if (!packet) {
          data.missed++;
          data.pausedTime += data.length * 10;
          return;
        }

        this.started();
        this.missed = 0;

        this.stepStreamingData();
        this.sendBuffer(null, data.sequence, data.timestamp, packet);
      } catch (e) {
        this.destroy('error', e);
      }
    }
  }, {
    key: 'process',
    value: function process() {
      var _this3 = this;

      try {
        if (this.destroyed) {
          this.setSpeaking(false);
          return;
        }

        var data = this.streamingData;

        if (data.missed >= 5) {
          this.destroy('end', 'Stream is not generating quickly enough.');
          return;
        }

        if (this.paused) {
          this.setSpeaking(false);
          // Old code?
          // data.timestamp = data.timestamp + 4294967295 ? data.timestamp + 960 : 0;
          data.pausedTime += data.length * 10;
          this.player.voiceConnection.voiceManager.client.setTimeout(function () {
            return _this3.process();
          }, data.length * 10);
          return;
        }

        this.started();

        var buffer = this.readStreamBuffer();
        if (!buffer) {
          data.missed++;
          data.pausedTime += data.length * 10;
          this.player.voiceConnection.voiceManager.client.setTimeout(function () {
            return _this3.process();
          }, data.length * 10);
          return;
        }

        data.missed = 0;

        this.stepStreamingData();

        if (this._opus) {
          this.sendBuffer(null, data.sequence, data.timestamp, buffer);
        } else {
          this.sendBuffer(buffer, data.sequence, data.timestamp);
        }

        var nextTime = data.length + (data.startTime + data.pausedTime + data.count * data.length - Date.now());
        this.player.voiceConnection.voiceManager.client.setTimeout(function () {
          return _this3.process();
        }, nextTime);
      } catch (e) {
        this.destroy('error', e);
      }
    }
  }, {
    key: 'readStreamBuffer',
    value: function readStreamBuffer() {
      var data = this.streamingData;
      var bufferLength = (this._opus ? 80 : 1920) * data.channels;
      var buffer = this.stream.read(bufferLength);
      if (this._opus) return buffer;
      if (!buffer) return null;

      if (buffer.length !== bufferLength) {
        var newBuffer = Buffer.alloc(bufferLength).fill(0);
        buffer.copy(newBuffer);
        buffer = newBuffer;
      }

      buffer = this.applyVolume(buffer);
      return buffer;
    }
  }, {
    key: 'started',
    value: function started() {
      var data = this.streamingData;

      if (!data.startTime) {
        /**
         * Emitted once the dispatcher starts streaming
         * @event StreamDispatcher#start
         */
        this.emit('start');
        data.startTime = Date.now();
      }
    }
  }, {
    key: 'stepStreamingData',
    value: function stepStreamingData() {
      var data = this.streamingData;
      data.count++;
      data.sequence = data.sequence < 65535 ? data.sequence + 1 : 0;
      data.timestamp = data.timestamp + 4294967295 ? data.timestamp + 960 : 0;
    }
  }, {
    key: 'destroy',
    value: function destroy(type, reason) {
      if (this.destroyed) return;
      this.destroyed = true;
      this.setSpeaking(false);
      this.emit(type, reason);
      /**
       * Emitted once the dispatcher ends
       * @param {string} [reason] the reason the dispatcher ended
       * @event StreamDispatcher#end
       */
      if (type !== 'end') this.emit('end', 'destroyed due to ' + type + ' - ' + reason);
    }
  }, {
    key: 'startStreaming',
    value: function startStreaming() {
      var _this4 = this;

      if (!this.stream) {
        /**
         * Emitted if the dispatcher encounters an error
         * @event StreamDispatcher#error
         * @param {string} error the error message
         */
        this.emit('error', 'No stream');
        return;
      }

      this.stream.on('end', function (err) {
        return _this4.destroy('end', err || 'stream');
      });
      this.stream.on('error', function (err) {
        return _this4.destroy('error', err);
      });

      var data = this.streamingData;
      data.length = 20;
      data.missed = 0;

      this.stream.once('readable', function () {
        data.startTime = null;
        data.count = 0;
        _this4.process();
      });
    }
  }, {
    key: 'setPaused',
    value: function setPaused(paused) {
      this.setSpeaking(!(this.paused = paused));
    }
  }, {
    key: 'passes',
    get: function get() {
      return this.streamOptions.passes || 1;
    },
    set: function set(n) {
      this.streamOptions.passes = n;
    }
  }, {
    key: 'streamingData',
    get: function get() {
      return this.player.streamingData;
    }

    /**
     * How long the stream dispatcher has been "speaking" for
     * @type {number}
     * @readonly
     */

  }, {
    key: 'time',
    get: function get() {
      return this.streamingData.count * (this.streamingData.length || 0);
    }

    /**
     * The total time, taking into account pauses and skips, that the dispatcher has been streaming for
     * @type {number}
     * @readonly
     */

  }, {
    key: 'totalStreamTime',
    get: function get() {
      return this.time + this.streamingData.pausedTime;
    }
  }]);

  return StreamDispatcher;
}(VolumeInterface);

module.exports = StreamDispatcher;