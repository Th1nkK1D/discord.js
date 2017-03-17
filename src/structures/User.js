'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextBasedChannel = require('./interface/TextBasedChannel');
var Constants = require('../util/Constants');
var Presence = require('./Presence').Presence;
var Snowflake = require('../util/Snowflake');

/**
 * Represents a user on Discord.
 * @implements {TextBasedChannel}
 */

var User = function () {
  function User(client, data) {
    _classCallCheck(this, User);

    /**
     * The Client that created the instance of the the User.
     * @name User#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    if (data) this.setup(data);
  }

  _createClass(User, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The ID of the user
       * @type {Snowflake}
       */
      this.id = data.id;

      /**
       * The username of the user
       * @type {string}
       */
      this.username = data.username;

      /**
       * A discriminator based on username for the user
       * @type {string}
       */
      this.discriminator = data.discriminator;

      /**
       * The ID of the user's avatar
       * @type {string}
       */
      this.avatar = data.avatar;

      /**
       * Whether or not the user is a bot.
       * @type {boolean}
       */
      this.bot = Boolean(data.bot);

      /**
       * The ID of the last message sent by the user, if one was sent.
       * @type {?Snowflake}
       */
      this.lastMessageID = null;

      /**
       * The Message object of the last message sent by the user, if one was sent.
       * @type {?Message}
       */
      this.lastMessage = null;
    }
  }, {
    key: 'patch',
    value: function patch(data) {
      var _arr = ['id', 'username', 'discriminator', 'avatar', 'bot'];

      for (var _i = 0; _i < _arr.length; _i++) {
        var prop = _arr[_i];
        if (typeof data[prop] !== 'undefined') this[prop] = data[prop];
      }
      if (data.token) this.client.token = data.token;
    }

    /**
     * The timestamp the user was created at
     * @type {number}
     * @readonly
     */

  }, {
    key: 'typingIn',


    /**
     * Check whether the user is typing in a channel.
     * @param {ChannelResolvable} channel The channel to check in
     * @returns {boolean}
     */
    value: function typingIn(channel) {
      channel = this.client.resolver.resolveChannel(channel);
      return channel._typing.has(this.id);
    }

    /**
     * Get the time that the user started typing.
     * @param {ChannelResolvable} channel The channel to get the time in
     * @returns {?Date}
     */

  }, {
    key: 'typingSinceIn',
    value: function typingSinceIn(channel) {
      channel = this.client.resolver.resolveChannel(channel);
      return channel._typing.has(this.id) ? new Date(channel._typing.get(this.id).since) : null;
    }

    /**
     * Get the amount of time the user has been typing in a channel for (in milliseconds), or -1 if they're not typing.
     * @param {ChannelResolvable} channel The channel to get the time in
     * @returns {number}
     */

  }, {
    key: 'typingDurationIn',
    value: function typingDurationIn(channel) {
      channel = this.client.resolver.resolveChannel(channel);
      return channel._typing.has(this.id) ? channel._typing.get(this.id).elapsedTime : -1;
    }

    /**
     * The DM between the client's user and this user
     * @type {?DMChannel}
     */

  }, {
    key: 'createDM',


    /**
     * Creates a DM channel between the client and the user
     * @returns {Promise<DMChannel>}
     */
    value: function createDM() {
      return this.client.rest.methods.createDM(this);
    }

    /**
     * Deletes a DM channel (if one exists) between the client and the user. Resolves with the channel if successful.
     * @returns {Promise<DMChannel>}
     */

  }, {
    key: 'deleteDM',
    value: function deleteDM() {
      return this.client.rest.methods.deleteChannel(this);
    }

    /**
     * Sends a friend request to the user
     * <warn>This is only available when using a user account.</warn>
     * @returns {Promise<User>}
     */

  }, {
    key: 'addFriend',
    value: function addFriend() {
      return this.client.rest.methods.addFriend(this);
    }

    /**
     * Removes the user from your friends
     * <warn>This is only available when using a user account.</warn>
     * @returns {Promise<User>}
     */

  }, {
    key: 'removeFriend',
    value: function removeFriend() {
      return this.client.rest.methods.removeFriend(this);
    }

    /**
     * Blocks the user
     * <warn>This is only available when using a user account.</warn>
     * @returns {Promise<User>}
     */

  }, {
    key: 'block',
    value: function block() {
      return this.client.rest.methods.blockUser(this);
    }

    /**
     * Unblocks the user
     * <warn>This is only available when using a user account.</warn>
     * @returns {Promise<User>}
     */

  }, {
    key: 'unblock',
    value: function unblock() {
      return this.client.rest.methods.unblockUser(this);
    }

    /**
     * Get the profile of the user
     * <warn>This is only available when using a user account.</warn>
     * @returns {Promise<UserProfile>}
     */

  }, {
    key: 'fetchProfile',
    value: function fetchProfile() {
      return this.client.rest.methods.fetchUserProfile(this);
    }

    /**
     * Sets a note for the user
     * <warn>This is only available when using a user account.</warn>
     * @param {string} note The note to set for the user
     * @returns {Promise<User>}
     */

  }, {
    key: 'setNote',
    value: function setNote(note) {
      return this.client.rest.methods.setNote(this, note);
    }

    /**
     * Checks if the user is equal to another. It compares ID, username, discriminator, avatar, and bot flags.
     * It is recommended to compare equality by using `user.id === user2.id` unless you want to compare all properties.
     * @param {User} user User to compare with
     * @returns {boolean}
     */

  }, {
    key: 'equals',
    value: function equals(user) {
      var equal = user && this.id === user.id && this.username === user.username && this.discriminator === user.discriminator && this.avatar === user.avatar && this.bot === Boolean(user.bot);

      return equal;
    }

    /**
     * When concatenated with a string, this automatically concatenates the user's mention instead of the User object.
     * @returns {string}
     * @example
     * // logs: Hello from <@123456789>!
     * console.log(`Hello from ${user}!`);
     */

  }, {
    key: 'toString',
    value: function toString() {
      return '<@' + this.id + '>';
    }

    // These are here only for documentation purposes - they are implemented by TextBasedChannel
    /* eslint-disable no-empty-function */

  }, {
    key: 'send',
    value: function send() {}
  }, {
    key: 'sendMessage',
    value: function sendMessage() {}
  }, {
    key: 'sendEmbed',
    value: function sendEmbed() {}
  }, {
    key: 'sendFile',
    value: function sendFile() {}
  }, {
    key: 'sendCode',
    value: function sendCode() {}
  }, {
    key: 'createdTimestamp',
    get: function get() {
      return Snowflake.deconstruct(this.id).timestamp;
    }

    /**
     * The time the user was created
     * @type {Date}
     * @readonly
     */

  }, {
    key: 'createdAt',
    get: function get() {
      return new Date(this.createdTimestamp);
    }

    /**
     * The presence of this user
     * @type {Presence}
     * @readonly
     */

  }, {
    key: 'presence',
    get: function get() {
      if (this.client.presences.has(this.id)) return this.client.presences.get(this.id);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.client.guilds.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var guild = _step.value;

          if (guild.presences.has(this.id)) return guild.presences.get(this.id);
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

      return new Presence();
    }

    /**
     * A link to the user's avatar (if they have one, otherwise null)
     * @type {?string}
     * @readonly
     */

  }, {
    key: 'avatarURL',
    get: function get() {
      if (!this.avatar) return null;
      return Constants.Endpoints.avatar(this.id, this.avatar);
    }

    /**
     * A link to the user's default avatar
     * @type {string}
     * @readonly
     */

  }, {
    key: 'defaultAvatarURL',
    get: function get() {
      var avatars = Object.keys(Constants.DefaultAvatars);
      var avatar = avatars[this.discriminator % avatars.length];
      return Constants.Endpoints.assets(Constants.DefaultAvatars[avatar] + '.png');
    }

    /**
     * A link to the user's avatar if they have one. Otherwise a link to their default avatar will be returned
     * @type {string}
     * @readonly
     */

  }, {
    key: 'displayAvatarURL',
    get: function get() {
      return this.avatarURL || this.defaultAvatarURL;
    }

    /**
     * The note that is set for the user
     * <warn>This is only available when using a user account.</warn>
     * @type {?string}
     * @readonly
     */

  }, {
    key: 'note',
    get: function get() {
      return this.client.user.notes.get(this.id) || null;
    }
  }, {
    key: 'dmChannel',
    get: function get() {
      var _this = this;

      return this.client.channels.filter(function (c) {
        return c.type === 'dm';
      }).find(function (c) {
        return c.recipient.id === _this.id;
      });
    }
  }]);

  return User;
}();

TextBasedChannel.applyToClass(User);

module.exports = User;