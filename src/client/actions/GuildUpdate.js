'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Constants = require('../../util/Constants');
var Util = require('../../util/Util');

var GuildUpdateAction = function (_Action) {
  _inherits(GuildUpdateAction, _Action);

  function GuildUpdateAction() {
    _classCallCheck(this, GuildUpdateAction);

    return _possibleConstructorReturn(this, (GuildUpdateAction.__proto__ || Object.getPrototypeOf(GuildUpdateAction)).apply(this, arguments));
  }

  _createClass(GuildUpdateAction, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var guild = client.guilds.get(data.id);
      if (guild) {
        var oldGuild = Util.cloneObject(guild);
        guild.setup(data);
        client.emit(Constants.Events.GUILD_UPDATE, oldGuild, guild);
        return {
          old: oldGuild,
          updated: guild
        };
      }

      return {
        old: null,
        updated: null
      };
    }
  }]);

  return GuildUpdateAction;
}(Action);

/**
 * Emitted whenever a guild is updated - e.g. name change.
 * @event Client#guildUpdate
 * @param {Guild} oldGuild The guild before the update.
 * @param {Guild} newGuild The guild after the update.
 */

module.exports = GuildUpdateAction;