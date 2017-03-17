'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Collection = require('../util/Collection');
var Emoji = require('./Emoji');
var ReactionEmoji = require('./ReactionEmoji');

/**
 * Represents a reaction to a message
 */

var MessageReaction = function () {
  function MessageReaction(message, emoji, count, me) {
    _classCallCheck(this, MessageReaction);

    /**
     * The message that this reaction refers to
     * @type {Message}
     */
    this.message = message;

    /**
     * Whether the client has given this reaction
     * @type {boolean}
     */
    this.me = me;

    /**
     * The number of people that have given the same reaction.
     * @type {number}
     */
    this.count = count || 0;

    /**
     * The users that have given this reaction, mapped by their ID.
     * @type {Collection<Snowflake, User>}
     */
    this.users = new Collection();

    this._emoji = new ReactionEmoji(this, emoji.name, emoji.id);
  }

  /**
   * The emoji of this reaction, either an Emoji object for known custom emojis, or a ReactionEmoji
   * object which has fewer properties. Whatever the prototype of the emoji, it will still have
   * `name`, `id`, `identifier` and `toString()`
   * @type {Emoji|ReactionEmoji}
   */


  _createClass(MessageReaction, [{
    key: 'remove',


    /**
     * Removes a user from this reaction.
     * @param {UserResolvable} [user=this.message.client.user] User to remove the reaction of
     * @returns {Promise<MessageReaction>}
     */
    value: function remove() {
      var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.message.client.user;

      var message = this.message;
      user = this.message.client.resolver.resolveUserID(user);
      if (!user) return Promise.reject(new Error('Couldn\'t resolve the user ID to remove from the reaction.'));
      return message.client.rest.methods.removeMessageReaction(message, this.emoji.identifier, user);
    }

    /**
     * Fetch all the users that gave this reaction. Resolves with a collection of users, mapped by their IDs.
     * @param {number} [limit=100] the maximum amount of users to fetch, defaults to 100
     * @returns {Promise<Collection<Snowflake, User>>}
     */

  }, {
    key: 'fetchUsers',
    value: function fetchUsers() {
      var _this = this;

      var limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

      var message = this.message;
      return message.client.rest.methods.getMessageReactionUsers(message, this.emoji.identifier, limit).then(function (users) {
        _this.users = new Collection();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = users[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var rawUser = _step.value;

            var user = _this.message.client.dataManager.newUser(rawUser);
            _this.users.set(user.id, user);
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

        _this.count = _this.users.size;
        return users;
      });
    }
  }, {
    key: 'emoji',
    get: function get() {
      if (this._emoji instanceof Emoji) return this._emoji;
      // Check to see if the emoji has become known to the client
      if (this._emoji.id) {
        var emojis = this.message.client.emojis;
        if (emojis.has(this._emoji.id)) {
          var emoji = emojis.get(this._emoji.id);
          this._emoji = emoji;
          return emoji;
        }
      }
      return this._emoji;
    }
  }]);

  return MessageReaction;
}();

module.exports = MessageReaction;