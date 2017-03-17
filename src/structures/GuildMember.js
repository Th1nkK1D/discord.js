'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextBasedChannel = require('./interface/TextBasedChannel');
var Role = require('./Role');
var Permissions = require('../util/Permissions');
var Collection = require('../util/Collection');
var Presence = require('./Presence').Presence;

/**
 * Represents a member of a guild on Discord
 * @implements {TextBasedChannel}
 */

var GuildMember = function () {
  function GuildMember(guild, data) {
    _classCallCheck(this, GuildMember);

    /**
     * The Client that instantiated this GuildMember
     * @name GuildMember#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: guild.client });

    /**
     * The guild that this member is part of
     * @type {Guild}
     */
    this.guild = guild;

    /**
     * The user that this guild member instance Represents
     * @type {User}
     */
    this.user = {};

    this._roles = [];
    if (data) this.setup(data);

    /**
     * The ID of the last message sent by the member in their guild, if one was sent.
     * @type {?Snowflake}
     */
    this.lastMessageID = null;

    /**
     * The Message object of the last message sent by the member in their guild, if one was sent.
     * @type {?Message}
     */
    this.lastMessage = null;
  }

  _createClass(GuildMember, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * Whether this member is deafened server-wide
       * @type {boolean}
       */
      this.serverDeaf = data.deaf;

      /**
       * Whether this member is muted server-wide
       * @type {boolean}
       */
      this.serverMute = data.mute;

      /**
       * Whether this member is self-muted
       * @type {boolean}
       */
      this.selfMute = data.self_mute;

      /**
       * Whether this member is self-deafened
       * @type {boolean}
       */
      this.selfDeaf = data.self_deaf;

      /**
       * The voice session ID of this member, if any
       * @type {?Snowflake}
       */
      this.voiceSessionID = data.session_id;

      /**
       * The voice channel ID of this member, if any
       * @type {?Snowflake}
       */
      this.voiceChannelID = data.channel_id;

      /**
       * Whether this member is speaking
       * @type {boolean}
       */
      this.speaking = false;

      /**
       * The nickname of this guild member, if they have one
       * @type {?string}
       */
      this.nickname = data.nick || null;

      /**
       * The timestamp the member joined the guild at
       * @type {number}
       */
      this.joinedTimestamp = new Date(data.joined_at).getTime();

      this.user = data.user;
      this._roles = data.roles;
    }

    /**
     * The time the member joined the guild
     * @type {Date}
     * @readonly
     */

  }, {
    key: 'permissionsIn',


    /**
     * Returns `channel.permissionsFor(guildMember)`. Returns permissions for a member in a guild channel,
     * taking into account roles and permission overwrites.
     * @param {ChannelResolvable} channel Guild channel to use as context
     * @returns {?Permissions}
     */
    value: function permissionsIn(channel) {
      channel = this.client.resolver.resolveChannel(channel);
      if (!channel || !channel.guild) throw new Error('Could not resolve channel to a guild channel.');
      return channel.permissionsFor(this);
    }

    /**
     * Checks if any of the member's roles have a permission.
     * @param {PermissionResolvable|PermissionResolvable[]} permission Permission(s) to check for
     * @param {boolean} [explicit=false] Whether to require the role to explicitly have the exact permission
     * **(deprecated)**
     * @param {boolean} [checkAdmin] Whether to allow the administrator permission to override
     * (takes priority over `explicit`)
     * @param {boolean} [checkOwner] Whether to allow being the guild's owner to override
     * (takes priority over `explicit`)
     * @returns {boolean}
     */

  }, {
    key: 'hasPermission',
    value: function hasPermission(permission) {
      var explicit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var checkAdmin = arguments[2];
      var checkOwner = arguments[3];

      if (typeof checkAdmin === 'undefined') checkAdmin = !explicit;
      if (typeof checkOwner === 'undefined') checkOwner = !explicit;
      if (checkOwner && this.user.id === this.guild.ownerID) return true;
      return this.roles.some(function (r) {
        return r.hasPermission(permission, undefined, checkAdmin);
      });
    }

    /**
     * Checks whether the roles of the member allows them to perform specific actions.
     * @param {PermissionResolvable[]} permissions The permissions to check for
     * @param {boolean} [explicit=false] Whether to require the member to explicitly have the exact permissions
     * @returns {boolean}
     * @deprecated
     */

  }, {
    key: 'hasPermissions',
    value: function hasPermissions(permissions) {
      var _this = this;

      var explicit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (!explicit && this.user.id === this.guild.ownerID) return true;
      return permissions.every(function (p) {
        return _this.hasPermission(p, explicit);
      });
    }

    /**
     * Checks whether the roles of the member allows them to perform specific actions, and lists any missing permissions.
     * @param {PermissionResolvable[]} permissions The permissions to check for
     * @param {boolean} [explicit=false] Whether to require the member to explicitly have the exact permissions
     * @returns {PermissionResolvable[]}
     */

  }, {
    key: 'missingPermissions',
    value: function missingPermissions(permissions) {
      var _this2 = this;

      var explicit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      return permissions.filter(function (p) {
        return !_this2.hasPermission(p, explicit);
      });
    }

    /**
     * The data for editing a guild member
     * @typedef {Object} GuildMemberEditData
     * @property {string} [nick] The nickname to set for the member
     * @property {Collection<Snowflake, Role>|Role[]|Snowflake[]} [roles] The roles or role IDs to apply
     * @property {boolean} [mute] Whether or not the member should be muted
     * @property {boolean} [deaf] Whether or not the member should be deafened
     * @property {ChannelResolvable} [channel] Channel to move member to (if they are connected to voice)
     */

    /**
     * Edit a guild member
     * @param {GuildMemberEditData} data The data to edit the member with
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'edit',
    value: function edit(data) {
      return this.client.rest.methods.updateGuildMember(this, data);
    }

    /**
     * Mute/unmute a user
     * @param {boolean} mute Whether or not the member should be muted
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'setMute',
    value: function setMute(mute) {
      return this.edit({ mute: mute });
    }

    /**
     * Deafen/undeafen a user
     * @param {boolean} deaf Whether or not the member should be deafened
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'setDeaf',
    value: function setDeaf(deaf) {
      return this.edit({ deaf: deaf });
    }

    /**
     * Moves the guild member to the given channel.
     * @param {ChannelResolvable} channel The channel to move the member to
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'setVoiceChannel',
    value: function setVoiceChannel(channel) {
      return this.edit({ channel: channel });
    }

    /**
     * Sets the roles applied to the member.
     * @param {Collection<Snowflake, Role>|Role[]|Snowflake[]} roles The roles or role IDs to apply
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'setRoles',
    value: function setRoles(roles) {
      return this.edit({ roles: roles });
    }

    /**
     * Adds a single role to the member.
     * @param {Role|Snowflake} role The role or ID of the role to add
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'addRole',
    value: function addRole(role) {
      if (!(role instanceof Role)) role = this.guild.roles.get(role);
      return this.client.rest.methods.addMemberRole(this, role);
    }

    /**
     * Adds multiple roles to the member.
     * @param {Collection<Snowflake, Role>|Role[]|Snowflake[]} roles The roles or role IDs to add
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'addRoles',
    value: function addRoles(roles) {
      var allRoles = void 0;
      if (roles instanceof Collection) {
        allRoles = this._roles.slice();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = roles.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var role = _step.value;
            allRoles.push(role.id);
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
      } else {
        allRoles = this._roles.concat(roles);
      }
      return this.edit({ roles: allRoles });
    }

    /**
     * Removes a single role from the member.
     * @param {Role|Snowflake} role The role or ID of the role to remove
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'removeRole',
    value: function removeRole(role) {
      if (!(role instanceof Role)) role = this.guild.roles.get(role);
      return this.client.rest.methods.removeMemberRole(this, role);
    }

    /**
     * Removes multiple roles from the member.
     * @param {Collection<Snowflake, Role>|Role[]|Snowflake[]} roles The roles or role IDs to remove
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'removeRoles',
    value: function removeRoles(roles) {
      var allRoles = this._roles.slice();
      if (roles instanceof Collection) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = roles.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var role = _step2.value;

            var index = allRoles.indexOf(role.id);
            if (index >= 0) allRoles.splice(index, 1);
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
      } else {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = roles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _role = _step3.value;

            var _index = allRoles.indexOf(_role instanceof Role ? _role.id : _role);
            if (_index >= 0) allRoles.splice(_index, 1);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
      return this.edit({ roles: allRoles });
    }

    /**
     * Set the nickname for the guild member
     * @param {string} nick The nickname for the guild member
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'setNickname',
    value: function setNickname(nick) {
      return this.edit({ nick: nick });
    }

    /**
     * Creates a DM channel between the client and the member
     * @returns {Promise<DMChannel>}
     */

  }, {
    key: 'createDM',
    value: function createDM() {
      return this.user.createDM();
    }

    /**
     * Deletes any DMs with this guild member
     * @returns {Promise<DMChannel>}
     */

  }, {
    key: 'deleteDM',
    value: function deleteDM() {
      return this.user.deleteDM();
    }

    /**
     * Kick this member from the guild
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'kick',
    value: function kick() {
      return this.client.rest.methods.kickGuildMember(this.guild, this);
    }

    /**
     * Ban this guild member
     * @param {number} [deleteDays=0] The amount of days worth of messages from this member that should
     * also be deleted. Between `0` and `7`.
     * @returns {Promise<GuildMember>}
     * @example
     * // ban a guild member
     * guildMember.ban(7);
     */

  }, {
    key: 'ban',
    value: function ban() {
      var deleteDays = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      return this.client.rest.methods.banGuildMember(this.guild, this, deleteDays);
    }

    /**
     * When concatenated with a string, this automatically concatenates the user's mention instead of the Member object.
     * @returns {string}
     * @example
     * // logs: Hello from <@123456789>!
     * console.log(`Hello from ${member}!`);
     */

  }, {
    key: 'toString',
    value: function toString() {
      return '<@' + (this.nickname ? '!' : '') + this.user.id + '>';
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
    key: 'joinedAt',
    get: function get() {
      return new Date(this.joinedTimestamp);
    }

    /**
     * The presence of this guild member
     * @type {Presence}
     * @readonly
     */

  }, {
    key: 'presence',
    get: function get() {
      return this.frozenPresence || this.guild.presences.get(this.id) || new Presence();
    }

    /**
     * A list of roles that are applied to this GuildMember, mapped by the role ID.
     * @type {Collection<Snowflake, Role>}
     * @readonly
     */

  }, {
    key: 'roles',
    get: function get() {
      var list = new Collection();
      var everyoneRole = this.guild.roles.get(this.guild.id);

      if (everyoneRole) list.set(everyoneRole.id, everyoneRole);

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this._roles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var roleID = _step4.value;

          var role = this.guild.roles.get(roleID);
          if (role) list.set(role.id, role);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return list;
    }

    /**
     * The role of the member with the highest position.
     * @type {Role}
     * @readonly
     */

  }, {
    key: 'highestRole',
    get: function get() {
      return this.roles.reduce(function (prev, role) {
        return !prev || role.comparePositionTo(prev) > 0 ? role : prev;
      });
    }

    /**
     * The role of the member used to set their color.
     * @type {?Role}
     * @readonly
     */

  }, {
    key: 'colorRole',
    get: function get() {
      var coloredRoles = this.roles.filter(function (role) {
        return role.color;
      });
      if (!coloredRoles.size) return null;
      return coloredRoles.reduce(function (prev, role) {
        return !prev || role.comparePositionTo(prev) > 0 ? role : prev;
      });
    }

    /**
     * The displayed color of the member in base 10.
     * @type {number}
     * @readonly
     */

  }, {
    key: 'displayColor',
    get: function get() {
      var role = this.colorRole;
      return role && role.color || 0;
    }

    /**
     * The displayed color of the member in hexadecimal.
     * @type {string}
     * @readonly
     */

  }, {
    key: 'displayHexColor',
    get: function get() {
      var role = this.colorRole;
      return role && role.hexColor || '#000000';
    }

    /**
     * The role of the member used to hoist them in a separate category in the users list.
     * @type {?Role}
     * @readonly
     */

  }, {
    key: 'hoistRole',
    get: function get() {
      var hoistedRoles = this.roles.filter(function (role) {
        return role.hoist;
      });
      if (!hoistedRoles.size) return null;
      return hoistedRoles.reduce(function (prev, role) {
        return !prev || role.comparePositionTo(prev) > 0 ? role : prev;
      });
    }

    /**
     * Whether this member is muted in any way
     * @type {boolean}
     * @readonly
     */

  }, {
    key: 'mute',
    get: function get() {
      return this.selfMute || this.serverMute;
    }

    /**
     * Whether this member is deafened in any way
     * @type {boolean}
     * @readonly
     */

  }, {
    key: 'deaf',
    get: function get() {
      return this.selfDeaf || this.serverDeaf;
    }

    /**
     * The voice channel this member is in, if any
     * @type {?VoiceChannel}
     * @readonly
     */

  }, {
    key: 'voiceChannel',
    get: function get() {
      return this.guild.channels.get(this.voiceChannelID);
    }

    /**
     * The ID of this user
     * @type {Snowflake}
     * @readonly
     */

  }, {
    key: 'id',
    get: function get() {
      return this.user.id;
    }

    /**
     * The nickname of the member, or their username if they don't have one
     * @type {string}
     * @readonly
     */

  }, {
    key: 'displayName',
    get: function get() {
      return this.nickname || this.user.username;
    }

    /**
     * The overall set of permissions for the guild member, taking only roles into account
     * @type {Permissions}
     * @readonly
     */

  }, {
    key: 'permissions',
    get: function get() {
      if (this.user.id === this.guild.ownerID) return new Permissions(this, Permissions.ALL);

      var permissions = 0;
      var roles = this.roles;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = roles.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var role = _step5.value;
          permissions |= role.permissions;
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return new Permissions(this, permissions);
    }

    /**
     * Whether the member is kickable by the client user.
     * @type {boolean}
     * @readonly
     */

  }, {
    key: 'kickable',
    get: function get() {
      if (this.user.id === this.guild.ownerID) return false;
      if (this.user.id === this.client.user.id) return false;
      var clientMember = this.guild.member(this.client.user);
      if (!clientMember.hasPermission(Permissions.FLAGS.KICK_MEMBERS)) return false;
      return clientMember.highestRole.comparePositionTo(this.highestRole) > 0;
    }

    /**
     * Whether the member is bannable by the client user.
     * @type {boolean}
     * @readonly
     */

  }, {
    key: 'bannable',
    get: function get() {
      if (this.user.id === this.guild.ownerID) return false;
      if (this.user.id === this.client.user.id) return false;
      var clientMember = this.guild.member(this.client.user);
      if (!clientMember.hasPermission(Permissions.FLAGS.BAN_MEMBERS)) return false;
      return clientMember.highestRole.comparePositionTo(this.highestRole) > 0;
    }
  }]);

  return GuildMember;
}();

TextBasedChannel.applyToClass(GuildMember);

module.exports = GuildMember;