'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var User = require('./User');
var Collection = require('../util/Collection');

/**
 * Represents the logged in client's Discord user
 * @extends {User}
 */

var ClientUser = function (_User) {
  _inherits(ClientUser, _User);

  function ClientUser() {
    _classCallCheck(this, ClientUser);

    return _possibleConstructorReturn(this, (ClientUser.__proto__ || Object.getPrototypeOf(ClientUser)).apply(this, arguments));
  }

  _createClass(ClientUser, [{
    key: 'setup',
    value: function setup(data) {
      _get(ClientUser.prototype.__proto__ || Object.getPrototypeOf(ClientUser.prototype), 'setup', this).call(this, data);

      /**
       * Whether or not this account has been verified
       * @type {boolean}
       */
      this.verified = data.verified;

      /**
       * The email of this account
       * @type {string}
       */
      this.email = data.email;
      this.localPresence = {};
      this._typing = new Map();

      /**
       * A Collection of friends for the logged in user.
       * <warn>This is only filled when using a user account.</warn>
       * @type {Collection<Snowflake, User>}
       */
      this.friends = new Collection();

      /**
       * A Collection of blocked users for the logged in user.
       * <warn>This is only filled when using a user account.</warn>
       * @type {Collection<Snowflake, User>}
       */
      this.blocked = new Collection();

      /**
       * A Collection of notes for the logged in user.
       * <warn>This is only filled when using a user account.</warn>
       * @type {Collection<Snowflake, string>}
       */
      this.notes = new Collection();

      /**
       * Discord client settings, such as guild positions
       * <warn>This is only filled when using a user account.</warn>
       * @type {Object}
       */
      this.settings = {};

      /**
       * If the user has discord premium (nitro)
       * <warn>This is only filled when using a user account.</warn>
       * @type {?boolean}
       */
      this.premium = typeof data.premium === 'boolean' ? data.premium : null;

      /**
       * If the user has MFA enabled on their account
       * <warn>This is only filled when using a user account.</warn>
       * @type {?boolean}
       */
      this.mfaEnabled = typeof data.mfa_enabled === 'boolean' ? data.mfa_enabled : null;

      /**
       * If the user has ever used a mobile device on discord
       * <warn>This is only filled when using a user account.</warn>
       * @type {?boolean}
       */
      this.mobile = typeof data.mobile === 'boolean' ? data.mobile : null;
    }
  }, {
    key: 'edit',
    value: function edit(data) {
      return this.client.rest.methods.updateCurrentUser(data);
    }

    /**
     * Set the username of the logged in Client.
     * <info>Changing usernames in Discord is heavily rate limited, with only 2 requests
     * every hour. Use this sparingly!</info>
     * @param {string} username The new username
     * @param {string} [password] Current password (only for user accounts)
     * @returns {Promise<ClientUser>}
     * @example
     * // set username
     * client.user.setUsername('discordjs')
     *  .then(user => console.log(`My new username is ${user.username}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setUsername',
    value: function setUsername(username, password) {
      return this.client.rest.methods.updateCurrentUser({ username: username }, password);
    }

    /**
     * Changes the email for the client user's account.
     * <warn>This is only available when using a user account.</warn>
     * @param {string} email New email to change to
     * @param {string} password Current password
     * @returns {Promise<ClientUser>}
     * @example
     * // set email
     * client.user.setEmail('bob@gmail.com', 'some amazing password 123')
     *  .then(user => console.log(`My new email is ${user.email}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setEmail',
    value: function setEmail(email, password) {
      return this.client.rest.methods.updateCurrentUser({ email: email }, password);
    }

    /**
     * Changes the password for the client user's account.
     * <warn>This is only available when using a user account.</warn>
     * @param {string} newPassword New password to change to
     * @param {string} oldPassword Current password
     * @returns {Promise<ClientUser>}
     * @example
     * // set password
     * client.user.setPassword('some new amazing password 456', 'some amazing password 123')
     *  .then(user => console.log('New password set!'))
     *  .catch(console.error);
     */

  }, {
    key: 'setPassword',
    value: function setPassword(newPassword, oldPassword) {
      return this.client.rest.methods.updateCurrentUser({ password: newPassword }, oldPassword);
    }

    /**
     * Set the avatar of the logged in Client.
     * @param {BufferResolvable|Base64Resolvable} avatar The new avatar
     * @returns {Promise<ClientUser>}
     * @example
     * // set avatar
     * client.user.setAvatar('./avatar.png')
     *  .then(user => console.log(`New avatar set!`))
     *  .catch(console.error);
     */

  }, {
    key: 'setAvatar',
    value: function setAvatar(avatar) {
      var _this2 = this;

      if (typeof avatar === 'string' && avatar.startsWith('data:')) {
        return this.client.rest.methods.updateCurrentUser({ avatar: avatar });
      } else {
        return this.client.resolver.resolveBuffer(avatar).then(function (data) {
          return _this2.client.rest.methods.updateCurrentUser({ avatar: data });
        });
      }
    }

    /**
     * Data resembling a raw Discord presence
     * @typedef {Object} PresenceData
     * @property {PresenceStatus} [status] Status of the user
     * @property {boolean} [afk] Whether the user is AFK
     * @property {Object} [game] Game the user is playing
     * @property {string} [game.name] Name of the game
     * @property {string} [game.url] Twitch stream URL
     */

    /**
     * Sets the full presence of the client user.
     * @param {PresenceData} data Data for the presence
     * @returns {Promise<ClientUser>}
     */

  }, {
    key: 'setPresence',
    value: function setPresence(data) {
      var _this3 = this;

      // {"op":3,"d":{"status":"dnd","since":0,"game":null,"afk":false}}
      return new Promise(function (resolve) {
        var status = _this3.localPresence.status || _this3.presence.status;
        var game = _this3.localPresence.game;
        var afk = _this3.localPresence.afk || _this3.presence.afk;

        if (!game && _this3.presence.game) {
          game = {
            name: _this3.presence.game.name,
            type: _this3.presence.game.type,
            url: _this3.presence.game.url
          };
        }

        if (data.status) {
          if (typeof data.status !== 'string') throw new TypeError('Status must be a string');
          status = data.status;
        }

        if (data.game) {
          game = data.game;
          if (game.url) game.type = 1;
        }

        if (data.game === null) game = null;

        if (typeof data.afk !== 'undefined') afk = data.afk;
        afk = Boolean(afk);

        _this3.localPresence = { status: status, game: game, afk: afk };
        _this3.localPresence.since = 0;
        _this3.localPresence.game = _this3.localPresence.game || null;

        _this3.client.ws.send({
          op: 3,
          d: _this3.localPresence
        });

        _this3.client._setPresence(_this3.id, _this3.localPresence);

        resolve(_this3);
      });
    }

    /**
     * A user's status. Must be one of:
     * - `online`
     * - `idle`
     * - `invisible`
     * - `dnd` (do not disturb)
     * @typedef {string} PresenceStatus
     */

    /**
     * Sets the status of the client user.
     * @param {PresenceStatus} status Status to change to
     * @returns {Promise<ClientUser>}
     */

  }, {
    key: 'setStatus',
    value: function setStatus(status) {
      return this.setPresence({ status: status });
    }

    /**
     * Sets the game the client user is playing.
     * @param {?string} game Game being played
     * @param {string} [streamingURL] Twitch stream URL
     * @returns {Promise<ClientUser>}
     */

  }, {
    key: 'setGame',
    value: function setGame(game, streamingURL) {
      if (game === null) return this.setPresence({ game: game });
      return this.setPresence({ game: {
          name: game,
          url: streamingURL
        } });
    }

    /**
     * Sets/removes the AFK flag for the client user.
     * @param {boolean} afk Whether or not the user is AFK
     * @returns {Promise<ClientUser>}
     */

  }, {
    key: 'setAFK',
    value: function setAFK(afk) {
      return this.setPresence({ afk: afk });
    }

    /**
     * Fetches messages that mentioned the client's user
     * @param {Object} [options] Options for the fetch
     * @param {number} [options.limit=25] Maximum number of mentions to retrieve
     * @param {boolean} [options.roles=true] Whether to include role mentions
     * @param {boolean} [options.everyone=true] Whether to include everyone/here mentions
     * @param {Guild|Snowflake} [options.guild] Limit the search to a specific guild
     * @returns {Promise<Message[]>}
     */

  }, {
    key: 'fetchMentions',
    value: function fetchMentions() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { limit: 25, roles: true, everyone: true, guild: null };

      return this.client.rest.methods.fetchMentions(options);
    }

    /**
     * Send a friend request
     * <warn>This is only available when using a user account.</warn>
     * @param {UserResolvable} user The user to send the friend request to.
     * @returns {Promise<User>} The user the friend request was sent to.
     */

  }, {
    key: 'addFriend',
    value: function addFriend(user) {
      user = this.client.resolver.resolveUser(user);
      return this.client.rest.methods.addFriend(user);
    }

    /**
     * Remove a friend
     * <warn>This is only available when using a user account.</warn>
     * @param {UserResolvable} user The user to remove from your friends
     * @returns {Promise<User>} The user that was removed
     */

  }, {
    key: 'removeFriend',
    value: function removeFriend(user) {
      user = this.client.resolver.resolveUser(user);
      return this.client.rest.methods.removeFriend(user);
    }

    /**
     * Creates a guild
     * <warn>This is only available when using a user account.</warn>
     * @param {string} name The name of the guild
     * @param {string} region The region for the server
     * @param {BufferResolvable|Base64Resolvable} [icon=null] The icon for the guild
     * @returns {Promise<Guild>} The guild that was created
     */

  }, {
    key: 'createGuild',
    value: function createGuild(name, region) {
      var _this4 = this;

      var icon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (!icon) return this.client.rest.methods.createGuild({ name: name, icon: icon, region: region });
      if (typeof icon === 'string' && icon.startsWith('data:')) {
        return this.client.rest.methods.createGuild({ name: name, icon: icon, region: region });
      } else {
        return this.client.resolver.resolveBuffer(icon).then(function (data) {
          return _this4.client.rest.methods.createGuild({ name: name, icon: data, region: region });
        });
      }
    }

    /**
     * An object containing either a user or access token, and an optional nickname
     * @typedef {Object} GroupDMRecipientOptions
     * @property {UserResolvable|Snowflake} [user] User to add to the group DM
     * (only available if a user is creating the DM)
     * @property {string} [accessToken] Access token to use to add a user to the group DM
     * (only available if a bot is creating the DM)
     * @property {string} [nick] Permanent nickname (only available if a bot is creating the DM)
     */

    /**
     * Creates a group DM
     * @param {GroupDMRecipientOptions[]} recipients The recipients
     * @returns {Promise<GroupDMChannel>}
     */

  }, {
    key: 'createGroupDM',
    value: function createGroupDM(recipients) {
      var _this5 = this;

      return this.client.rest.methods.createGroupDM({
        recipients: recipients.map(function (u) {
          return _this5.client.resolver.resolveUserID(u.user);
        }),
        accessTokens: recipients.map(function (u) {
          return u.accessToken;
        }),
        nicks: recipients.map(function (u) {
          return u.nick;
        })
      });
    }

    /**
     * Accepts an invite to join a guild
     * <warn>This is only available when using a user account.</warn>
     * @param {Invite|string} invite Invite or code to accept
     * @returns {Promise<Guild>} Joined guild
     */

  }, {
    key: 'acceptInvite',
    value: function acceptInvite(invite) {
      return this.client.rest.methods.acceptInvite(invite);
    }
  }]);

  return ClientUser;
}(User);

module.exports = ClientUser;