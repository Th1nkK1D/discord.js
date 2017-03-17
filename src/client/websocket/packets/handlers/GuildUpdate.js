'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractHandler = require('./AbstractHandler');

var GuildUpdateHandler = function (_AbstractHandler) {
  _inherits(GuildUpdateHandler, _AbstractHandler);

  function GuildUpdateHandler() {
    _classCallCheck(this, GuildUpdateHandler);

    return _possibleConstructorReturn(this, (GuildUpdateHandler.__proto__ || Object.getPrototypeOf(GuildUpdateHandler)).apply(this, arguments));
  }

  _createClass(GuildUpdateHandler, [{
    key: 'handle',
    value: function handle(packet) {
      var client = this.packetManager.client;
      var data = packet.d;
      client.actions.GuildUpdate.handle(data);
    }
  }]);

  return GuildUpdateHandler;
}(AbstractHandler);

module.exports = GuildUpdateHandler;