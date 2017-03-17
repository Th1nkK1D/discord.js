'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Channel = require('./Channel');
var TextBasedChannel = require('./interface/TextBasedChannel');
var Collection = require('../util/Collection');

/**
 * Represents a direct message channel between two users.
 * @extends {Channel}
 * @implements {TextBasedChannel}
 */

var DMChannel = function (_Channel) {
  _inherits(DMChannel, _Channel);

  function DMChannel(client, data) {
    _classCallCheck(this, DMChannel);

    var _this = _possibleConstructorReturn(this, (DMChannel.__proto__ || Object.getPrototypeOf(DMChannel)).call(this, client, data));

    _this.type = 'dm';
    _this.messages = new Collection();
    _this._typing = new Map();
    return _this;
  }

  _createClass(DMChannel, [{
    key: 'setup',
    value: function setup(data) {
      _get(DMChannel.prototype.__proto__ || Object.getPrototypeOf(DMChannel.prototype), 'setup', this).call(this, data);

      /**
       * The recipient on the other end of the DM
       * @type {User}
       */
      this.recipient = this.client.dataManager.newUser(data.recipients[0]);

      this.lastMessageID = data.last_message_id;
    }

    /**
     * When concatenated with a string, this automatically concatenates the recipient's mention instead of the
     * DM channel object.
     * @returns {string}
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.recipient.toString();
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
    // Doesn't work on DM channels; bulkDelete() {}

  }, {
    key: 'acknowledge',
    value: function acknowledge() {}
  }, {
    key: '_cacheMessage',
    value: function _cacheMessage() {}
  }, {
    key: 'typing',
    get: function get() {}
  }, {
    key: 'typingCount',
    get: function get() {}
  }]);

  return DMChannel;
}(Channel);

TextBasedChannel.applyToClass(DMChannel, true, ['bulkDelete']);

module.exports = DMChannel;