'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VolumeInterface = require('./util/VolumeInterface');
var Prism = require('prism-media');
var OpusEncoders = require('./opus/OpusEngineList');
var Collection = require('../../util/Collection');

var ffmpegArguments = ['-analyzeduration', '0', '-loglevel', '0', '-f', 's16le', '-ar', '48000', '-ac', '2'];

/**
 * A voice broadcast can be played across multiple voice connections for improved shared-stream efficiency.
 * @extends {EventEmitter}
 */

var VoiceBroadcast = function (_VolumeInterface) {
  _inherits(VoiceBroadcast, _VolumeInterface);

  function VoiceBroadcast(client) {
    _classCallCheck(this, VoiceBroadcast);

    /**
     * The client that created the broadcast
     * @type {Client}
     */
    var _this = _possibleConstructorReturn(this, (VoiceBroadcast.__proto__ || Object.getPrototypeOf(VoiceBroadcast)).call(this));

    _this.client = client;
    _this._dispatchers = new Collection();
    _this._encoders = new Collection();
    /**
     * The audio transcoder that this broadcast uses
     * @type {Prism}
     */
    _this.prism = new Prism();
    /**
     * The current audio transcoder that is being used
     * @type {object}
     */
    _this.currentTranscoder = null;
    _this.tickInterval = null;
    _this._volume = 1;
    return _this;
  }

  /**
   * An array of subscribed dispatchers
   * @type {StreamDispatcher[]}
   */


  _createClass(VoiceBroadcast, [{
    key: 'unregisterDispatcher',
    value: function unregisterDispatcher(dispatcher, old) {
      var volume = old || dispatcher.volume;

      /**
       * Emitted whenever a stream dispatcher unsubscribes from the broadcast
       * @event VoiceBroadcast#unsubscribe
       * @param {StreamDispatcher} dispatcher The unsubscribed dispatcher
       */
      this.emit('unsubscribe', dispatcher);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._dispatchers.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var container = _step.value;

          container.delete(dispatcher);

          if (!container.size) {
            this._encoders.get(volume).destroy();
            this._dispatchers.delete(volume);
            this._encoders.delete(volume);
          }
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
  }, {
    key: 'registerDispatcher',
    value: function registerDispatcher(dispatcher) {
      var _this2 = this;

      if (!this._dispatchers.has(dispatcher.volume)) {
        this._dispatchers.set(dispatcher.volume, new Set());
        this._encoders.set(dispatcher.volume, OpusEncoders.fetch());
      }
      var container = this._dispatchers.get(dispatcher.volume);
      if (!container.has(dispatcher)) {
        container.add(dispatcher);
        dispatcher.once('end', function () {
          return _this2.unregisterDispatcher(dispatcher);
        });
        dispatcher.on('volumeChange', function (o, n) {
          _this2.unregisterDispatcher(dispatcher, o);
          if (!_this2._dispatchers.has(n)) {
            _this2._dispatchers.set(n, new Set());
            _this2._encoders.set(n, OpusEncoders.fetch());
          }
          _this2._dispatchers.get(n).add(dispatcher);
        });
        /**
         * Emitted whenever a stream dispatcher subscribes to the broadcast
         * @event VoiceBroadcast#subscribe
         * @param {StreamDispatcher} dispatcher The subscribed dispatcher
         */
        this.emit('subscribe', dispatcher);
      }
    }
  }, {
    key: 'killCurrentTranscoder',
    value: function killCurrentTranscoder() {
      if (this.currentTranscoder) {
        if (this.currentTranscoder.transcoder) this.currentTranscoder.transcoder.kill();
        this.currentTranscoder = null;
        this.emit('end');
      }
    }

    /**
     * Plays any audio stream across the broadcast
     * @param {ReadableStream} stream The audio stream to play
     * @param {StreamOptions} [options] Options for playing the stream
     * @returns {VoiceBroadcast}
     * @example
     * // play streams using ytdl-core
     * const ytdl = require('ytdl-core');
     * const streamOptions = { seek: 0, volume: 1 };
     * const broadcast = client.createVoiceBroadcast();
     *
     * voiceChannel.join()
     *  .then(connection => {
     *    const stream = ytdl('https://www.youtube.com/watch?v=XAWgeLF9EVQ', {filter : 'audioonly'});
     *    broadcast.playStream(stream);
     *    const dispatcher = connection.playBroadcast(broadcast);
     *  })
     *  .catch(console.error);
     */

  }, {
    key: 'playStream',
    value: function playStream(stream) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$seek = _ref.seek,
          seek = _ref$seek === undefined ? 0 : _ref$seek,
          _ref$volume = _ref.volume,
          volume = _ref$volume === undefined ? 1 : _ref$volume,
          _ref$passes = _ref.passes,
          passes = _ref$passes === undefined ? 1 : _ref$passes;

      var options = { seek: seek, volume: volume, passes: passes, stream: stream };
      return this._playTranscodable(stream, options);
    }

    /**
     * Play the given file in the voice connection.
     * @param {string} file The absolute path to the file
     * @param {StreamOptions} [options] Options for playing the stream
     * @returns {StreamDispatcher}
     * @example
     * // play files natively
     * const broadcast = client.createVoiceBroadcast();
     *
     * voiceChannel.join()
     *  .then(connection => {
     *    broadcast.playFile('C:/Users/Discord/Desktop/music.mp3');
     *    const dispatcher = connection.playBroadcast(broadcast);
     *  })
     *  .catch(console.error);
     */

  }, {
    key: 'playFile',
    value: function playFile(file) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$seek = _ref2.seek,
          seek = _ref2$seek === undefined ? 0 : _ref2$seek,
          _ref2$volume = _ref2.volume,
          volume = _ref2$volume === undefined ? 1 : _ref2$volume,
          _ref2$passes = _ref2.passes,
          passes = _ref2$passes === undefined ? 1 : _ref2$passes;

      var options = { seek: seek, volume: volume, passes: passes };
      return this._playTranscodable('file:' + file, options);
    }
  }, {
    key: '_playTranscodable',
    value: function _playTranscodable(media, options) {
      var _this3 = this;

      OpusEncoders.guaranteeOpusEngine();

      this.killCurrentTranscoder();
      var transcoder = this.prism.transcode({
        type: 'ffmpeg',
        media: media,
        ffmpegArguments: ffmpegArguments.concat(['-ss', String(options.seek)])
      });
      /**
       * Emitted whenever an error occurs
       * @event VoiceBroadcast#error
       * @param {Error} error the error that occurred
       */
      transcoder.once('error', function (e) {
        if (_this3.listenerCount('error') > 0) _this3.emit('error', e);
        /**
         * Emitted whenever the VoiceBroadcast has any warnings
         * @event VoiceBroadcast#warn
         * @param {string|Error} warning the warning that was raised
         */
        else _this3.emit('warn', e);
      });
      /**
       * Emitted once the broadcast (the audio stream) ends
       * @event VoiceBroadcast#end
       */
      transcoder.once('end', function () {
        return _this3.killCurrentTranscoder();
      });
      this.currentTranscoder = {
        transcoder: transcoder,
        options: options
      };
      transcoder.output.once('readable', function () {
        return _this3._startPlaying();
      });
      return this;
    }

    /**
     * Plays a stream of 16-bit signed stereo PCM at 48KHz.
     * @param {ReadableStream} stream The audio stream to play.
     * @param {StreamOptions} [options] Options for playing the stream
     * @returns {VoiceBroadcast}
     */

  }, {
    key: 'playConvertedStream',
    value: function playConvertedStream(stream) {
      var _this4 = this;

      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref3$seek = _ref3.seek,
          seek = _ref3$seek === undefined ? 0 : _ref3$seek,
          _ref3$volume = _ref3.volume,
          volume = _ref3$volume === undefined ? 1 : _ref3$volume,
          _ref3$passes = _ref3.passes,
          passes = _ref3$passes === undefined ? 1 : _ref3$passes;

      OpusEncoders.guaranteeOpusEngine();

      this.killCurrentTranscoder();
      var options = { seek: seek, volume: volume, passes: passes, stream: stream };
      this.currentTranscoder = { options: options };
      stream.once('readable', function () {
        return _this4._startPlaying();
      });
      return this;
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
    value: function playOpusStream(stream) {
      var _this5 = this;

      var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref4$seek = _ref4.seek,
          seek = _ref4$seek === undefined ? 0 : _ref4$seek,
          _ref4$passes = _ref4.passes,
          passes = _ref4$passes === undefined ? 1 : _ref4$passes;

      var options = { seek: seek, passes: passes, stream: stream };
      this.currentTranscoder = { options: options, opus: true };
      stream.once('readable', function () {
        return _this5._startPlaying();
      });
      return this;
    }

    /**
     * Play an arbitrary input that can be [handled by ffmpeg](https://ffmpeg.org/ffmpeg-protocols.html#Description)
     * @param {string} input the arbitrary input
     * @param {StreamOptions} [options] Options for playing the stream
     * @returns {VoiceBroadcast}
     */

  }, {
    key: 'playArbitraryInput',
    value: function playArbitraryInput(input) {
      var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref5$seek = _ref5.seek,
          seek = _ref5$seek === undefined ? 0 : _ref5$seek,
          _ref5$volume = _ref5.volume,
          volume = _ref5$volume === undefined ? 1 : _ref5$volume,
          _ref5$passes = _ref5.passes,
          passes = _ref5$passes === undefined ? 1 : _ref5$passes;

      this.guaranteeOpusEngine();

      var options = { seek: seek, volume: volume, passes: passes, input: input };
      return this._playTranscodable(input, options);
    }

    /**
     * Pauses the entire broadcast - all dispatchers also pause
     */

  }, {
    key: 'pause',
    value: function pause() {
      this.paused = true;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._dispatchers.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var container = _step2.value;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = container.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var dispatcher = _step3.value;

              dispatcher.pause();
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
    }

    /**
     * Resumes the entire broadcast - all dispatchers also resume
     */

  }, {
    key: 'resume',
    value: function resume() {
      this.paused = false;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this._dispatchers.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var container = _step4.value;
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = container.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var dispatcher = _step5.value;

              dispatcher.resume();
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
    }
  }, {
    key: 'guaranteeOpusEngine',
    value: function guaranteeOpusEngine() {
      if (!this.opusEncoder) throw new Error('Couldn\'t find an Opus engine.');
    }
  }, {
    key: '_startPlaying',
    value: function _startPlaying() {
      if (this.tickInterval) clearInterval(this.tickInterval);
      // Old code?
      // this.tickInterval = this.client.setInterval(this.tick.bind(this), 20);
      this._startTime = Date.now();
      this._count = 0;
      this._pausedTime = 0;
      this._missed = 0;
      this.tick();
    }
  }, {
    key: 'tick',
    value: function tick() {
      var _this6 = this;

      if (!this._playableStream) return;
      if (this.paused) {
        this._pausedTime += 20;
        setTimeout(function () {
          return _this6.tick();
        }, 20);
        return;
      }

      var opus = this.currentTranscoder.opus;
      var buffer = this.readStreamBuffer();

      if (!buffer) {
        this._missed++;
        if (this._missed < 5) {
          this._pausedTime += 200;
          setTimeout(function () {
            return _this6.tick();
          }, 200);
        } else {
          this.killCurrentTranscoder();
        }
        return;
      }

      this._missed = 0;

      var packetMatrix = {};

      var getOpusPacket = function getOpusPacket(volume) {
        if (packetMatrix[volume]) return packetMatrix[volume];

        var opusEncoder = _this6._encoders.get(volume);
        var opusPacket = opusEncoder.encode(_this6.applyVolume(buffer, _this6._volume * volume));
        packetMatrix[volume] = opusPacket;
        return opusPacket;
      };

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.dispatchers[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var dispatcher = _step6.value;

          if (opus) {
            dispatcher.processPacket(buffer);
            continue;
          }

          var volume = dispatcher.volume;
          dispatcher.processPacket(getOpusPacket(volume));
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

      var next = 20 + (this._startTime + this._pausedTime + this._count * 20 - Date.now());
      this._count++;
      setTimeout(function () {
        return _this6.tick();
      }, next);
    }
  }, {
    key: 'readStreamBuffer',
    value: function readStreamBuffer() {
      var opus = this.currentTranscoder.opus;
      var bufferLength = (opus ? 80 : 1920) * 2;
      var buffer = this._playableStream.read(bufferLength);
      if (opus) return buffer;
      if (!buffer) return null;

      if (buffer.length !== bufferLength) {
        var newBuffer = Buffer.alloc(bufferLength).fill(0);
        buffer.copy(newBuffer);
        buffer = newBuffer;
      }

      return buffer;
    }

    /**
     * Stop the current stream from playing without unsubscribing dispatchers.
     */

  }, {
    key: 'end',
    value: function end() {
      this.killCurrentTranscoder();
    }

    /**
     * End the current broadcast, all subscribed dispatchers will also end
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.end();
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this._dispatchers.values()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var container = _step7.value;
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = container.values()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var dispatcher = _step8.value;

              dispatcher.destroy('end', 'broadcast ended');
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
    }
  }, {
    key: 'dispatchers',
    get: function get() {
      var d = [];
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = this._dispatchers.values()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var container = _step9.value;

          d = d.concat(Array.from(container.values()));
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

      return d;
    }
  }, {
    key: '_playableStream',
    get: function get() {
      var currentTranscoder = this.currentTranscoder;
      if (!currentTranscoder) return null;
      var transcoder = currentTranscoder.transcoder;
      var options = currentTranscoder.options;
      return transcoder && transcoder.output || options.stream;
    }
  }]);

  return VoiceBroadcast;
}(VolumeInterface);

module.exports = VoiceBroadcast;