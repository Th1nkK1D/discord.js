'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Constants = require('../../util/Constants');
var Util = require('../../util/Util');

var GuildRoleUpdateAction = function (_Action) {
  _inherits(GuildRoleUpdateAction, _Action);

  function GuildRoleUpdateAction() {
    _classCallCheck(this, GuildRoleUpdateAction);

    return _possibleConstructorReturn(this, (GuildRoleUpdateAction.__proto__ || Object.getPrototypeOf(GuildRoleUpdateAction)).apply(this, arguments));
  }

  _createClass(GuildRoleUpdateAction, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var guild = client.guilds.get(data.guild_id);
      if (guild) {
        var roleData = data.role;
        var oldRole = null;

        var role = guild.roles.get(roleData.id);
        if (role) {
          oldRole = Util.cloneObject(role);
          role.setup(data.role);
          client.emit(Constants.Events.GUILD_ROLE_UPDATE, oldRole, role);
        }

        return {
          old: oldRole,
          updated: role
        };
      }

      return {
        old: null,
        updated: null
      };
    }
  }]);

  return GuildRoleUpdateAction;
}(Action);

/**
 * Emitted whenever a guild role is updated.
 * @event Client#roleUpdate
 * @param {Role} oldRole The role before the update.
 * @param {Role} newRole The role after the update.
 */

module.exports = GuildRoleUpdateAction;