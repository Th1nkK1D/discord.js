'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractHandler = require('./AbstractHandler');
var Constants = require('../../../../util/Constants');

var MessageDeleteHandler = function (_AbstractHandler) {
  _inherits(MessageDeleteHandler, _AbstractHandler);

  function MessageDeleteHandler() {
    _classCallCheck(this, MessageDeleteHandler);

    return _possibleConstructorReturn(this, (MessageDeleteHandler.__proto__ || Object.getPrototypeOf(MessageDeleteHandler)).apply(this, arguments));
  }

  _createClass(MessageDeleteHandler, [{
    key: 'handle',
    value: function handle(packet) {
      var client = this.packetManager.client;
      var data = packet.d;
      var response = client.actions.MessageDelete.handle(data);
      if (response.message) client.emit(Constants.Events.MESSAGE_DELETE, response.message);
    }
  }]);

  return MessageDeleteHandler;
}(AbstractHandler);

/**
 * Emitted whenever a message is deleted
 * @event Client#messageDelete
 * @param {Message} message The deleted message
 */

module.exports = MessageDeleteHandler;