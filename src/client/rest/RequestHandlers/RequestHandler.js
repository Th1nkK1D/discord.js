"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A base class for different types of rate limiting handlers for the REST API.
 * @private
 */
var RequestHandler = function () {
  /**
   * @param {RESTManager} restManager The REST manager to use
   */
  function RequestHandler(restManager) {
    _classCallCheck(this, RequestHandler);

    /**
     * The RESTManager that instantiated this RequestHandler
     * @type {RESTManager}
     */
    this.restManager = restManager;

    /**
     * A list of requests that have yet to be processed.
     * @type {APIRequest[]}
     */
    this.queue = [];
  }

  /**
   * Whether or not the client is being rate limited on every endpoint.
   * @type {boolean}
   */


  _createClass(RequestHandler, [{
    key: "push",


    /**
     * Push a new API request into this bucket
     * @param {APIRequest} request The new request to push into the queue
     */
    value: function push(request) {
      this.queue.push(request);
    }

    /**
     * Attempts to get this RequestHandler to process its current queue
     */

  }, {
    key: "handle",
    value: function handle() {} // eslint-disable-line no-empty-function

  }, {
    key: "globalLimit",
    get: function get() {
      return this.restManager.globallyRateLimited;
    },
    set: function set(value) {
      this.restManager.globallyRateLimited = value;
    }
  }]);

  return RequestHandler;
}();

module.exports = RequestHandler;