'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Snowflake = require('../util/Snowflake');

/**
 * Represents any channel on Discord
 */

var Channel = function () {
  function Channel(client, data) {
    _classCallCheck(this, Channel);

    /**
     * The client that instantiated the Channel
     * @name Channel#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * The type of the channel, either:
     * * `dm` - a DM channel
     * * `group` - a Group DM channel
     * * `text` - a guild text channel
     * * `voice` - a guild voice channel
     * @type {string}
     */
    this.type = null;

    if (data) this.setup(data);
  }

  _createClass(Channel, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The unique ID of the channel
       * @type {Snowflake}
       */
      this.id = data.id;
    }

    /**
     * The timestamp the channel was created at
     * @type {number}
     * @readonly
     */

  }, {
    key: 'delete',


    /**
     * Deletes the channel
     * @returns {Promise<Channel>}
     * @example
     * // delete the channel
     * channel.delete()
     *  .then() // success
     *  .catch(console.error); // log error
     */
    value: function _delete() {
      return this.client.rest.methods.deleteChannel(this);
    }
  }, {
    key: 'createdTimestamp',
    get: function get() {
      return Snowflake.deconstruct(this.id).timestamp;
    }

    /**
     * The time the channel was created
     * @type {Date}
     * @readonly
     */

  }, {
    key: 'createdAt',
    get: function get() {
      return new Date(this.createdTimestamp);
    }
  }]);

  return Channel;
}();

module.exports = Channel;