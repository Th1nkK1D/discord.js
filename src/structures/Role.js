'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Snowflake = require('../util/Snowflake');
var Permissions = require('../util/Permissions');

/**
 * Represents a role on Discord
 */

var Role = function () {
  function Role(guild, data) {
    _classCallCheck(this, Role);

    /**
     * The client that instantiated the role
     * @name Role#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: guild.client });

    /**
     * The guild that the role belongs to
     * @type {Guild}
     */
    this.guild = guild;

    if (data) this.setup(data);
  }

  _createClass(Role, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The ID of the role (unique to the guild it is part of)
       * @type {Snowflake}
       */
      this.id = data.id;

      /**
       * The name of the role
       * @type {string}
       */
      this.name = data.name;

      /**
       * The base 10 color of the role
       * @type {number}
       */
      this.color = data.color;

      /**
       * If true, users that are part of this role will appear in a separate category in the users list
       * @type {boolean}
       */
      this.hoist = data.hoist;

      /**
       * The position of the role from the API
       * @type {number}
       */
      this.position = data.position;

      /**
       * The permissions bitfield of the role
       * @type {number}
       */
      this.permissions = data.permissions;

      /**
       * Whether or not the role is managed by an external service
       * @type {boolean}
       */
      this.managed = data.managed;

      /**
       * Whether or not the role can be mentioned by anyone
       * @type {boolean}
       */
      this.mentionable = data.mentionable;
    }

    /**
     * The timestamp the role was created at
     * @type {number}
     * @readonly
     */

  }, {
    key: 'serialize',


    /**
     * Get an object mapping permission names to whether or not the role enables that permission
     * @returns {Object<string, boolean>}
     * @example
     * // print the serialized role
     * console.log(role.serialize());
     */
    value: function serialize() {
      return this.client.resolver.serializePermissions(this.permissions);
    }

    /**
     * Checks if the role has a permission.
     * @param {PermissionResolvable|PermissionResolvable[]} permission Permission(s) to check for
     * @param {boolean} [explicit=false] Whether to require the role to explicitly have the exact permission
     * **(deprecated)**
     * @param {boolean} [checkAdmin] Whether to allow the administrator permission to override
     * (takes priority over `explicit`)
     * @returns {boolean}
     * @example
     * // see if a role can ban a member
     * if (role.hasPermission('BAN_MEMBERS')) {
     *   console.log('This role can ban members');
     * } else {
     *   console.log('This role can\'t ban members');
     * }
     */

  }, {
    key: 'hasPermission',
    value: function hasPermission(permission) {
      var explicit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var checkAdmin = arguments[2];

      return new Permissions(this.permissions).has(permission, typeof checkAdmin !== 'undefined' ? checkAdmin : !explicit);
    }

    /**
     * Checks if the role has all specified permissions.
     * @param {PermissionResolvable[]} permissions The permissions to check for
     * @param {boolean} [explicit=false] Whether to require the role to explicitly have the exact permissions
     * @returns {boolean}
     * @deprecated
     */

  }, {
    key: 'hasPermissions',
    value: function hasPermissions(permissions) {
      var explicit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      return new Permissions(this.permissions).has(permissions, !explicit);
    }

    /**
     * Compares this role's position to another role's.
     * @param {Role} role Role to compare to this one
     * @returns {number} Negative number if the this role's position is lower (other role's is higher),
     * positive number if the this one is higher (other's is lower), 0 if equal
     */

  }, {
    key: 'comparePositionTo',
    value: function comparePositionTo(role) {
      return this.constructor.comparePositions(this, role);
    }

    /**
     * The data for a role
     * @typedef {Object} RoleData
     * @property {string} [name] The name of the role
     * @property {ColorResolvable} [color] The color of the role, either a hex string or a base 10 number
     * @property {boolean} [hoist] Whether or not the role should be hoisted
     * @property {number} [position] The position of the role
     * @property {string[]} [permissions] The permissions of the role
     * @property {boolean} [mentionable] Whether or not the role should be mentionable
     */

    /**
     * Edits the role
     * @param {RoleData} data The new data for the role
     * @returns {Promise<Role>}
     * @example
     * // edit a role
     * role.edit({name: 'new role'})
     *  .then(r => console.log(`Edited role ${r}`))
     *  .catch(console.error);
     */

  }, {
    key: 'edit',
    value: function edit(data) {
      return this.client.rest.methods.updateGuildRole(this, data);
    }

    /**
     * Set a new name for the role
     * @param {string} name The new name of the role
     * @returns {Promise<Role>}
     * @example
     * // set the name of the role
     * role.setName('new role')
     *  .then(r => console.log(`Edited name of role ${r}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setName',
    value: function setName(name) {
      return this.edit({ name: name });
    }

    /**
     * Set a new color for the role
     * @param {ColorResolvable} color The color of the role
     * @returns {Promise<Role>}
     * @example
     * // set the color of a role
     * role.setColor('#FF0000')
     *  .then(r => console.log(`Set color of role ${r}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setColor',
    value: function setColor(color) {
      return this.edit({ color: color });
    }

    /**
     * Set whether or not the role should be hoisted
     * @param {boolean} hoist Whether or not to hoist the role
     * @returns {Promise<Role>}
     * @example
     * // set the hoist of the role
     * role.setHoist(true)
     *  .then(r => console.log(`Role hoisted: ${r.hoist}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setHoist',
    value: function setHoist(hoist) {
      return this.edit({ hoist: hoist });
    }

    /**
     * Set the position of the role
     * @param {number} position The position of the role
     * @param {boolean} [relative=false] Move the position relative to its current value
     * @returns {Promise<Role>}
     * @example
     * // set the position of the role
     * role.setPosition(1)
     *  .then(r => console.log(`Role position: ${r.position}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setPosition',
    value: function setPosition(position, relative) {
      var _this = this;

      return this.guild.setRolePosition(this, position, relative).then(function () {
        return _this;
      });
    }

    /**
     * Set the permissions of the role
     * @param {string[]} permissions The permissions of the role
     * @returns {Promise<Role>}
     * @example
     * // set the permissions of the role
     * role.setPermissions(['KICK_MEMBERS', 'BAN_MEMBERS'])
     *  .then(r => console.log(`Role updated ${r}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setPermissions',
    value: function setPermissions(permissions) {
      return this.edit({ permissions: permissions });
    }

    /**
     * Set whether this role is mentionable
     * @param {boolean} mentionable Whether this role should be mentionable
     * @returns {Promise<Role>}
     * @example
     * // make the role mentionable
     * role.setMentionable(true)
     *  .then(r => console.log(`Role updated ${r}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setMentionable',
    value: function setMentionable(mentionable) {
      return this.edit({ mentionable: mentionable });
    }

    /**
     * Deletes the role
     * @returns {Promise<Role>}
     * @example
     * // delete a role
     * role.delete()
     *  .then(r => console.log(`Deleted role ${r}`))
     *  .catch(console.error);
     */

  }, {
    key: 'delete',
    value: function _delete() {
      return this.client.rest.methods.deleteGuildRole(this);
    }

    /**
     * Whether this role equals another role. It compares all properties, so for most operations
     * it is advisable to just compare `role.id === role2.id` as it is much faster and is often
     * what most users need.
     * @param {Role} role Role to compare with
     * @returns {boolean}
     */

  }, {
    key: 'equals',
    value: function equals(role) {
      return role && this.id === role.id && this.name === role.name && this.color === role.color && this.hoist === role.hoist && this.position === role.position && this.permissions === role.permissions && this.managed === role.managed;
    }

    /**
     * When concatenated with a string, this automatically concatenates the role mention rather than the Role object.
     * @returns {string}
     */

  }, {
    key: 'toString',
    value: function toString() {
      if (this.id === this.guild.id) return '@everyone';
      return '<@&' + this.id + '>';
    }

    /**
     * Compares the positions of two roles.
     * @param {Role} role1 First role to compare
     * @param {Role} role2 Second role to compare
     * @returns {number} Negative number if the first role's position is lower (second role's is higher),
     * positive number if the first's is higher (second's is lower), 0 if equal
     */

  }, {
    key: 'createdTimestamp',
    get: function get() {
      return Snowflake.deconstruct(this.id).timestamp;
    }

    /**
     * The time the role was created
     * @type {Date}
     * @readonly
     */

  }, {
    key: 'createdAt',
    get: function get() {
      return new Date(this.createdTimestamp);
    }

    /**
     * The hexadecimal version of the role color, with a leading hashtag.
     * @type {string}
     * @readonly
     */

  }, {
    key: 'hexColor',
    get: function get() {
      var col = this.color.toString(16);
      while (col.length < 6) {
        col = '0' + col;
      }return '#' + col;
    }

    /**
     * The cached guild members that have this role.
     * @type {Collection<Snowflake, GuildMember>}
     * @readonly
     */

  }, {
    key: 'members',
    get: function get() {
      var _this2 = this;

      return this.guild.members.filter(function (m) {
        return m.roles.has(_this2.id);
      });
    }

    /**
     * Whether the role is editable by the client user.
     * @type {boolean}
     * @readonly
     */

  }, {
    key: 'editable',
    get: function get() {
      if (this.managed) return false;
      var clientMember = this.guild.member(this.client.user);
      if (!clientMember.hasPermission(Permissions.FLAGS.MANAGE_ROLES_OR_PERMISSIONS)) return false;
      return clientMember.highestRole.comparePositionTo(this) > 0;
    }

    /**
     * The position of the role in the role manager
     * @type {number}
     */

  }, {
    key: 'calculatedPosition',
    get: function get() {
      var _this3 = this;

      var sorted = this.guild.roles.array().sort(function (r1, r2) {
        return r1.position !== r2.position ? r1.position - r2.position : r1.id - r2.id;
      });
      return sorted.indexOf(sorted.find(function (r) {
        return r.id === _this3.id;
      }));
    }
  }], [{
    key: 'comparePositions',
    value: function comparePositions(role1, role2) {
      if (role1.position === role2.position) return role2.id - role1.id;
      return role1.position - role2.position;
    }
  }]);

  return Role;
}();

module.exports = Role;