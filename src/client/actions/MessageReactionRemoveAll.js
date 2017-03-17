'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Constants = require('../../util/Constants');

var MessageReactionRemoveAll = function (_Action) {
  _inherits(MessageReactionRemoveAll, _Action);

  function MessageReactionRemoveAll() {
    _classCallCheck(this, MessageReactionRemoveAll);

    return _possibleConstructorReturn(this, (MessageReactionRemoveAll.__proto__ || Object.getPrototypeOf(MessageReactionRemoveAll)).apply(this, arguments));
  }

  _createClass(MessageReactionRemoveAll, [{
    key: 'handle',
    value: function handle(data) {
      var channel = this.client.channels.get(data.channel_id);
      if (!channel || channel.type === 'voice') return false;

      var message = channel.messages.get(data.message_id);
      if (!message) return false;

      message._clearReactions();
      this.client.emit(Constants.Events.MESSAGE_REACTION_REMOVE_ALL, message);

      return {
        message: message
      };
    }
  }]);

  return MessageReactionRemoveAll;
}(Action);
/**
 * Emitted whenever all reactions are removed from a message.
 * @event Client#messageReactionRemoveAll
 * @param {MessageReaction} messageReaction The reaction object.
 */


module.exports = MessageReactionRemoveAll;