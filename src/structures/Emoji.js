'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Constants = require('../util/Constants');
var Collection = require('../util/Collection');
var Snowflake = require('../util/Snowflake');

/**
 * Represents a custom emoji
 */

var Emoji = function () {
  function Emoji(guild, data) {
    _classCallCheck(this, Emoji);

    /**
     * The Client that instantiated this object
     * @name Emoji#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: guild.client });

    /**
     * The guild this emoji is part of
     * @type {Guild}
     */
    this.guild = guild;

    this.setup(data);
  }

  _createClass(Emoji, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The ID of the emoji
       * @type {Snowflake}
       */
      this.id = data.id;

      /**
       * The name of the emoji
       * @type {string}
       */
      this.name = data.name;

      /**
       * Whether or not this emoji requires colons surrounding it
       * @type {boolean}
       */
      this.requiresColons = data.require_colons;

      /**
       * Whether this emoji is managed by an external service
       * @type {boolean}
       */
      this.managed = data.managed;

      this._roles = data.roles;
    }

    /**
     * The timestamp the emoji was created at
     * @type {number}
     * @readonly
     */

  }, {
    key: 'edit',


    /**
     * Data for editing an emoji
     * @typedef {Object} EmojiEditData
     * @property {string} [name] The name of the emoji
     * @property {Collection<Snowflake, Role>|Array<Snowflake|Role>} [roles] Roles to restrict emoji to
     */

    /**
     * Edits the emoji
     * @param {EmojiEditData} data The new data for the emoji
     * @returns {Promise<Emoji>}
     * @example
     * // edit a emoji
     * emoji.edit({name: 'newemoji'})
     *  .then(e => console.log(`Edited emoji ${e}`))
     *  .catch(console.error);
     */
    value: function edit(data) {
      return this.client.rest.methods.updateEmoji(this, data);
    }

    /**
     * When concatenated with a string, this automatically returns the emoji mention rather than the object.
     * @returns {string}
     * @example
     * // send an emoji:
     * const emoji = guild.emojis.first();
     * msg.reply(`Hello! ${emoji}`);
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.requiresColons ? '<:' + this.name + ':' + this.id + '>' : this.name;
    }

    /**
     * Whether this emoji is the same as another one
     * @param {Emoji|Object} other the emoji to compare it to
     * @returns {boolean} whether the emoji is equal to the given emoji or not
     */

  }, {
    key: 'equals',
    value: function equals(other) {
      if (other instanceof Emoji) {
        return other.id === this.id && other.name === this.name && other.managed === this.managed && other.requiresColons === this.requiresColons;
      } else {
        return other.id === this.id && other.name === this.name;
      }
    }
  }, {
    key: 'createdTimestamp',
    get: function get() {
      return Snowflake.deconstruct(this.id).timestamp;
    }

    /**
     * The time the emoji was created
     * @type {Date}
     * @readonly
     */

  }, {
    key: 'createdAt',
    get: function get() {
      return new Date(this.createdTimestamp);
    }

    /**
     * A collection of roles this emoji is active for (empty if all), mapped by role ID.
     * @type {Collection<Snowflake, Role>}
     * @readonly
     */

  }, {
    key: 'roles',
    get: function get() {
      var roles = new Collection();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._roles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var role = _step.value;

          if (this.guild.roles.has(role)) roles.set(role, this.guild.roles.get(role));
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

      return roles;
    }

    /**
     * The URL to the emoji file
     * @type {string}
     * @readonly
     */

  }, {
    key: 'url',
    get: function get() {
      return Constants.Endpoints.emoji(this.id);
    }

    /**
     * The identifier of this emoji, used for message reactions
     * @type {string}
     * @readonly
     */

  }, {
    key: 'identifier',
    get: function get() {
      if (this.id) return this.name + ':' + this.id;
      return encodeURIComponent(this.name);
    }
  }]);

  return Emoji;
}();

module.exports = Emoji;