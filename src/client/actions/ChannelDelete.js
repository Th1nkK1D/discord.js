'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');

var ChannelDeleteAction = function (_Action) {
  _inherits(ChannelDeleteAction, _Action);

  function ChannelDeleteAction(client) {
    _classCallCheck(this, ChannelDeleteAction);

    var _this = _possibleConstructorReturn(this, (ChannelDeleteAction.__proto__ || Object.getPrototypeOf(ChannelDeleteAction)).call(this, client));

    _this.deleted = new Map();
    return _this;
  }

  _createClass(ChannelDeleteAction, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var channel = client.channels.get(data.id);
      if (channel) {
        client.dataManager.killChannel(channel);
        this.deleted.set(channel.id, channel);
        this.scheduleForDeletion(channel.id);
      } else {
        channel = this.deleted.get(data.id) || null;
      }

      return {
        channel: channel
      };
    }
  }, {
    key: 'scheduleForDeletion',
    value: function scheduleForDeletion(id) {
      var _this2 = this;

      this.client.setTimeout(function () {
        return _this2.deleted.delete(id);
      }, this.client.options.restWsBridgeTimeout);
    }
  }]);

  return ChannelDeleteAction;
}(Action);

module.exports = ChannelDeleteAction;