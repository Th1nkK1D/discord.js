'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('superagent');
var Constants = require('../../util/Constants');

var APIRequest = function () {
  function APIRequest(rest, method, url, auth, data, files) {
    _classCallCheck(this, APIRequest);

    this.rest = rest;
    this.method = method;
    this.url = url;
    this.auth = auth;
    this.data = data;
    this.files = files;
    this.route = this.getRoute(this.url);
  }

  _createClass(APIRequest, [{
    key: 'getRoute',
    value: function getRoute(url) {
      var route = url.split('?')[0];
      if (route.includes('/channels/') || route.includes('/guilds/')) {
        var startInd = route.includes('/channels/') ? route.indexOf('/channels/') : route.indexOf('/guilds/');
        var majorID = route.substring(startInd).split('/')[2];
        route = route.replace(/(\d{8,})/g, ':id').replace(':id', majorID);
      }
      return route;
    }
  }, {
    key: 'getAuth',
    value: function getAuth() {
      if (this.rest.client.token && this.rest.client.user && this.rest.client.user.bot) {
        return 'Bot ' + this.rest.client.token;
      } else if (this.rest.client.token) {
        return this.rest.client.token;
      }
      throw new Error(Constants.Errors.NO_TOKEN);
    }
  }, {
    key: 'gen',
    value: function gen() {
      var apiRequest = request[this.method](this.url);
      if (this.auth) apiRequest.set('authorization', this.getAuth());
      if (this.files) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var file = _step.value;
            if (file && file.file) apiRequest.attach(file.name, file.file, file.name);
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

        this.data = this.data || {};
        apiRequest.field('payload_json', JSON.stringify(this.data));
      } else if (this.data) {
        apiRequest.send(this.data);
      }
      if (!this.rest.client.browser) apiRequest.set('User-Agent', this.rest.userAgentManager.userAgent);
      return apiRequest;
    }
  }]);

  return APIRequest;
}();

module.exports = APIRequest;