'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractHandler = require('./AbstractHandler');
var Constants = require('../../../../util/Constants');

/*
{ t: 'CHANNEL_PINS_UPDATE',
  s: 666,
  op: 0,
  d:
   { last_pin_timestamp: '2016-08-28T17:37:13.171774+00:00',
     channel_id: '314866471639044027' } }
*/

var ChannelPinsUpdate = function (_AbstractHandler) {
  _inherits(ChannelPinsUpdate, _AbstractHandler);

  function ChannelPinsUpdate() {
    _classCallCheck(this, ChannelPinsUpdate);

    return _possibleConstructorReturn(this, (ChannelPinsUpdate.__proto__ || Object.getPrototypeOf(ChannelPinsUpdate)).apply(this, arguments));
  }

  _createClass(ChannelPinsUpdate, [{
    key: 'handle',
    value: function handle(packet) {
      var client = this.packetManager.client;
      var data = packet.d;
      var channel = client.channels.get(data.channel_id);
      var time = new Date(data.last_pin_timestamp);
      if (channel && time) client.emit(Constants.Events.CHANNEL_PINS_UPDATE, channel, time);
    }
  }]);

  return ChannelPinsUpdate;
}(AbstractHandler);

/**
 * Emitted whenever the pins of a channel are updated. Due to the nature of the WebSocket event, not much information
 * can be provided easily here - you need to manually check the pins yourself.
 * @event Client#channelPinsUpdate
 * @param {Channel} channel The channel that the pins update occured in
 * @param {Date} time The time of the pins update
 */

module.exports = ChannelPinsUpdate;