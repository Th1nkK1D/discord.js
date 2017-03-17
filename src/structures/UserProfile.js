'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Collection = require('../util/Collection');
var UserConnection = require('./UserConnection');

/**
 * Represents a user's profile on Discord.
 */

var UserProfile = function () {
  function UserProfile(user, data) {
    _classCallCheck(this, UserProfile);

    /**
     * The owner of the profile
     * @type {User}
     */
    this.user = user;

    /**
     * The Client that created the instance of the the UserProfile.
     * @name UserProfile#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: user.client });

    /**
     * Guilds that the client user and the user share
     * @type {Collection<Snowflake, Guild>}
     */
    this.mutualGuilds = new Collection();

    /**
     * The user's connections
     * @type {Collection<String, UserConnection>}
     */
    this.connections = new Collection();

    this.setup(data);
  }

  _createClass(UserProfile, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * If the user has Discord Premium
       * @type {boolean}
       */
      this.premium = data.premium;

      /**
       * The date since which the user has had Discord Premium
       * @type {?Date}
       */
      this.premiumSince = data.premium_since ? new Date(data.premium_since) : null;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data.mutual_guilds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var guild = _step.value;

          if (this.client.guilds.has(guild.id)) {
            this.mutualGuilds.set(guild.id, this.client.guilds.get(guild.id));
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data.connected_accounts[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var connection = _step2.value;

          this.connections.set(connection.id, new UserConnection(this.user, connection));
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }]);

  return UserProfile;
}();

module.exports = UserProfile;