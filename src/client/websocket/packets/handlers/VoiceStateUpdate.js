'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractHandler = require('./AbstractHandler');

var Constants = require('../../../../util/Constants');
var Util = require('../../../../util/Util');

var VoiceStateUpdateHandler = function (_AbstractHandler) {
  _inherits(VoiceStateUpdateHandler, _AbstractHandler);

  function VoiceStateUpdateHandler() {
    _classCallCheck(this, VoiceStateUpdateHandler);

    return _possibleConstructorReturn(this, (VoiceStateUpdateHandler.__proto__ || Object.getPrototypeOf(VoiceStateUpdateHandler)).apply(this, arguments));
  }

  _createClass(VoiceStateUpdateHandler, [{
    key: 'handle',
    value: function handle(packet) {
      var client = this.packetManager.client;
      var data = packet.d;

      var guild = client.guilds.get(data.guild_id);
      if (guild) {
        var member = guild.members.get(data.user_id);
        if (member) {
          var oldVoiceChannelMember = Util.cloneObject(member);
          if (member.voiceChannel && member.voiceChannel.id !== data.channel_id) {
            member.voiceChannel.members.delete(oldVoiceChannelMember.id);
          }

          // If the member left the voice channel, unset their speaking property
          if (!data.channel_id) member.speaking = null;

          if (member.user.id === client.user.id && data.channel_id) {
            client.emit('self.voiceStateUpdate', data);
          }

          var newChannel = client.channels.get(data.channel_id);
          if (newChannel) newChannel.members.set(member.user.id, member);

          member.serverMute = data.mute;
          member.serverDeaf = data.deaf;
          member.selfMute = data.self_mute;
          member.selfDeaf = data.self_deaf;
          member.voiceSessionID = data.session_id;
          member.voiceChannelID = data.channel_id;
          client.emit(Constants.Events.VOICE_STATE_UPDATE, oldVoiceChannelMember, member);
        }
      }
    }
  }]);

  return VoiceStateUpdateHandler;
}(AbstractHandler);

/**
 * Emitted whenever a user changes voice state - e.g. joins/leaves a channel, mutes/unmutes.
 * @event Client#voiceStateUpdate
 * @param {GuildMember} oldMember The member before the voice state update
 * @param {GuildMember} newMember The member after the voice state update
 */

module.exports = VoiceStateUpdateHandler;