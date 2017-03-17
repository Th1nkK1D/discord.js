'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');

var MessageDeleteAction = function (_Action) {
  _inherits(MessageDeleteAction, _Action);

  function MessageDeleteAction(client) {
    _classCallCheck(this, MessageDeleteAction);

    var _this = _possibleConstructorReturn(this, (MessageDeleteAction.__proto__ || Object.getPrototypeOf(MessageDeleteAction)).call(this, client));

    _this.deleted = new Map();
    return _this;
  }

  _createClass(MessageDeleteAction, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var channel = client.channels.get(data.channel_id);
      if (channel) {
        var message = channel.messages.get(data.id);

        if (message) {
          channel.messages.delete(message.id);
          this.deleted.set(channel.id + message.id, message);
          this.scheduleForDeletion(channel.id, message.id);
        } else {
          message = this.deleted.get(channel.id + data.id) || null;
        }

        return {
          message: message
        };
      }

      return {
        message: null
      };
    }
  }, {
    key: 'scheduleForDeletion',
    value: function scheduleForDeletion(channelID, messageID) {
      var _this2 = this;

      this.client.setTimeout(function () {
        return _this2.deleted.delete(channelID + messageID);
      }, this.client.options.restWsBridgeTimeout);
    }
  }]);

  return MessageDeleteAction;
}(Action);

module.exports = MessageDeleteAction;