'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Constants = require('../../util/Constants');

var UserAgentManager = function () {
  function UserAgentManager(restManager) {
    _classCallCheck(this, UserAgentManager);

    this.restManager = restManager;
    this._userAgent = {
      url: 'https://github.com/hydrabolt/discord.js',
      version: Constants.Package.version
    };
  }

  _createClass(UserAgentManager, [{
    key: 'set',
    value: function set(info) {
      this._userAgent.url = info.url || 'https://github.com/hydrabolt/discord.js';
      this._userAgent.version = info.version || Constants.Package.version;
    }
  }, {
    key: 'userAgent',
    get: function get() {
      return 'DiscordBot (' + this._userAgent.url + ', ' + this._userAgent.version + ')';
    }
  }]);

  return UserAgentManager;
}();

module.exports = UserAgentManager;