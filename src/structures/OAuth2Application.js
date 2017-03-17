'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Snowflake = require('../util/Snowflake');

/**
 * Represents an OAuth2 Application
 */

var OAuth2Application = function () {
  function OAuth2Application(client, data) {
    _classCallCheck(this, OAuth2Application);

    /**
     * The client that instantiated the application
     * @name OAuth2Application#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    this.setup(data);
  }

  _createClass(OAuth2Application, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The ID of the app
       * @type {Snowflake}
       */
      this.id = data.id;

      /**
       * The name of the app
       * @type {string}
       */
      this.name = data.name;

      /**
       * The app's description
       * @type {string}
       */
      this.description = data.description;

      /**
       * The app's icon hash
       * @type {string}
       */
      this.icon = data.icon;

      /**
       * The app's icon URL
       * @type {string}
       */
      this.iconURL = 'https://cdn.discordapp.com/app-icons/' + this.id + '/' + this.icon + '.jpg';

      /**
       * The app's RPC origins
       * @type {?string[]}
       */
      this.rpcOrigins = data.rpc_origins;

      /**
       * The app's redirect URIs
       * @type {string[]}
       */
      this.redirectURIs = data.redirect_uris;

      /**
       * If this app's bot requires a code grant when using the oauth2 flow
       * @type {boolean}
       */
      this.botRequireCodeGrant = data.bot_require_code_grant;

      /**
       * If this app's bot is public
       * @type {boolean}
       */
      this.botPublic = data.bot_public;

      /**
       * If this app can use rpc
       * @type {boolean}
       */
      this.rpcApplicationState = data.rpc_application_state;

      /**
       * Object containing basic info about this app's bot
       * @type {Object}
       */
      this.bot = data.bot;

      /**
       * Flags for the app
       * @type {number}
       */
      this.flags = data.flags;

      /**
       * OAuth2 secret for the application
       * @type {boolean}
       */
      this.secret = data.secret;
    }

    /**
     * The timestamp the app was created at
     * @type {number}
     * @readonly
     */

  }, {
    key: 'reset',


    /**
     * Reset the app's secret and bot token
     * @returns {OAuth2Application}
     */
    value: function reset() {
      return this.client.rest.methods.resetApplication(this.id);
    }

    /**
     * When concatenated with a string, this automatically concatenates the app name rather than the app object.
     * @returns {string}
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.name;
    }
  }, {
    key: 'createdTimestamp',
    get: function get() {
      return Snowflake.deconstruct(this.id).timestamp;
    }

    /**
     * The time the app was created
     * @type {Date}
     * @readonly
     */

  }, {
    key: 'createdAt',
    get: function get() {
      return new Date(this.createdTimestamp);
    }
  }]);

  return OAuth2Application;
}();

module.exports = OAuth2Application;