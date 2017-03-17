'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events').EventEmitter;
var Collection = require('../util/Collection');

/**
 * Collects messages based on a specified filter, then emits them.
 * @extends {EventEmitter}
 */

var MessageCollector = function (_EventEmitter) {
  _inherits(MessageCollector, _EventEmitter);

  /**
   * A function that takes a Message object and a MessageCollector and returns a boolean.
   * ```js
   * function(message, collector) {
   *  if (message.content.includes('discord')) {
   *    return true; // passed the filter test
   *  }
   *  return false; // failed the filter test
   * }
   * ```
   * @typedef {Function} CollectorFilterFunction
   */

  /**
   * An object containing options used to configure a MessageCollector. All properties are optional.
   * @typedef {Object} CollectorOptions
   * @property {number} [time] Duration for the collector in milliseconds
   * @property {number} [max] Maximum number of messages to handle
   * @property {number} [maxMatches] Maximum number of successfully filtered messages to obtain
   */

  /**
   * @param {Channel} channel The channel to collect messages in
   * @param {CollectorFilterFunction} filter The filter function
   * @param {CollectorOptions} [options] Options for the collector
   */
  function MessageCollector(channel, filter) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, MessageCollector);

    /**
     * The channel this collector is operating on
     * @type {Channel}
     */
    var _this = _possibleConstructorReturn(this, (MessageCollector.__proto__ || Object.getPrototypeOf(MessageCollector)).call(this));

    _this.channel = channel;

    /**
     * A function used to filter messages that the collector collects.
     * @type {CollectorFilterFunction}
     */
    _this.filter = filter;

    /**
     * Options for the collecor.
     * @type {CollectorOptions}
     */
    _this.options = options;

    /**
     * Whether this collector has stopped collecting messages.
     * @type {boolean}
     */
    _this.ended = false;

    /**
     * A collection of collected messages, mapped by message ID.
     * @type {Collection<Snowflake, Message>}
     */
    _this.collected = new Collection();

    _this.listener = function (message) {
      return _this.verify(message);
    };
    _this.channel.client.on('message', _this.listener);
    if (options.time) _this.channel.client.setTimeout(function () {
      return _this.stop('time');
    }, options.time);
    return _this;
  }

  /**
   * Verifies a message against the filter and options
   * @private
   * @param {Message} message The message
   * @returns {boolean}
   */


  _createClass(MessageCollector, [{
    key: 'verify',
    value: function verify(message) {
      if (this.channel ? this.channel.id !== message.channel.id : false) return false;
      if (this.filter(message, this)) {
        this.collected.set(message.id, message);
        /**
         * Emitted whenever the collector receives a message that passes the filter test.
         * @param {Message} message The received message
         * @param {MessageCollector} collector The collector the message passed through
         * @event MessageCollector#message
         */
        this.emit('message', message, this);
        if (this.collected.size >= this.options.maxMatches) this.stop('matchesLimit');else if (this.options.max && this.collected.size === this.options.max) this.stop('limit');
        return true;
      }
      return false;
    }

    /**
     * Returns a promise that resolves when a valid message is sent. Rejects
     * with collected messages if the Collector ends before receiving a message.
     * @type {Promise<Message>}
     * @readonly
     */

  }, {
    key: 'stop',


    /**
     * Stops the collector and emits `end`.
     * @param {string} [reason='user'] An optional reason for stopping the collector
     */
    value: function stop() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'user';

      if (this.ended) return;
      this.ended = true;
      this.channel.client.removeListener('message', this.listener);
      /**
       * Emitted when the Collector stops collecting.
       * @param {Collection<Snowflake, Message>} collection A collection of messages collected
       * during the lifetime of the collector, mapped by the ID of the messages.
       * @param {string} reason The reason for the end of the collector. If it ended because it reached the specified time
       * limit, this would be `time`. If you invoke `.stop()` without specifying a reason, this would be `user`. If it
       * ended because it reached its message limit, it will be `limit`.
       * @event MessageCollector#end
       */
      this.emit('end', this.collected, reason);
    }
  }, {
    key: 'next',
    get: function get() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (_this2.ended) {
          reject(_this2.collected);
          return;
        }

        var cleanup = function cleanup() {
          _this2.removeListener('message', onMessage);
          _this2.removeListener('end', onEnd);
        };

        var onMessage = function onMessage() {
          cleanup();
          resolve.apply(undefined, arguments);
        };

        var onEnd = function onEnd() {
          cleanup();
          reject.apply(undefined, arguments); // eslint-disable-line prefer-promise-reject-errors
        };

        _this2.once('message', onMessage);
        _this2.once('end', onEnd);
      });
    }
  }]);

  return MessageCollector;
}(EventEmitter);

module.exports = MessageCollector;