'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractHandler = require('./AbstractHandler');
var Constants = require('../../../../util/Constants');
// Uncomment in v12
// const Collection = require('../../../../util/Collection');

var GuildMembersChunkHandler = function (_AbstractHandler) {
  _inherits(GuildMembersChunkHandler, _AbstractHandler);

  function GuildMembersChunkHandler() {
    _classCallCheck(this, GuildMembersChunkHandler);

    return _possibleConstructorReturn(this, (GuildMembersChunkHandler.__proto__ || Object.getPrototypeOf(GuildMembersChunkHandler)).apply(this, arguments));
  }

  _createClass(GuildMembersChunkHandler, [{
    key: 'handle',
    value: function handle(packet) {
      var client = this.packetManager.client;
      var data = packet.d;
      var guild = client.guilds.get(data.guild_id);
      if (!guild) return;

      // Uncomment in v12
      // const members = new Collection();
      //
      // for (const member of data.members) members.set(member.id, guild._addMember(member, false));

      var members = data.members.map(function (member) {
        return guild._addMember(member, false);
      });

      client.emit(Constants.Events.GUILD_MEMBERS_CHUNK, members, guild);

      client.ws.lastHeartbeatAck = true;
    }
  }]);

  return GuildMembersChunkHandler;
}(AbstractHandler);

/**
 * Emitted whenever a chunk of guild members is received (all members come from the same guild)
 * @event Client#guildMembersChunk
 * @param {Collection<Snowflake, GuildMember>} members The members in the chunk
 * @param {Guild} guild The guild related to the member chunk
 */

module.exports = GuildMembersChunkHandler;