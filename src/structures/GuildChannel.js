'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Channel = require('./Channel');
var Role = require('./Role');
var PermissionOverwrites = require('./PermissionOverwrites');
var Permissions = require('../util/Permissions');
var Collection = require('../util/Collection');

/**
 * Represents a guild channel (i.e. text channels and voice channels)
 * @extends {Channel}
 */

var GuildChannel = function (_Channel) {
  _inherits(GuildChannel, _Channel);

  function GuildChannel(guild, data) {
    _classCallCheck(this, GuildChannel);

    /**
     * The guild the channel is in
     * @type {Guild}
     */
    var _this = _possibleConstructorReturn(this, (GuildChannel.__proto__ || Object.getPrototypeOf(GuildChannel)).call(this, guild.client, data));

    _this.guild = guild;
    return _this;
  }

  _createClass(GuildChannel, [{
    key: 'setup',
    value: function setup(data) {
      _get(GuildChannel.prototype.__proto__ || Object.getPrototypeOf(GuildChannel.prototype), 'setup', this).call(this, data);

      /**
       * The name of the guild channel
       * @type {string}
       */
      this.name = data.name;

      /**
       * The position of the channel in the list.
       * @type {number}
       */
      this.position = data.position;

      /**
       * A map of permission overwrites in this channel for roles and users.
       * @type {Collection<Snowflake, PermissionOverwrites>}
       */
      this.permissionOverwrites = new Collection();
      if (data.permission_overwrites) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = data.permission_overwrites[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var overwrite = _step.value;

            this.permissionOverwrites.set(overwrite.id, new PermissionOverwrites(this, overwrite));
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
    }

    /**
     * Gets the overall set of permissions for a user in this channel, taking into account roles and permission
     * overwrites.
     * @param {GuildMemberResolvable} member The user that you want to obtain the overall permissions for
     * @returns {?Permissions}
     */

  }, {
    key: 'permissionsFor',
    value: function permissionsFor(member) {
      member = this.client.resolver.resolveGuildMember(this.guild, member);
      if (!member) return null;
      if (member.id === this.guild.ownerID) return new Permissions(member, Permissions.ALL);

      var permissions = 0;

      var roles = member.roles;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = roles.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var role = _step2.value;
          permissions |= role.permissions;
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

      var overwrites = this.overwritesFor(member, true, roles);

      if (overwrites.everyone) {
        permissions &= ~overwrites.everyone.deny;
        permissions |= overwrites.everyone.allow;
      }

      var allow = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = overwrites.roles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var overwrite = _step3.value;

          permissions &= ~overwrite.deny;
          allow |= overwrite.allow;
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

      permissions |= allow;

      if (overwrites.member) {
        permissions &= ~overwrites.member.deny;
        permissions |= overwrites.member.allow;
      }

      var admin = Boolean(permissions & Permissions.FLAGS.ADMINISTRATOR);
      if (admin) permissions = Permissions.ALL;

      return new Permissions(member, permissions);
    }
  }, {
    key: 'overwritesFor',
    value: function overwritesFor(member) {
      var verified = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var roles = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if (!verified) member = this.client.resolver.resolveGuildMember(this.guild, member);
      if (!member) return [];

      roles = roles || member.roles;
      var roleOverwrites = [];
      var memberOverwrites = void 0;
      var everyoneOverwrites = void 0;

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.permissionOverwrites.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var overwrite = _step4.value;

          if (overwrite.id === this.guild.id) {
            everyoneOverwrites = overwrite;
          } else if (roles.has(overwrite.id)) {
            roleOverwrites.push(overwrite);
          } else if (overwrite.id === member.id) {
            memberOverwrites = overwrite;
          }
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

      return {
        everyone: everyoneOverwrites,
        roles: roleOverwrites,
        member: memberOverwrites
      };
    }

    /**
     * An object mapping permission flags to `true` (enabled) or `false` (disabled)
     * ```js
     * {
     *  'SEND_MESSAGES': true,
     *  'ATTACH_FILES': false,
     * }
     * ```
     * @typedef {Object} PermissionOverwriteOptions
     */

    /**
     * Overwrites the permissions for a user or role in this channel.
     * @param {RoleResolvable|UserResolvable} userOrRole The user or role to update
     * @param {PermissionOverwriteOptions} options The configuration for the update
     * @returns {Promise}
     * @example
     * // overwrite permissions for a message author
     * message.channel.overwritePermissions(message.author, {
     *  SEND_MESSAGES: false
     * })
     * .then(() => console.log('Done!'))
     * .catch(console.error);
     */

  }, {
    key: 'overwritePermissions',
    value: function overwritePermissions(userOrRole, options) {
      var payload = {
        allow: 0,
        deny: 0
      };

      if (userOrRole instanceof Role) {
        payload.type = 'role';
      } else if (this.guild.roles.has(userOrRole)) {
        userOrRole = this.guild.roles.get(userOrRole);
        payload.type = 'role';
      } else {
        userOrRole = this.client.resolver.resolveUser(userOrRole);
        payload.type = 'member';
        if (!userOrRole) return Promise.reject(new TypeError('Supplied parameter was neither a User nor a Role.'));
      }

      payload.id = userOrRole.id;

      var prevOverwrite = this.permissionOverwrites.get(userOrRole.id);

      if (prevOverwrite) {
        payload.allow = prevOverwrite.allow;
        payload.deny = prevOverwrite.deny;
      }

      for (var perm in options) {
        if (options[perm] === true) {
          payload.allow |= Permissions.FLAGS[perm] || 0;
          payload.deny &= ~(Permissions.FLAGS[perm] || 0);
        } else if (options[perm] === false) {
          payload.allow &= ~(Permissions.FLAGS[perm] || 0);
          payload.deny |= Permissions.FLAGS[perm] || 0;
        } else if (options[perm] === null) {
          payload.allow &= ~(Permissions.FLAGS[perm] || 0);
          payload.deny &= ~(Permissions.FLAGS[perm] || 0);
        }
      }

      return this.client.rest.methods.setChannelOverwrite(this, payload);
    }

    /**
     * The data for a guild channel
     * @typedef {Object} ChannelData
     * @property {string} [name] The name of the channel
     * @property {number} [position] The position of the channel
     * @property {string} [topic] The topic of the text channel
     * @property {number} [bitrate] The bitrate of the voice channel
     * @property {number} [userLimit] The user limit of the channel
     */

    /**
     * Edits the channel
     * @param {ChannelData} data The new data for the channel
     * @returns {Promise<GuildChannel>}
     * @example
     * // edit a channel
     * channel.edit({name: 'new-channel'})
     *  .then(c => console.log(`Edited channel ${c}`))
     *  .catch(console.error);
     */

  }, {
    key: 'edit',
    value: function edit(data) {
      return this.client.rest.methods.updateChannel(this, data);
    }

    /**
     * Set a new name for the guild channel
     * @param {string} name The new name for the guild channel
     * @returns {Promise<GuildChannel>}
     * @example
     * // set a new channel name
     * channel.setName('not_general')
     *  .then(newChannel => console.log(`Channel's new name is ${newChannel.name}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setName',
    value: function setName(name) {
      return this.edit({ name: name });
    }

    /**
     * Set a new position for the guild channel
     * @param {number} position The new position for the guild channel
     * @returns {Promise<GuildChannel>}
     * @example
     * // set a new channel position
     * channel.setPosition(2)
     *  .then(newChannel => console.log(`Channel's new position is ${newChannel.position}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setPosition',
    value: function setPosition(position) {
      return this.client.rest.methods.updateChannel(this, { position: position });
    }

    /**
     * Set a new topic for the guild channel
     * @param {string} topic The new topic for the guild channel
     * @returns {Promise<GuildChannel>}
     * @example
     * // set a new channel topic
     * channel.setTopic('needs more rate limiting')
     *  .then(newChannel => console.log(`Channel's new topic is ${newChannel.topic}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setTopic',
    value: function setTopic(topic) {
      return this.client.rest.methods.updateChannel(this, { topic: topic });
    }

    /**
     * Options given when creating a guild channel invite
     * @typedef {Object} InviteOptions
      */

    /**
     * Create an invite to this guild channel
     * @param {InviteOptions} [options={}] Options for the invite
     * @param {boolean} [options.temporary=false] Whether members that joined via the invite should be automatically
     * kicked after 24 hours if they have not yet received a role
     * @param {number} [options.maxAge=86400] How long the invite should last (in seconds, 0 for forever)
     * @param {number} [options.maxUses=0] Maximum number of uses
     * @returns {Promise<Invite>}
     */

  }, {
    key: 'createInvite',
    value: function createInvite() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.client.rest.methods.createChannelInvite(this, options);
    }

    /**
     * Clone this channel
     * @param {string} [name=this.name] Optional name for the new channel, otherwise it has the name of this channel
     * @param {boolean} [withPermissions=true] Whether to clone the channel with this channel's permission overwrites
     * @param {boolean} [withTopic=true] Whether to clone the channel with this channel's topic
     * @returns {Promise<GuildChannel>}
     */

  }, {
    key: 'clone',
    value: function clone() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.name;

      var _this2 = this;

      var withPermissions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var withTopic = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      return this.guild.createChannel(name, this.type, withPermissions ? this.permissionOverwrites : []).then(function (channel) {
        return withTopic ? channel.setTopic(_this2.topic) : channel;
      });
    }

    /**
     * Checks if this channel has the same type, topic, position, name, overwrites and ID as another channel.
     * In most cases, a simple `channel.id === channel2.id` will do, and is much faster too.
     * @param {GuildChannel} channel Channel to compare with
     * @returns {boolean}
     */

  }, {
    key: 'equals',
    value: function equals(channel) {
      var equal = channel && this.id === channel.id && this.type === channel.type && this.topic === channel.topic && this.position === channel.position && this.name === channel.name;

      if (equal) {
        if (this.permissionOverwrites && channel.permissionOverwrites) {
          equal = this.permissionOverwrites.equals(channel.permissionOverwrites);
        } else {
          equal = !this.permissionOverwrites && !channel.permissionOverwrites;
        }
      }

      return equal;
    }

    /**
     * Whether the channel is deletable by the client user.
     * @type {boolean}
     * @readonly
     */

  }, {
    key: 'toString',


    /**
     * When concatenated with a string, this automatically returns the channel's mention instead of the Channel object.
     * @returns {string}
     * @example
     * // Outputs: Hello from #general
     * console.log(`Hello from ${channel}`);
     * @example
     * // Outputs: Hello from #general
     * console.log('Hello from ' + channel);
     */
    value: function toString() {
      return '<#' + this.id + '>';
    }
  }, {
    key: 'deletable',
    get: function get() {
      return this.id !== this.guild.id && this.permissionsFor(this.client.user).hasPermission(Permissions.FLAGS.MANAGE_CHANNELS);
    }
  }]);

  return GuildChannel;
}(Channel);

module.exports = GuildChannel;