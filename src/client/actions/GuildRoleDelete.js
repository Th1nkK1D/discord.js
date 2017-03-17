'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Constants = require('../../util/Constants');

var GuildRoleDeleteAction = function (_Action) {
  _inherits(GuildRoleDeleteAction, _Action);

  function GuildRoleDeleteAction(client) {
    _classCallCheck(this, GuildRoleDeleteAction);

    var _this = _possibleConstructorReturn(this, (GuildRoleDeleteAction.__proto__ || Object.getPrototypeOf(GuildRoleDeleteAction)).call(this, client));

    _this.deleted = new Map();
    return _this;
  }

  _createClass(GuildRoleDeleteAction, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var guild = client.guilds.get(data.guild_id);
      if (guild) {
        var role = guild.roles.get(data.role_id);
        if (role) {
          guild.roles.delete(data.role_id);
          this.deleted.set(guild.id + data.role_id, role);
          this.scheduleForDeletion(guild.id, data.role_id);
          client.emit(Constants.Events.GUILD_ROLE_DELETE, role);
        } else {
          role = this.deleted.get(guild.id + data.role_id) || null;
        }

        return {
          role: role
        };
      }

      return {
        role: null
      };
    }
  }, {
    key: 'scheduleForDeletion',
    value: function scheduleForDeletion(guildID, roleID) {
      var _this2 = this;

      this.client.setTimeout(function () {
        return _this2.deleted.delete(guildID + roleID);
      }, this.client.options.restWsBridgeTimeout);
    }
  }]);

  return GuildRoleDeleteAction;
}(Action);

/**
 * Emitted whenever a guild role is deleted.
 * @event Client#roleDelete
 * @param {Role} role The role that was deleted.
 */

module.exports = GuildRoleDeleteAction;