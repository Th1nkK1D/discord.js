'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');

var GuildEmojiCreateAction = function (_Action) {
  _inherits(GuildEmojiCreateAction, _Action);

  function GuildEmojiCreateAction() {
    _classCallCheck(this, GuildEmojiCreateAction);

    return _possibleConstructorReturn(this, (GuildEmojiCreateAction.__proto__ || Object.getPrototypeOf(GuildEmojiCreateAction)).apply(this, arguments));
  }

  _createClass(GuildEmojiCreateAction, [{
    key: 'handle',
    value: function handle(guild, createdEmoji) {
      var client = this.client;
      var emoji = client.dataManager.newEmoji(createdEmoji, guild);
      return {
        emoji: emoji
      };
    }
  }]);

  return GuildEmojiCreateAction;
}(Action);

/**
 * Emitted whenever a custom emoji is created in a guild
 * @event Client#emojiCreate
 * @param {Emoji} emoji The emoji that was created.
 */


module.exports = GuildEmojiCreateAction;