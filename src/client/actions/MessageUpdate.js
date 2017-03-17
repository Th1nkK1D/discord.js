'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Constants = require('../../util/Constants');
var Util = require('../../util/Util');

var MessageUpdateAction = function (_Action) {
  _inherits(MessageUpdateAction, _Action);

  function MessageUpdateAction() {
    _classCallCheck(this, MessageUpdateAction);

    return _possibleConstructorReturn(this, (MessageUpdateAction.__proto__ || Object.getPrototypeOf(MessageUpdateAction)).apply(this, arguments));
  }

  _createClass(MessageUpdateAction, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var channel = client.channels.get(data.channel_id);
      if (channel) {
        var message = channel.messages.get(data.id);
        if (message) {
          var oldMessage = Util.cloneObject(message);
          message.patch(data);
          message._edits.unshift(oldMessage);
          client.emit(Constants.Events.MESSAGE_UPDATE, oldMessage, message);
          return {
            old: oldMessage,
            updated: message
          };
        }

        return {
          old: message,
          updated: message
        };
      }

      return {
        old: null,
        updated: null
      };
    }
  }]);

  return MessageUpdateAction;
}(Action);

/**
 * Emitted whenever a message is updated - e.g. embed or content change.
 * @event Client#messageUpdate
 * @param {Message} oldMessage The message before the update.
 * @param {Message} newMessage The message after the update.
 */

module.exports = MessageUpdateAction;