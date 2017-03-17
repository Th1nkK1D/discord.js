'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Message = require('../../structures/Message');

var MessageCreateAction = function (_Action) {
  _inherits(MessageCreateAction, _Action);

  function MessageCreateAction() {
    _classCallCheck(this, MessageCreateAction);

    return _possibleConstructorReturn(this, (MessageCreateAction.__proto__ || Object.getPrototypeOf(MessageCreateAction)).apply(this, arguments));
  }

  _createClass(MessageCreateAction, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var channel = client.channels.get((data instanceof Array ? data[0] : data).channel_id);
      var user = client.users.get((data instanceof Array ? data[0] : data).author.id);
      if (channel) {
        var member = channel.guild ? channel.guild.member(user) : null;
        if (data instanceof Array) {
          var messages = new Array(data.length);
          for (var i = 0; i < data.length; i++) {
            messages[i] = channel._cacheMessage(new Message(channel, data[i], client));
          }
          var lastMessage = messages[messages.length - 1];
          channel.lastMessageID = lastMessage.id;
          channel.lastMessage = lastMessage;
          if (user) {
            user.lastMessageID = lastMessage.id;
            user.lastMessage = lastMessage;
          }
          if (member) {
            member.lastMessageID = lastMessage.id;
            member.lastMessage = lastMessage;
          }
          return {
            messages: messages
          };
        } else {
          var message = channel._cacheMessage(new Message(channel, data, client));
          channel.lastMessageID = data.id;
          channel.lastMessage = message;
          if (user) {
            user.lastMessageID = data.id;
            user.lastMessage = message;
          }
          if (member) {
            member.lastMessageID = data.id;
            member.lastMessage = message;
          }
          return {
            message: message
          };
        }
      }

      return {
        message: null
      };
    }
  }]);

  return MessageCreateAction;
}(Action);

module.exports = MessageCreateAction;