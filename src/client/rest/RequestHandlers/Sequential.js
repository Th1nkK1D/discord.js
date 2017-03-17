'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RequestHandler = require('./RequestHandler');

/**
 * Handles API Requests sequentially, i.e. we wait until the current request is finished before moving onto
 * the next. This plays a _lot_ nicer in terms of avoiding 429's when there is more than one session of the account,
 * but it can be slower.
 * @extends {RequestHandler}
 * @private
 */

var SequentialRequestHandler = function (_RequestHandler) {
  _inherits(SequentialRequestHandler, _RequestHandler);

  /**
   * @param {RESTManager} restManager The REST manager to use
   * @param {string} endpoint The endpoint to handle
   */
  function SequentialRequestHandler(restManager, endpoint) {
    _classCallCheck(this, SequentialRequestHandler);

    /**
     * The endpoint that this handler is handling
     * @type {string}
     */
    var _this = _possibleConstructorReturn(this, (SequentialRequestHandler.__proto__ || Object.getPrototypeOf(SequentialRequestHandler)).call(this, restManager, endpoint));

    _this.endpoint = endpoint;

    /**
     * The time difference between Discord's Dates and the local computer's Dates. A positive number means the local
     * computer's time is ahead of Discord's.
     * @type {number}
     */
    _this.timeDifference = 0;
    return _this;
  }

  _createClass(SequentialRequestHandler, [{
    key: 'push',
    value: function push(request) {
      _get(SequentialRequestHandler.prototype.__proto__ || Object.getPrototypeOf(SequentialRequestHandler.prototype), 'push', this).call(this, request);
      this.handle();
    }

    /**
     * Performs a request then resolves a promise to indicate its readiness for a new request
     * @param {APIRequest} item The item to execute
     * @returns {Promise<?Object|Error>}
     */

  }, {
    key: 'execute',
    value: function execute(item) {
      var _this2 = this;

      return new Promise(function (resolve) {
        item.request.gen().end(function (err, res) {
          if (res && res.headers) {
            _this2.requestLimit = Number(res.headers['x-ratelimit-limit']);
            _this2.requestResetTime = Number(res.headers['x-ratelimit-reset']) * 1000;
            _this2.requestRemaining = Number(res.headers['x-ratelimit-remaining']);
            _this2.timeDifference = Date.now() - new Date(res.headers.date).getTime();
          }
          if (err) {
            if (err.status === 429) {
              _this2.queue.unshift(item);
              _this2.restManager.client.setTimeout(function () {
                _this2.globalLimit = false;
                resolve();
              }, Number(res.headers['retry-after']) + _this2.restManager.client.options.restTimeOffset);
              if (res.headers['x-ratelimit-global']) _this2.globalLimit = true;
            } else {
              item.reject(err);
              resolve(err);
            }
          } else {
            _this2.globalLimit = false;
            var data = res && res.body ? res.body : {};
            item.resolve(data);
            if (_this2.requestRemaining === 0) {
              _this2.restManager.client.setTimeout(function () {
                _this2.waiting = false;
                resolve(data);
              }, _this2.requestResetTime - Date.now() + _this2.timeDifference + _this2.restManager.client.options.restTimeOffset);
            } else {
              resolve(data);
            }
          }
        });
      });
    }
  }, {
    key: 'handle',
    value: function handle() {
      var _this3 = this;

      _get(SequentialRequestHandler.prototype.__proto__ || Object.getPrototypeOf(SequentialRequestHandler.prototype), 'handle', this).call(this);
      if (this.remaining === 0 || this.queue.length === 0 || this.globalLimit) return;
      this.execute(this.queue.shift()).then(function () {
        return _this3.handle();
      });
    }
  }]);

  return SequentialRequestHandler;
}(RequestHandler);

module.exports = SequentialRequestHandler;