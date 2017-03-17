'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Constants = require('../../util/Constants');
var Util = require('../../util/Util');

var ChannelUpdateAction = function (_Action) {
  _inherits(ChannelUpdateAction, _Action);

  function ChannelUpdateAction() {
    _classCallCheck(this, ChannelUpdateAction);

    return _possibleConstructorReturn(this, (ChannelUpdateAction.__proto__ || Object.getPrototypeOf(ChannelUpdateAction)).apply(this, arguments));
  }

  _createClass(ChannelUpdateAction, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var channel = client.channels.get(data.id);
      if (channel) {
        var oldChannel = Util.cloneObject(channel);
        channel.setup(data);
        client.emit(Constants.Events.CHANNEL_UPDATE, oldChannel, channel);
        return {
          old: oldChannel,
          updated: channel
        };
      }

      return {
        old: null,
        updated: null
      };
    }
  }]);

  return ChannelUpdateAction;
}(Action);

/**
 * Emitted whenever a channel is updated - e.g. name change, topic change.
 * @event Client#channelUpdate
 * @param {Channel} oldChannel The channel before the update
 * @param {Channel} newChannel The channel after the update
 */

module.exports = ChannelUpdateAction;