'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Webhook = require('../structures/Webhook');
var RESTManager = require('./rest/RESTManager');
var ClientDataResolver = require('./ClientDataResolver');
var Constants = require('../util/Constants');
var Util = require('../util/Util');

/**
 * The Webhook Client
 * @extends {Webhook}
 */

var WebhookClient = function (_Webhook) {
  _inherits(WebhookClient, _Webhook);

  /**
   * @param {Snowflake} id ID of the webhook
   * @param {string} token Token of the webhook
   * @param {ClientOptions} [options] Options for the client
   * @example
   * // create a new webhook and send a message
   * const hook = new Discord.WebhookClient('1234', 'abcdef');
   * hook.sendMessage('This will send a message').catch(console.error);
   */
  function WebhookClient(id, token, options) {
    _classCallCheck(this, WebhookClient);

    /**
     * The options the client was instantiated with
     * @type {ClientOptions}
     */
    var _this = _possibleConstructorReturn(this, (WebhookClient.__proto__ || Object.getPrototypeOf(WebhookClient)).call(this, null, id, token));

    _this.options = Util.mergeDefault(Constants.DefaultOptions, options);

    /**
     * The REST manager of the client
     * @type {RESTManager}
     * @private
     */
    _this.rest = new RESTManager(_this);

    /**
     * The data resolver of the client
     * @type {ClientDataResolver}
     * @private
     */
    _this.resolver = new ClientDataResolver(_this);

    /**
     * Timeouts set by {@link WebhookClient#setTimeout} that are still active
     * @type {Set<Timeout>}
     * @private
     */
    _this._timeouts = new Set();

    /**
     * Intervals set by {@link WebhookClient#setInterval} that are still active
     * @type {Set<Timeout>}
     * @private
     */
    _this._intervals = new Set();
    return _this;
  }

  /**
   * Sets a timeout that will be automatically cancelled if the client is destroyed.
   * @param {Function} fn Function to execute
   * @param {number} delay Time to wait before executing (in milliseconds)
   * @param {...*} args Arguments for the function
   * @returns {Timeout}
   */


  _createClass(WebhookClient, [{
    key: 'setTimeout',
    value: function (_setTimeout) {
      function setTimeout(_x, _x2) {
        return _setTimeout.apply(this, arguments);
      }

      setTimeout.toString = function () {
        return _setTimeout.toString();
      };

      return setTimeout;
    }(function (fn, delay) {
      var _this2 = this;

      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var timeout = setTimeout.apply(undefined, [function () {
        fn();
        _this2._timeouts.delete(timeout);
      }, delay].concat(args));
      this._timeouts.add(timeout);
      return timeout;
    })

    /**
     * Clears a timeout.
     * @param {Timeout} timeout Timeout to cancel
     */

  }, {
    key: 'clearTimeout',
    value: function (_clearTimeout) {
      function clearTimeout(_x3) {
        return _clearTimeout.apply(this, arguments);
      }

      clearTimeout.toString = function () {
        return _clearTimeout.toString();
      };

      return clearTimeout;
    }(function (timeout) {
      clearTimeout(timeout);
      this._timeouts.delete(timeout);
    })

    /**
     * Sets an interval that will be automatically cancelled if the client is destroyed.
     * @param {Function} fn Function to execute
     * @param {number} delay Time to wait before executing (in milliseconds)
     * @param {...*} args Arguments for the function
     * @returns {Timeout}
     */

  }, {
    key: 'setInterval',
    value: function (_setInterval) {
      function setInterval(_x4, _x5) {
        return _setInterval.apply(this, arguments);
      }

      setInterval.toString = function () {
        return _setInterval.toString();
      };

      return setInterval;
    }(function (fn, delay) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      var interval = setInterval.apply(undefined, [fn, delay].concat(args));
      this._intervals.add(interval);
      return interval;
    })

    /**
     * Clears an interval.
     * @param {Timeout} interval Interval to cancel
     */

  }, {
    key: 'clearInterval',
    value: function (_clearInterval) {
      function clearInterval(_x6) {
        return _clearInterval.apply(this, arguments);
      }

      clearInterval.toString = function () {
        return _clearInterval.toString();
      };

      return clearInterval;
    }(function (interval) {
      clearInterval(interval);
      this._intervals.delete(interval);
    })

    /**
     * Destroys the client.
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._timeouts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var t = _step.value;
          clearTimeout(t);
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._intervals[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var i = _step2.value;
          clearInterval(i);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this._timeouts.clear();
      this._intervals.clear();
    }
  }]);

  return WebhookClient;
}(Webhook);

module.exports = WebhookClient;