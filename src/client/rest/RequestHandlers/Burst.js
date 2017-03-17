'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RequestHandler = require('./RequestHandler');

var BurstRequestHandler = function (_RequestHandler) {
  _inherits(BurstRequestHandler, _RequestHandler);

  function BurstRequestHandler(restManager, endpoint) {
    _classCallCheck(this, BurstRequestHandler);

    var _this = _possibleConstructorReturn(this, (BurstRequestHandler.__proto__ || Object.getPrototypeOf(BurstRequestHandler)).call(this, restManager, endpoint));

    _this.client = restManager.client;

    _this.limit = Infinity;
    _this.resetTime = null;
    _this.remaining = 1;
    _this.timeDifference = 0;

    _this.resetTimeout = null;
    return _this;
  }

  _createClass(BurstRequestHandler, [{
    key: 'push',
    value: function push(request) {
      _get(BurstRequestHandler.prototype.__proto__ || Object.getPrototypeOf(BurstRequestHandler.prototype), 'push', this).call(this, request);
      this.handle();
    }
  }, {
    key: 'execute',
    value: function execute(item) {
      var _this2 = this;

      if (!item) return;
      item.request.gen().end(function (err, res) {
        if (res && res.headers) {
          _this2.limit = Number(res.headers['x-ratelimit-limit']);
          _this2.resetTime = Number(res.headers['x-ratelimit-reset']) * 1000;
          _this2.remaining = Number(res.headers['x-ratelimit-remaining']);
          _this2.timeDifference = Date.now() - new Date(res.headers.date).getTime();
        }
        if (err) {
          if (err.status === 429) {
            _this2.queue.unshift(item);
            if (res.headers['x-ratelimit-global']) _this2.globalLimit = true;
            if (_this2.resetTimeout) return;
            _this2.resetTimeout = _this2.client.setTimeout(function () {
              _this2.remaining = _this2.limit;
              _this2.globalLimit = false;
              _this2.handle();
              _this2.resetTimeout = null;
            }, Number(res.headers['retry-after']) + _this2.client.options.restTimeOffset);
          } else {
            item.reject(err);
            _this2.handle();
          }
        } else {
          _this2.globalLimit = false;
          var data = res && res.body ? res.body : {};
          item.resolve(data);
          _this2.handle();
        }
      });
    }
  }, {
    key: 'handle',
    value: function handle() {
      _get(BurstRequestHandler.prototype.__proto__ || Object.getPrototypeOf(BurstRequestHandler.prototype), 'handle', this).call(this);
      if (this.remaining <= 0 || this.queue.length === 0 || this.globalLimit) return;
      this.execute(this.queue.shift());
      this.remaining--;
      this.handle();
    }
  }]);

  return BurstRequestHandler;
}(RequestHandler);

module.exports = BurstRequestHandler;