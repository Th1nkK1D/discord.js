'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a permission overwrite for a role or member in a guild channel.
 */
var PermissionOverwrites = function () {
  function PermissionOverwrites(guildChannel, data) {
    _classCallCheck(this, PermissionOverwrites);

    /**
     * The GuildChannel this overwrite is for
     * @name PermissionOverwrites#channel
     * @type {GuildChannel}
     * @readonly
     */
    Object.defineProperty(this, 'channel', { value: guildChannel });

    if (data) this.setup(data);
  }

  _createClass(PermissionOverwrites, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The ID of this overwrite, either a user ID or a role ID
       * @type {Snowflake}
       */
      this.id = data.id;

      /**
       * The type of this overwrite
       * @type {string}
       */
      this.type = data.type;

      this.deny = data.deny;
      this.allow = data.allow;
    }

    /**
     * Delete this Permission Overwrite.
     * @returns {Promise<PermissionOverwrites>}
     */

  }, {
    key: 'delete',
    value: function _delete() {
      return this.channel.client.rest.methods.deletePermissionOverwrites(this);
    }
  }]);

  return PermissionOverwrites;
}();

module.exports = PermissionOverwrites;