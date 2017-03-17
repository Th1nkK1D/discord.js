'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractHandler = require('./AbstractHandler');

var ChannelCreateHandler = function (_AbstractHandler) {
  _inherits(ChannelCreateHandler, _AbstractHandler);

  function ChannelCreateHandler() {
    _classCallCheck(this, ChannelCreateHandler);

    return _possibleConstructorReturn(this, (ChannelCreateHandler.__proto__ || Object.getPrototypeOf(ChannelCreateHandler)).apply(this, arguments));
  }

  _createClass(ChannelCreateHandler, [{
    key: 'handle',
    value: function handle(packet) {
      var client = this.packetManager.client;
      var data = packet.d;
      client.actions.ChannelCreate.handle(data);
    }
  }]);

  return ChannelCreateHandler;
}(AbstractHandler);

/**
 * Emitted whenever a channel is created.
 * @event Client#channelCreate
 * @param {Channel} channel The channel that was created
 */

module.exports = ChannelCreateHandler;