'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractHandler = require('./AbstractHandler');
var Constants = require('../../../../util/Constants');
var Util = require('../../../../util/Util');

var PresenceUpdateHandler = function (_AbstractHandler) {
  _inherits(PresenceUpdateHandler, _AbstractHandler);

  function PresenceUpdateHandler() {
    _classCallCheck(this, PresenceUpdateHandler);

    return _possibleConstructorReturn(this, (PresenceUpdateHandler.__proto__ || Object.getPrototypeOf(PresenceUpdateHandler)).apply(this, arguments));
  }

  _createClass(PresenceUpdateHandler, [{
    key: 'handle',
    value: function handle(packet) {
      var client = this.packetManager.client;
      var data = packet.d;
      var user = client.users.get(data.user.id);
      var guild = client.guilds.get(data.guild_id);

      // Step 1
      if (!user) {
        if (data.user.username) {
          user = client.dataManager.newUser(data.user);
        } else {
          return;
        }
      }

      var oldUser = Util.cloneObject(user);
      user.patch(data.user);
      if (!user.equals(oldUser)) {
        client.emit(Constants.Events.USER_UPDATE, oldUser, user);
      }

      if (guild) {
        var member = guild.members.get(user.id);
        if (!member && data.status !== 'offline') {
          member = guild._addMember({
            user: user,
            roles: data.roles,
            deaf: false,
            mute: false
          }, false);
          client.emit(Constants.Events.GUILD_MEMBER_AVAILABLE, member);
        }
        if (member) {
          if (client.listenerCount(Constants.Events.PRESENCE_UPDATE) === 0) {
            guild._setPresence(user.id, data);
            return;
          }
          var oldMember = Util.cloneObject(member);
          if (member.presence) {
            oldMember.frozenPresence = Util.cloneObject(member.presence);
          }
          guild._setPresence(user.id, data);
          client.emit(Constants.Events.PRESENCE_UPDATE, oldMember, member);
        } else {
          guild._setPresence(user.id, data);
        }
      }
    }
  }]);

  return PresenceUpdateHandler;
}(AbstractHandler);

/**
 * Emitted whenever a guild member's presence changes, or they change one of their details.
 * @event Client#presenceUpdate
 * @param {GuildMember} oldMember The member before the presence update
 * @param {GuildMember} newMember The member after the presence update
 */

/**
 * Emitted whenever a user's details (e.g. username) are changed.
 * @event Client#userUpdate
 * @param {User} oldUser The user before the update
 * @param {User} newUser The user after the update
 */

/**
 * Emitted whenever a member becomes available in a large guild
 * @event Client#guildMemberAvailable
 * @param {GuildMember} member The member that became available
 */

module.exports = PresenceUpdateHandler;