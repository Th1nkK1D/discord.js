'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractHandler = require('./AbstractHandler');

var RelationshipRemoveHandler = function (_AbstractHandler) {
  _inherits(RelationshipRemoveHandler, _AbstractHandler);

  function RelationshipRemoveHandler() {
    _classCallCheck(this, RelationshipRemoveHandler);

    return _possibleConstructorReturn(this, (RelationshipRemoveHandler.__proto__ || Object.getPrototypeOf(RelationshipRemoveHandler)).apply(this, arguments));
  }

  _createClass(RelationshipRemoveHandler, [{
    key: 'handle',
    value: function handle(packet) {
      var client = this.packetManager.client;
      var data = packet.d;
      if (data.type === 2) {
        if (client.user.blocked.has(data.id)) {
          client.user.blocked.delete(data.id);
        }
      } else if (data.type === 1) {
        if (client.user.friends.has(data.id)) {
          client.user.friends.delete(data.id);
        }
      }
    }
  }]);

  return RelationshipRemoveHandler;
}(AbstractHandler);

module.exports = RelationshipRemoveHandler;