'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events');

var VolumeInterface = function (_EventEmitter) {
  _inherits(VolumeInterface, _EventEmitter);

  function VolumeInterface() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$volume = _ref.volume,
        volume = _ref$volume === undefined ? 0 : _ref$volume;

    _classCallCheck(this, VolumeInterface);

    var _this = _possibleConstructorReturn(this, (VolumeInterface.__proto__ || Object.getPrototypeOf(VolumeInterface)).call(this));

    _this.setVolume(volume || 1);
    return _this;
  }

  _createClass(VolumeInterface, [{
    key: 'applyVolume',
    value: function applyVolume(buffer, volume) {
      volume = volume || this._volume;
      if (volume === 1) return buffer;

      var out = new Buffer(buffer.length);
      for (var i = 0; i < buffer.length; i += 2) {
        if (i >= buffer.length - 1) break;
        var uint = Math.min(32767, Math.max(-32767, Math.floor(volume * buffer.readInt16LE(i))));
        out.writeInt16LE(uint, i);
      }

      return out;
    }

    /**
     * Sets the volume relative to the input stream - i.e. 1 is normal, 0.5 is half, 2 is double.
     * @param {number} volume The volume that you want to set
     */

  }, {
    key: 'setVolume',
    value: function setVolume(volume) {
      /**
       * Emitted when the volume of this interface changes
       * @event VolumeInterface#volumeChange
       * @param {number} oldVolume The old volume of this interface
       * @param {number} newVolume The new volume of this interface
       */
      this.emit('volumeChange', this._volume, volume);
      this._volume = volume;
    }

    /**
     * Set the volume in decibels
     * @param {number} db The decibels
     */

  }, {
    key: 'setVolumeDecibels',
    value: function setVolumeDecibels(db) {
      this.setVolume(Math.pow(10, db / 20));
    }

    /**
     * Set the volume so that a perceived value of 0.5 is half the perceived volume etc.
     * @param {number} value The value for the volume
     */

  }, {
    key: 'setVolumeLogarithmic',
    value: function setVolumeLogarithmic(value) {
      this.setVolume(Math.pow(value, 1.660964));
    }

    /**
     * The current volume of the broadcast
     * @readonly
     * @type {number}
     */

  }, {
    key: 'volume',
    get: function get() {
      return this._volume;
    }
  }]);

  return VolumeInterface;
}(EventEmitter);

module.exports = VolumeInterface;