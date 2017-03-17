"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a user connection (or "platform identity")
 */
var UserConnection = function () {
  function UserConnection(user, data) {
    _classCallCheck(this, UserConnection);

    /**
     * The user that owns the Connection
     * @type {User}
     */
    this.user = user;

    this.setup(data);
  }

  _createClass(UserConnection, [{
    key: "setup",
    value: function setup(data) {
      /**
       * The type of the Connection
       * @type {string}
       */
      this.type = data.type;

      /**
       * The username of the connection account
       * @type {string}
       */
      this.name = data.name;

      /**
       * The id of the connection account
       * @type {string}
       */
      this.id = data.id;

      /**
       * Whether the connection is revoked
       * @type {boolean}
       */
      this.revoked = data.revoked;

      /**
       * Partial server integrations (not yet implemented)
       * @type {Object[]}
       */
      this.integrations = data.integrations;
    }
  }]);

  return UserConnection;
}();

module.exports = UserConnection;