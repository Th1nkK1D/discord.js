"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseOpus = function () {
  function BaseOpus(player) {
    _classCallCheck(this, BaseOpus);

    this.player = player;
  }

  _createClass(BaseOpus, [{
    key: "encode",
    value: function encode(buffer) {
      return buffer;
    }
  }, {
    key: "decode",
    value: function decode(buffer) {
      return buffer;
    }
  }, {
    key: "destroy",
    value: function destroy() {} // eslint-disable-line no-empty-function

  }]);

  return BaseOpus;
}();

module.exports = BaseOpus;