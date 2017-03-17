'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Constants = require('../../util/Constants');

var GuildDeleteAction = function (_Action) {
  _inherits(GuildDeleteAction, _Action);

  function GuildDeleteAction(client) {
    _classCallCheck(this, GuildDeleteAction);

    var _this = _possibleConstructorReturn(this, (GuildDeleteAction.__proto__ || Object.getPrototypeOf(GuildDeleteAction)).call(this, client));

    _this.deleted = new Map();
    return _this;
  }

  _createClass(GuildDeleteAction, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var guild = client.guilds.get(data.id);
      if (guild) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = guild.channels.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var channel = _step.value;

            if (channel.type === 'text') channel.stopTyping(true);
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

        if (guild.available && data.unavailable) {
          // Guild is unavailable
          guild.available = false;
          client.emit(Constants.Events.GUILD_UNAVAILABLE, guild);

          // Stops the GuildDelete packet thinking a guild was actually deleted,
          // handles emitting of event itself
          return {
            guild: null
          };
        }

        // Delete guild
        client.guilds.delete(guild.id);
        this.deleted.set(guild.id, guild);
        this.scheduleForDeletion(guild.id);
      } else {
        guild = this.deleted.get(data.id) || null;
      }

      return {
        guild: guild
      };
    }
  }, {
    key: 'scheduleForDeletion',
    value: function scheduleForDeletion(id) {
      var _this2 = this;

      this.client.setTimeout(function () {
        return _this2.deleted.delete(id);
      }, this.client.options.restWsBridgeTimeout);
    }
  }]);

  return GuildDeleteAction;
}(Action);

/**
 * Emitted whenever a guild becomes unavailable, likely due to a server outage.
 * @event Client#guildUnavailable
 * @param {Guild} guild The guild that has become unavailable.
 */

module.exports = GuildDeleteAction;