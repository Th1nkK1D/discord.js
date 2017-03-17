'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
{ splash: null,
     id: '123123123',
     icon: '123123123',
     name: 'name' }
*/

/**
 * Represents a guild that the client only has limited information for - e.g. from invites.
 */
var PartialGuild = function () {
  function PartialGuild(client, data) {
    _classCallCheck(this, PartialGuild);

    /**
     * The Client that instantiated this PartialGuild
     * @name PartialGuild#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    this.setup(data);
  }

  _createClass(PartialGuild, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The ID of this guild
       * @type {Snowflake}
       */
      this.id = data.id;

      /**
       * The name of this guild
       * @type {string}
       */
      this.name = data.name;

      /**
       * The hash of this guild's icon, or null if there is none.
       * @type {?string}
       */
      this.icon = data.icon;

      /**
       * The hash of the guild splash image, or null if no splash (VIP only)
       * @type {?string}
       */
      this.splash = data.splash;
    }
  }]);

  return PartialGuild;
}();

module.exports = PartialGuild;