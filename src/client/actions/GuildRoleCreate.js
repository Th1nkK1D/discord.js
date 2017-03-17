'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Constants = require('../../util/Constants');
var Role = require('../../structures/Role');

var GuildRoleCreate = function (_Action) {
  _inherits(GuildRoleCreate, _Action);

  function GuildRoleCreate() {
    _classCallCheck(this, GuildRoleCreate);

    return _possibleConstructorReturn(this, (GuildRoleCreate.__proto__ || Object.getPrototypeOf(GuildRoleCreate)).apply(this, arguments));
  }

  _createClass(GuildRoleCreate, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var guild = client.guilds.get(data.guild_id);
      if (guild) {
        var already = guild.roles.has(data.role.id);
        var role = new Role(guild, data.role);
        guild.roles.set(role.id, role);
        if (!already) client.emit(Constants.Events.GUILD_ROLE_CREATE, role);

        return {
          role: role
        };
      }

      return {
        role: null
      };
    }
  }]);

  return GuildRoleCreate;
}(Action);

/**
 * Emitted whenever a role is created.
 * @event Client#roleCreate
 * @param {Role} role The role that was created.
 */

module.exports = GuildRoleCreate;