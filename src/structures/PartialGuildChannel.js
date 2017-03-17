'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Constants = require('../util/Constants');

/*
{ type: 0, id: '123123', name: 'heavy-testing' } }
*/

/**
 * Represents a guild channel that the client only has limited information for - e.g. from invites.
 */

var PartialGuildChannel = function () {
  function PartialGuildChannel(client, data) {
    _classCallCheck(this, PartialGuildChannel);

    /**
     * The Client that instantiated this PartialGuildChannel
     * @name PartialGuildChannel#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    this.setup(data);
  }

  _createClass(PartialGuildChannel, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The ID of this guild channel
       * @type {Snowflake}
       */
      this.id = data.id;

      /**
       * The name of this guild channel
       * @type {string}
       */
      this.name = data.name;

      /**
       * The type of this guild channel - `text` or `voice`
       * @type {string}
       */
      this.type = Constants.ChannelTypes.TEXT === data.type ? 'text' : 'voice';
    }
  }]);

  return PartialGuildChannel;
}();

module.exports = PartialGuildChannel;