'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Constants = require('../../util/Constants');

/*
{ user_id: 'id',
     message_id: 'id',
     emoji: { name: '�', id: null },
     channel_id: 'id' } }
*/

var MessageReactionRemove = function (_Action) {
  _inherits(MessageReactionRemove, _Action);

  function MessageReactionRemove() {
    _classCallCheck(this, MessageReactionRemove);

    return _possibleConstructorReturn(this, (MessageReactionRemove.__proto__ || Object.getPrototypeOf(MessageReactionRemove)).apply(this, arguments));
  }

  _createClass(MessageReactionRemove, [{
    key: 'handle',
    value: function handle(data) {
      var user = this.client.users.get(data.user_id);
      if (!user) return false;

      var channel = this.client.channels.get(data.channel_id);
      if (!channel || channel.type === 'voice') return false;

      var message = channel.messages.get(data.message_id);
      if (!message) return false;

      if (!data.emoji) return false;

      var reaction = message._removeReaction(data.emoji, user);

      if (reaction) {
        this.client.emit(Constants.Events.MESSAGE_REACTION_REMOVE, reaction, user);
      }

      return {
        message: message,
        reaction: reaction,
        user: user
      };
    }
  }]);

  return MessageReactionRemove;
}(Action);
/**
 * Emitted whenever a reaction is removed from a message.
 * @event Client#messageReactionRemove
 * @param {MessageReaction} messageReaction The reaction object.
 * @param {User} user The user that removed the emoji or reaction emoji.
 */


module.exports = MessageReactionRemove;