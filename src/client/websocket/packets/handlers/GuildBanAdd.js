'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// ##untested handler##

var AbstractHandler = require('./AbstractHandler');
var Constants = require('../../../../util/Constants');

var GuildBanAddHandler = function (_AbstractHandler) {
  _inherits(GuildBanAddHandler, _AbstractHandler);

  function GuildBanAddHandler() {
    _classCallCheck(this, GuildBanAddHandler);

    return _possibleConstructorReturn(this, (GuildBanAddHandler.__proto__ || Object.getPrototypeOf(GuildBanAddHandler)).apply(this, arguments));
  }

  _createClass(GuildBanAddHandler, [{
    key: 'handle',
    value: function handle(packet) {
      var client = this.packetManager.client;
      var data = packet.d;
      var guild = client.guilds.get(data.guild_id);
      var user = client.users.get(data.user.id);
      if (guild && user) client.emit(Constants.Events.GUILD_BAN_ADD, guild, user);
    }
  }]);

  return GuildBanAddHandler;
}(AbstractHandler);

/**
 * Emitted whenever a member is banned from a guild.
 * @event Client#guildBanAdd
 * @param {Guild} guild The guild that the ban occurred in
 * @param {User} user The user that was banned
 */

module.exports = GuildBanAddHandler;