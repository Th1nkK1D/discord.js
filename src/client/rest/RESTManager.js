'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserAgentManager = require('./UserAgentManager');
var RESTMethods = require('./RESTMethods');
var SequentialRequestHandler = require('./RequestHandlers/Sequential');
var BurstRequestHandler = require('./RequestHandlers/Burst');
var APIRequest = require('./APIRequest');
var Constants = require('../../util/Constants');

var RESTManager = function () {
  function RESTManager(client) {
    _classCallCheck(this, RESTManager);

    this.client = client;
    this.handlers = {};
    this.userAgentManager = new UserAgentManager(this);
    this.methods = new RESTMethods(this);
    this.rateLimitedEndpoints = {};
    this.globallyRateLimited = false;
  }

  _createClass(RESTManager, [{
    key: 'push',
    value: function push(handler, apiRequest) {
      return new Promise(function (resolve, reject) {
        handler.push({
          request: apiRequest,
          resolve: resolve,
          reject: reject
        });
      });
    }
  }, {
    key: 'getRequestHandler',
    value: function getRequestHandler() {
      switch (this.client.options.apiRequestMethod) {
        case 'sequential':
          return SequentialRequestHandler;
        case 'burst':
          return BurstRequestHandler;
        default:
          throw new Error(Constants.Errors.INVALID_RATE_LIMIT_METHOD);
      }
    }
  }, {
    key: 'makeRequest',
    value: function makeRequest(method, url, auth, data, file) {
      var apiRequest = new APIRequest(this, method, url, auth, data, file);

      if (!this.handlers[apiRequest.route]) {
        var RequestHandlerType = this.getRequestHandler();
        this.handlers[apiRequest.route] = new RequestHandlerType(this, apiRequest.route);
      }

      return this.push(this.handlers[apiRequest.route], apiRequest);
    }
  }]);

  return RESTManager;
}();

module.exports = RESTManager;