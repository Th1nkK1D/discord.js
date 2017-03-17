'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events').EventEmitter;
var secretbox = require('../util/Secretbox');
var Readable = require('./VoiceReadable');
var OpusEncoders = require('../opus/OpusEngineList');

var nonce = Buffer.alloc(24);
nonce.fill(0);

/**
 * Receives voice data from a voice connection.
 * ```js
 * // obtained using:
 * voiceChannel.join().then(connection => {
 *  const receiver = connection.createReceiver();
 * });
 * ```
 * @extends {EventEmitter}
 */

var VoiceReceiver = function (_EventEmitter) {
  _inherits(VoiceReceiver, _EventEmitter);

  function VoiceReceiver(connection) {
    _classCallCheck(this, VoiceReceiver);

    /*
      Need a queue because we don't get the ssrc of the user speaking until after the first few packets,
      so we queue up unknown SSRCs until they become known, then empty the queue.
    */
    var _this = _possibleConstructorReturn(this, (VoiceReceiver.__proto__ || Object.getPrototypeOf(VoiceReceiver)).call(this));

    _this.queues = new Map();
    _this.pcmStreams = new Map();
    _this.opusStreams = new Map();
    _this.opusEncoders = new Map();

    /**
     * Whether or not this receiver has been destroyed.
     * @type {boolean}
     */
    _this.destroyed = false;

    /**
     * The VoiceConnection that instantiated this
     * @type {VoiceConnection}
     */
    _this.voiceConnection = connection;

    _this._listener = function (msg) {
      var ssrc = +msg.readUInt32BE(8).toString(10);
      var user = _this.voiceConnection.ssrcMap.get(ssrc);
      if (!user) {
        if (!_this.queues.has(ssrc)) _this.queues.set(ssrc, []);
        _this.queues.get(ssrc).push(msg);
      } else {
        if (_this.queues.get(ssrc)) {
          _this.queues.get(ssrc).push(msg);
          _this.queues.get(ssrc).map(function (m) {
            return _this.handlePacket(m, user);
          });
          _this.queues.delete(ssrc);
          return;
        }
        _this.handlePacket(msg, user);
      }
    };
    _this.voiceConnection.sockets.udp.socket.on('message', _this._listener);
    return _this;
  }

  /**
   * If this VoiceReceiver has been destroyed, running `recreate()` will recreate the listener.
   * This avoids you having to create a new receiver.
   * <info>Any streams that you had prior to destroying the receiver will not be recreated.</info>
   */


  _createClass(VoiceReceiver, [{
    key: 'recreate',
    value: function recreate() {
      if (!this.destroyed) return;
      this.voiceConnection.sockets.udp.socket.on('message', this._listener);
      this.destroyed = false;
    }

    /**
     * Destroy this VoiceReceiver, also ending any streams that it may be controlling.
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.voiceConnection.sockets.udp.socket.removeListener('message', this._listener);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.pcmStreams[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2),
              id = _step$value[0],
              stream = _step$value[1];

          stream._push(null);
          this.pcmStreams.delete(id);
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.opusStreams[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _step2$value = _slicedToArray(_step2.value, 2),
              id = _step2$value[0],
              stream = _step2$value[1];

          stream._push(null);
          this.opusStreams.delete(id);
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

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.opusEncoders[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _step3$value = _slicedToArray(_step3.value, 2),
              id = _step3$value[0],
              encoder = _step3$value[1];

          encoder.destroy();
          this.opusEncoders.delete(id);
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

      this.destroyed = true;
    }

    /**
     * Invoked when a user stops speaking
     * @param {User} user The user that stopped speaking
     * @private
     */

  }, {
    key: 'stoppedSpeaking',
    value: function stoppedSpeaking(user) {
      var opusStream = this.opusStreams.get(user.id);
      var pcmStream = this.pcmStreams.get(user.id);
      var opusEncoder = this.opusEncoders.get(user.id);
      if (opusStream) {
        opusStream.push(null);
        opusStream.open = false;
        this.opusStreams.delete(user.id);
      }
      if (pcmStream) {
        pcmStream.push(null);
        pcmStream.open = false;
        this.pcmStreams.delete(user.id);
      }
      if (opusEncoder) {
        opusEncoder.destroy();
      }
    }

    /**
     * Creates a readable stream for a user that provides opus data while the user is speaking. When the user
     * stops speaking, the stream is destroyed.
     * @param {UserResolvable} user The user to create the stream for
     * @returns {ReadableStream}
     */

  }, {
    key: 'createOpusStream',
    value: function createOpusStream(user) {
      user = this.voiceConnection.voiceManager.client.resolver.resolveUser(user);
      if (!user) throw new Error('Couldn\'t resolve the user to create Opus stream.');
      if (this.opusStreams.get(user.id)) throw new Error('There is already an existing stream for that user.');
      var stream = new Readable();
      this.opusStreams.set(user.id, stream);
      return stream;
    }

    /**
     * Creates a readable stream for a user that provides PCM data while the user is speaking. When the user
     * stops speaking, the stream is destroyed. The stream is 32-bit signed stereo PCM at 48KHz.
     * @param {UserResolvable} user The user to create the stream for
     * @returns {ReadableStream}
     */

  }, {
    key: 'createPCMStream',
    value: function createPCMStream(user) {
      user = this.voiceConnection.voiceManager.client.resolver.resolveUser(user);
      if (!user) throw new Error('Couldn\'t resolve the user to create PCM stream.');
      if (this.pcmStreams.get(user.id)) throw new Error('There is already an existing stream for that user.');
      var stream = new Readable();
      this.pcmStreams.set(user.id, stream);
      return stream;
    }
  }, {
    key: 'handlePacket',
    value: function handlePacket(msg, user) {
      msg.copy(nonce, 0, 0, 12);
      var data = secretbox.open(msg.slice(12), nonce, this.voiceConnection.authentication.secretKey.key);
      if (!data) {
        /**
         * Emitted whenever a voice packet experiences a problem.
         * @event VoiceReceiver#warn
         * @param {string} reason The reason for the warning. If it happened because the voice packet could not be
         * decrypted, this would be `decrypt`. If it happened because the voice packet could not be decoded into
         * PCM, this would be `decode`.
         * @param {string} message The warning message
         */
        this.emit('warn', 'decrypt', 'Failed to decrypt voice packet');
        return;
      }
      data = Buffer.from(data);
      if (this.opusStreams.get(user.id)) this.opusStreams.get(user.id)._push(data);
      /**
       * Emitted whenever voice data is received from the voice connection. This is _always_ emitted (unlike PCM).
       * @event VoiceReceiver#opus
       * @param {User} user The user that is sending the buffer (is speaking)
       * @param {Buffer} buffer The opus buffer
       */
      this.emit('opus', user, data);
      if (this.listenerCount('pcm') > 0 || this.pcmStreams.size > 0) {
        if (!this.opusEncoders.get(user.id)) this.opusEncoders.set(user.id, OpusEncoders.fetch());

        var _VoiceReceiver$_tryDe = VoiceReceiver._tryDecode(this.opusEncoders.get(user.id), data),
            pcm = _VoiceReceiver$_tryDe.pcm,
            error = _VoiceReceiver$_tryDe.error;

        if (error) {
          this.emit('warn', 'decode', 'Failed to decode packet voice to PCM because: ' + error.message);
          return;
        }
        if (this.pcmStreams.get(user.id)) this.pcmStreams.get(user.id)._push(pcm);
        /**
         * Emits decoded voice data when it's received. For performance reasons, the decoding will only
         * happen if there is at least one `pcm` listener on this receiver.
         * @event VoiceReceiver#pcm
         * @param {User} user The user that is sending the buffer (is speaking)
         * @param {Buffer} buffer The decoded buffer
         */
        this.emit('pcm', user, pcm);
      }
    }
  }], [{
    key: '_tryDecode',
    value: function _tryDecode(encoder, data) {
      try {
        return { pcm: encoder.decode(data) };
      } catch (error) {
        return { error: error };
      }
    }
  }]);

  return VoiceReceiver;
}(EventEmitter);

module.exports = VoiceReceiver;