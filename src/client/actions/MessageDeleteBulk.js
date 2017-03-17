'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Collection = require('../../util/Collection');
var Constants = require('../../util/Constants');

var MessageDeleteBulkAction = function (_Action) {
  _inherits(MessageDeleteBulkAction, _Action);

  function MessageDeleteBulkAction() {
    _classCallCheck(this, MessageDeleteBulkAction);

    return _possibleConstructorReturn(this, (MessageDeleteBulkAction.__proto__ || Object.getPrototypeOf(MessageDeleteBulkAction)).apply(this, arguments));
  }

  _createClass(MessageDeleteBulkAction, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;
      var channel = client.channels.get(data.channel_id);

      var ids = data.ids;
      var messages = new Collection();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = ids[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var id = _step.value;

          var message = channel.messages.get(id);
          if (message) messages.set(message.id, message);
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

      if (messages.size > 0) client.emit(Constants.Events.MESSAGE_BULK_DELETE, messages);
      return {
        messages: messages
      };
    }
  }]);

  return MessageDeleteBulkAction;
}(Action);

module.exports = MessageDeleteBulkAction;