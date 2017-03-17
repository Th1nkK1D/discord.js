'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events').EventEmitter;
var Prism = require('prism-media');
var StreamDispatcher = require('../dispatcher/StreamDispatcher');
var Collection = require('../../../util/Collection');
var OpusEncoders = require('../opus/OpusEngineList');

var ffmpegArguments = ['-analyzeduration', '0', '-loglevel', '0', '-f', 's16le', '-ar', '48000', '-ac', '2'];

/**
 * An Audio Player for a Voice Connection
 * @private
 * @extends {EventEmitter}
 */

var AudioPlayer = function (_EventEmitter) {
  _inherits(AudioPlayer, _EventEmitter);

  function AudioPlayer(voiceConnection) {
    _classCallCheck(this, AudioPlayer);

    /**
     * The voice connection that the player serves
     * @type {VoiceConnection}
     */
    var _this = _possibleConstructorReturn(this, (AudioPlayer.__proto__ || Object.getPrototypeOf(AudioPlayer)).call(this));

    _this.voiceConnection = voiceConnection;
    /**
     * The prism transcoder that the player uses
     * @type {Prism}
     */
    _this.prism = new Prism();
    /**
     * The opus encoder that the player uses
     * @type {NodeOpusEngine|OpusScriptEngine}
     */
    _this.opusEncoder = OpusEncoders.fetch();
    _this.streams = new Collection();
    _this.streamingData = {
      channels: 2,
      count: 0,
      sequence: 0,
      timestamp: 0,
      pausedTime: 0
    };
    _this.voiceConnection.once('closing', function () {
      return _this.destroyAllStreams();
    });
    return _this;
  }

  _createClass(AudioPlayer, [{
    key: 'destroy',
    value: function destroy() {
      if (this.opusEncoder) this.opusEncoder.destroy();
    }
  }, {
    key: 'destroyStream',
    value: function destroyStream(stream) {
      var data = this.streams.get(stream);
      if (!data) return;
      var transcoder = data.transcoder;
      var dispatcher = data.dispatcher;
      if (transcoder) transcoder.kill();
      if (dispatcher) dispatcher.destroy('end');
      this.streams.delete(stream);
    }
  }, {
    key: 'destroyAllStreams',
    value: function destroyAllStreams(except) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.streams.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var stream = _step.value;

          if (except === stream) continue;
          if (except === true && this.streams.get(stream) === this.streams.last()) continue;
          this.destroyStream(stream);
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
    key: 'playUnknownStream',
    value: function playUnknownStream(stream) {
      var _this2 = this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$seek = _ref.seek,
          seek = _ref$seek === undefined ? 0 : _ref$seek,
          _ref$volume = _ref.volume,
          volume = _ref$volume === undefined ? 1 : _ref$volume,
          _ref$passes = _ref.passes,
          passes = _ref$passes === undefined ? 1 : _ref$passes;

      OpusEncoders.guaranteeOpusEngine();
      var options = { seek: seek, volume: volume, passes: passes };
      var transcoder = this.prism.transcode({
        type: 'ffmpeg',
        media: stream,
        ffmpegArguments: ffmpegArguments.concat(['-ss', String(seek)])
      });
      this.streams.set(transcoder.output, { transcoder: transcoder, input: stream });
      transcoder.on('error', function (e) {
        _this2.destroyStream(stream);
        if (_this2.listenerCount('error') > 0) _this2.emit('error', e);
        _this2.emit('warn', 'prism transcoder error - ' + e);
      });
      return this.playPCMStream(transcoder.output, options);
    }
  }, {
    key: 'playPCMStream',
    value: function playPCMStream(stream) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$seek = _ref2.seek,
          seek = _ref2$seek === undefined ? 0 : _ref2$seek,
          _ref2$volume = _ref2.volume,
          volume = _ref2$volume === undefined ? 1 : _ref2$volume,
          _ref2$passes = _ref2.passes,
          passes = _ref2$passes === undefined ? 1 : _ref2$passes;

      OpusEncoders.guaranteeOpusEngine();
      var options = { seek: seek, volume: volume, passes: passes };
      this.destroyAllStreams(stream);
      var dispatcher = this.createDispatcher(stream, options);
      if (!this.streams.has(stream)) this.streams.set(stream, { dispatcher: dispatcher, input: stream });
      this.streams.get(stream).dispatcher = dispatcher;
      return dispatcher;
    }
  }, {
    key: 'playOpusStream',
    value: function playOpusStream(stream) {
      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref3$seek = _ref3.seek,
          seek = _ref3$seek === undefined ? 0 : _ref3$seek,
          _ref3$passes = _ref3.passes,
          passes = _ref3$passes === undefined ? 1 : _ref3$passes;

      var options = { seek: seek, passes: passes, opus: true };
      this.destroyAllStreams(stream);
      var dispatcher = this.createDispatcher(stream, options);
      this.streams.set(stream, { dispatcher: dispatcher, input: stream });
      return dispatcher;
    }
  }, {
    key: 'playBroadcast',
    value: function playBroadcast(broadcast) {
      var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref4$volume = _ref4.volume,
          volume = _ref4$volume === undefined ? 1 : _ref4$volume,
          _ref4$passes = _ref4.passes,
          passes = _ref4$passes === undefined ? 1 : _ref4$passes;

      var options = { volume: volume, passes: passes };
      this.destroyAllStreams();
      var dispatcher = this.createDispatcher(broadcast, options);
      this.streams.set(broadcast, { dispatcher: dispatcher, input: broadcast });
      broadcast.registerDispatcher(dispatcher);
      return dispatcher;
    }
  }, {
    key: 'createDispatcher',
    value: function createDispatcher(stream, options) {
      var _this3 = this;

      var dispatcher = new StreamDispatcher(this, stream, options);
      dispatcher.on('end', function () {
        return _this3.destroyStream(stream);
      });
      dispatcher.on('error', function () {
        return _this3.destroyStream(stream);
      });
      dispatcher.on('speaking', function (value) {
        return _this3.voiceConnection.setSpeaking(value);
      });
      return dispatcher;
    }
  }, {
    key: 'currentTranscoder',
    get: function get() {
      return (this.streams.last() || {}).transcoder;
    }

    /**
     * The current dispatcher
     * @type {?StreamDispatcher}
     */

  }, {
    key: 'currentDispatcher',
    get: function get() {
      return this.streams.size > 0 ? this.streams.last().dispatcher || null : null;
    }
  }]);

  return AudioPlayer;
}(EventEmitter);

module.exports = AudioPlayer;