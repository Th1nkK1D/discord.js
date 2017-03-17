'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ActionsManager = function () {
  function ActionsManager(client) {
    _classCallCheck(this, ActionsManager);

    this.client = client;

    this.register(require('./MessageCreate'));
    this.register(require('./MessageDelete'));
    this.register(require('./MessageDeleteBulk'));
    this.register(require('./MessageUpdate'));
    this.register(require('./MessageReactionAdd'));
    this.register(require('./MessageReactionRemove'));
    this.register(require('./MessageReactionRemoveAll'));
    this.register(require('./ChannelCreate'));
    this.register(require('./ChannelDelete'));
    this.register(require('./ChannelUpdate'));
    this.register(require('./GuildDelete'));
    this.register(require('./GuildUpdate'));
    this.register(require('./GuildMemberGet'));
    this.register(require('./GuildMemberRemove'));
    this.register(require('./GuildBanRemove'));
    this.register(require('./GuildRoleCreate'));
    this.register(require('./GuildRoleDelete'));
    this.register(require('./GuildRoleUpdate'));
    this.register(require('./UserGet'));
    this.register(require('./UserUpdate'));
    this.register(require('./UserNoteUpdate'));
    this.register(require('./GuildSync'));
    this.register(require('./GuildEmojiCreate'));
    this.register(require('./GuildEmojiDelete'));
    this.register(require('./GuildEmojiUpdate'));
    this.register(require('./GuildRolesPositionUpdate'));
    this.register(require('./GuildChannelsPositionUpdate'));
  }

  _createClass(ActionsManager, [{
    key: 'register',
    value: function register(Action) {
      this[Action.name.replace(/Action$/, '')] = new Action(this.client);
    }
  }]);

  return ActionsManager;
}();

module.exports = ActionsManager;