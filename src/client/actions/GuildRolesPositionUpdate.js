'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');

var GuildRolesPositionUpdate = function (_Action) {
  _inherits(GuildRolesPositionUpdate, _Action);

  function GuildRolesPositionUpdate() {
    _classCallCheck(this, GuildRolesPositionUpdate);

    return _possibleConstructorReturn(this, (GuildRolesPositionUpdate.__proto__ || Object.getPrototypeOf(GuildRolesPositionUpdate)).apply(this, arguments));
  }

  _createClass(GuildRolesPositionUpdate, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var guild = client.guilds.get(data.guild_id);
      if (guild) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = data.roles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var partialRole = _step.value;

            var role = guild.roles.get(partialRole.id);
            if (role) {
              role.position = partialRole.position;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      return {
        guild: guild
      };
    }
  }]);

  return GuildRolesPositionUpdate;
}(Action);

module.exports = GuildRolesPositionUpdate;