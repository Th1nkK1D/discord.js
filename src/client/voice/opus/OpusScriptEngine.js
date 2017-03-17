'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OpusEngine = require('./BaseOpusEngine');

var OpusScript = void 0;

var OpusScriptEngine = function (_OpusEngine) {
  _inherits(OpusScriptEngine, _OpusEngine);

  function OpusScriptEngine(player) {
    _classCallCheck(this, OpusScriptEngine);

    var _this = _possibleConstructorReturn(this, (OpusScriptEngine.__proto__ || Object.getPrototypeOf(OpusScriptEngine)).call(this, player));

    try {
      OpusScript = require('opusscript');
    } catch (err) {
      throw err;
    }
    _this.encoder = new OpusScript(48000, 2);
    return _this;
  }

  _createClass(OpusScriptEngine, [{
    key: 'encode',
    value: function encode(buffer) {
      _get(OpusScriptEngine.prototype.__proto__ || Object.getPrototypeOf(OpusScriptEngine.prototype), 'encode', this).call(this, buffer);
      return this.encoder.encode(buffer, 960);
    }
  }, {
    key: 'decode',
    value: function decode(buffer) {
      _get(OpusScriptEngine.prototype.__proto__ || Object.getPrototypeOf(OpusScriptEngine.prototype), 'decode', this).call(this, buffer);
      return this.encoder.decode(buffer);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      _get(OpusScriptEngine.prototype.__proto__ || Object.getPrototypeOf(OpusScriptEngine.prototype), 'destroy', this).call(this);
      this.encoder.delete();
    }
  }]);

  return OpusScriptEngine;
}(OpusEngine);

module.exports = OpusScriptEngine;