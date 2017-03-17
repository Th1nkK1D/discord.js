'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GuildChannel = require('./GuildChannel');
var TextBasedChannel = require('./interface/TextBasedChannel');
var Collection = require('../util/Collection');

/**
 * Represents a guild text channel on Discord.
 * @extends {GuildChannel}
 * @implements {TextBasedChannel}
 */

var TextChannel = function (_GuildChannel) {
  _inherits(TextChannel, _GuildChannel);

  function TextChannel(guild, data) {
    _classCallCheck(this, TextChannel);

    var _this = _possibleConstructorReturn(this, (TextChannel.__proto__ || Object.getPrototypeOf(TextChannel)).call(this, guild, data));

    _this.type = 'text';
    _this.messages = new Collection();
    _this._typing = new Map();
    return _this;
  }

  _createClass(TextChannel, [{
    key: 'setup',
    value: function setup(data) {
      _get(TextChannel.prototype.__proto__ || Object.getPrototypeOf(TextChannel.prototype), 'setup', this).call(this, data);

      /**
       * The topic of the text channel, if there is one.
       * @type {?string}
       */
      this.topic = data.topic;

      this.lastMessageID = data.last_message_id;
    }

    /**
     * A collection of members that can see this channel, mapped by their ID.
     * @type {Collection<Snowflake, GuildMember>}
     * @readonly
     */

  }, {
    key: 'fetchWebhooks',


    /**
     * Fetch all webhooks for the channel.
     * @returns {Promise<Collection<Snowflake, Webhook>>}
     */
    value: function fetchWebhooks() {
      return this.client.rest.methods.getChannelWebhooks(this);
    }

    /**
     * Create a webhook for the channel.
     * @param {string} name The name of the webhook.
     * @param {BufferResolvable|Base64Resolvable} avatar The avatar for the webhook.
     * @returns {Promise<Webhook>} webhook The created webhook.
     * @example
     * channel.createWebhook('Snek', 'http://snek.s3.amazonaws.com/topSnek.png')
     *  .then(webhook => console.log(`Created Webhook ${webhook}`))
     *  .catch(console.error)
     */

  }, {
    key: 'createWebhook',
    value: function createWebhook(name, avatar) {
      var _this2 = this;

      return new Promise(function (resolve) {
        if (typeof avatar === 'string' && avatar.startsWith('data:')) {
          resolve(_this2.client.rest.methods.createWebhook(_this2, name, avatar));
        } else {
          _this2.client.resolver.resolveBuffer(avatar).then(function (data) {
            return resolve(_this2.client.rest.methods.createWebhook(_this2, name, data));
          });
        }
      });
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
  }, {
    key: 'bulkDelete',
    value: function bulkDelete() {}
  }, {
    key: 'acknowledge',
    value: function acknowledge() {}
  }, {
    key: '_cacheMessage',
    value: function _cacheMessage() {}
  }, {
    key: 'members',
    get: function get() {
      var members = new Collection();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.guild.members.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var member = _step.value;

          if (this.permissionsFor(member).hasPermission('READ_MESSAGES')) {
            members.set(member.id, member);
          }
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

      return members;
    }
  }, {
    key: 'typing',
    get: function get() {}
  }, {
    key: 'typingCount',
    get: function get() {}
  }]);

  return TextChannel;
}(GuildChannel);

TextBasedChannel.applyToClass(TextChannel, true);

module.exports = TextChannel;