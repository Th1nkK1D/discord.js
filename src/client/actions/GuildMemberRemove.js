'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Constants = require('../../util/Constants');

var GuildMemberRemoveAction = function (_Action) {
  _inherits(GuildMemberRemoveAction, _Action);

  function GuildMemberRemoveAction(client) {
    _classCallCheck(this, GuildMemberRemoveAction);

    var _this = _possibleConstructorReturn(this, (GuildMemberRemoveAction.__proto__ || Object.getPrototypeOf(GuildMemberRemoveAction)).call(this, client));

    _this.deleted = new Map();
    return _this;
  }

  _createClass(GuildMemberRemoveAction, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var guild = client.guilds.get(data.guild_id);
      if (guild) {
        var member = guild.members.get(data.user.id);
        if (member) {
          guild.memberCount--;
          guild._removeMember(member);
          this.deleted.set(guild.id + data.user.id, member);
          if (client.status === Constants.Status.READY) client.emit(Constants.Events.GUILD_MEMBER_REMOVE, member);
          this.scheduleForDeletion(guild.id, data.user.id);
        } else {
          member = this.deleted.get(guild.id + data.user.id) || null;
        }

        return {
          guild: guild,
          member: member
        };
      }

      return {
        guild: guild,
        member: null
      };
    }
  }, {
    key: 'scheduleForDeletion',
    value: function scheduleForDeletion(guildID, userID) {
      var _this2 = this;

      this.client.setTimeout(function () {
        return _this2.deleted.delete(guildID + userID);
      }, this.client.options.restWsBridgeTimeout);
    }
  }]);

  return GuildMemberRemoveAction;
}(Action);

/**
 * Emitted whenever a member leaves a guild, or is kicked.
 * @event Client#guildMemberRemove
 * @param {GuildMember} member The member that has left/been kicked from the guild.
 */

module.exports = GuildMemberRemoveAction;