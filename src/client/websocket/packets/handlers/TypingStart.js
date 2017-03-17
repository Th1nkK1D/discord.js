'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractHandler = require('./AbstractHandler');
var Constants = require('../../../../util/Constants');

var TypingStartHandler = function (_AbstractHandler) {
  _inherits(TypingStartHandler, _AbstractHandler);

  function TypingStartHandler() {
    _classCallCheck(this, TypingStartHandler);

    return _possibleConstructorReturn(this, (TypingStartHandler.__proto__ || Object.getPrototypeOf(TypingStartHandler)).apply(this, arguments));
  }

  _createClass(TypingStartHandler, [{
    key: 'handle',
    value: function handle(packet) {
      var client = this.packetManager.client;
      var data = packet.d;
      var channel = client.channels.get(data.channel_id);
      var user = client.users.get(data.user_id);
      var timestamp = new Date(data.timestamp * 1000);

      if (channel && user) {
        if (channel.type === 'voice') {
          client.emit(Constants.Events.WARN, 'Discord sent a typing packet to voice channel ' + channel.id);
          return;
        }
        if (channel._typing.has(user.id)) {
          var typing = channel._typing.get(user.id);
          typing.lastTimestamp = timestamp;
          typing.resetTimeout(tooLate(channel, user));
        } else {
          channel._typing.set(user.id, new TypingData(client, timestamp, timestamp, tooLate(channel, user)));
          client.emit(Constants.Events.TYPING_START, channel, user);
        }
      }
    }
  }]);

  return TypingStartHandler;
}(AbstractHandler);

var TypingData = function () {
  function TypingData(client, since, lastTimestamp, _timeout) {
    _classCallCheck(this, TypingData);

    this.client = client;
    this.since = since;
    this.lastTimestamp = lastTimestamp;
    this._timeout = _timeout;
  }

  _createClass(TypingData, [{
    key: 'resetTimeout',
    value: function resetTimeout(_timeout) {
      this.client.clearTimeout(this._timeout);
      this._timeout = _timeout;
    }
  }, {
    key: 'elapsedTime',
    get: function get() {
      return Date.now() - this.since;
    }
  }]);

  return TypingData;
}();

function tooLate(channel, user) {
  return channel.client.setTimeout(function () {
    channel.client.emit(Constants.Events.TYPING_STOP, channel, user, channel._typing.get(user.id));
    channel._typing.delete(user.id);
  }, 6000);
}

/**
 * Emitted whenever a user starts typing in a channel
 * @event Client#typingStart
 * @param {Channel} channel The channel the user started typing in
 * @param {User} user The user that started typing
 */

/**
 * Emitted whenever a user stops typing in a channel
 * @event Client#typingStop
 * @param {Channel} channel The channel the user stopped typing in
 * @param {User} user The user that stopped typing
 */

module.exports = TypingStartHandler;