'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Channel = require('./Channel');
var TextBasedChannel = require('./interface/TextBasedChannel');
var Collection = require('../util/Collection');

/*
{ type: 3,
  recipients:
   [ { username: 'Charlie',
       id: '123',
       discriminator: '6631',
       avatar: '123' },
     { username: 'Ben',
       id: '123',
       discriminator: '2055',
       avatar: '123' },
     { username: 'Adam',
       id: '123',
       discriminator: '2406',
       avatar: '123' } ],
  owner_id: '123',
  name: null,
  last_message_id: '123',
  id: '123',
  icon: null }
*/

/**
 * Represents a Group DM on Discord
 * @extends {Channel}
 * @implements {TextBasedChannel}
 */

var GroupDMChannel = function (_Channel) {
  _inherits(GroupDMChannel, _Channel);

  function GroupDMChannel(client, data) {
    _classCallCheck(this, GroupDMChannel);

    var _this = _possibleConstructorReturn(this, (GroupDMChannel.__proto__ || Object.getPrototypeOf(GroupDMChannel)).call(this, client, data));

    _this.type = 'group';
    _this.messages = new Collection();
    _this._typing = new Map();
    return _this;
  }

  _createClass(GroupDMChannel, [{
    key: 'setup',
    value: function setup(data) {
      _get(GroupDMChannel.prototype.__proto__ || Object.getPrototypeOf(GroupDMChannel.prototype), 'setup', this).call(this, data);

      /**
       * The name of this Group DM, can be null if one isn't set.
       * @type {string}
       */
      this.name = data.name;

      /**
       * A hash of the Group DM icon.
       * @type {string}
       */
      this.icon = data.icon;

      /**
       * The user ID of this Group DM's owner.
       * @type {string}
       */
      this.ownerID = data.owner_id;

      /**
       * If the dm is managed by an application
       * @type {boolean}
       */
      this.managed = data.managed;

      /**
       * Application ID of the application that made this group dm, if applicable
       * @type {?string}
       */
      this.applicationID = data.application_id;

      /**
       * Nicknames for group members
       * @type {?Collection<Snowflake, String>}
       */
      if (data.nicks) this.nicks = new Collection(data.nicks.map(function (n) {
        return [n.id, n.nick];
      }));

      if (!this.recipients) {
        /**
         * A collection of the recipients of this DM, mapped by their ID.
         * @type {Collection<Snowflake, User>}
         */
        this.recipients = new Collection();
      }

      if (data.recipients) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = data.recipients[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var recipient = _step.value;

            var user = this.client.dataManager.newUser(recipient);
            this.recipients.set(user.id, user);
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

      this.lastMessageID = data.last_message_id;
    }

    /**
     * The owner of this Group DM.
     * @type {User}
     * @readonly
     */

  }, {
    key: 'equals',


    /**
     * Whether this channel equals another channel. It compares all properties, so for most operations
     * it is advisable to just compare `channel.id === channel2.id` as it is much faster and is often
     * what most users need.
     * @param {GroupDMChannel} channel Channel to compare with
     * @returns {boolean}
     */
    value: function equals(channel) {
      var equal = channel && this.id === channel.id && this.name === channel.name && this.icon === channel.icon && this.ownerID === channel.ownerID;

      if (equal) {
        return this.recipients.equals(channel.recipients);
      }

      return equal;
    }

    /**
     * Add a user to the dm
     * @param {UserResolvable|String} accessTokenOrID Access token or user resolvable
     * @param {string} [nick] Permanent nickname to give the user (only available if a bot is creating the dm)
     */

  }, {
    key: 'addUser',
    value: function addUser(accessTokenOrID, nick) {
      return this.client.rest.methods.addUserToGroupDM(this, {
        nick: nick,
        id: this.client.resolver.resolveUserID(accessTokenOrID),
        accessToken: accessTokenOrID
      });
    }

    /**
     * When concatenated with a string, this automatically concatenates the channel's name instead of the Channel object.
     * @returns {string}
     * @example
     * // logs: Hello from My Group DM!
     * console.log(`Hello from ${channel}!`);
     * @example
     * // logs: Hello from My Group DM!
     * console.log(`Hello from ' + channel + '!');
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.name;
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
    key: 'sendFiles',
    value: function sendFiles() {}
  }, {
    key: 'sendCode',
    value: function sendCode() {}
  }, {
    key: 'fetchMessage',
    value: function fetchMessage() {}
  }, {
    key: 'fetchMessages',
    value: function fetchMessages() {}
  }, {
    key: 'fetchPinnedMessages',
    value: function fetchPinnedMessages() {}
  }, {
    key: 'search',
    value: function search() {}
  }, {
    key: 'startTyping',
    value: function startTyping() {}
  }, {
    key: 'stopTyping',
    value: function stopTyping() {}
  }, {
    key: 'createCollector',
    value: function createCollector() {}
  }, {
    key: 'awaitMessages',
    value: function awaitMessages() {}
    // Doesn't work on group DMs; bulkDelete() {}

  }, {
    key: 'acknowledge',
    value: function acknowledge() {}
  }, {
    key: '_cacheMessage',
    value: function _cacheMessage() {}
  }, {
    key: 'owner',
    get: function get() {
      return this.client.users.get(this.ownerID);
    }
  }, {
    key: 'typing',
    get: function get() {}
  }, {
    key: 'typingCount',
    get: function get() {}
  }]);

  return GroupDMChannel;
}(Channel);

TextBasedChannel.applyToClass(GroupDMChannel, true, ['bulkDelete']);

module.exports = GroupDMChannel;