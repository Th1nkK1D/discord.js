'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a user's presence
 */
var Presence = function () {
  function Presence() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Presence);

    /**
     * The status of the presence:
     *
     * * **`online`** - user is online
     * * **`offline`** - user is offline or invisible
     * * **`idle`** - user is AFK
     * * **`dnd`** - user is in Do not Disturb
     * @type {string}
     */
    this.status = data.status || 'offline';

    /**
     * The game that the user is playing, `null` if they aren't playing a game.
     * @type {?Game}
     */
    this.game = data.game ? new Game(data.game) : null;
  }

  _createClass(Presence, [{
    key: 'update',
    value: function update(data) {
      this.status = data.status || this.status;
      this.game = data.game ? new Game(data.game) : null;
    }

    /**
     * Whether this presence is equal to another
     * @param {Presence} presence Presence to compare with
     * @returns {boolean}
     */

  }, {
    key: 'equals',
    value: function equals(presence) {
      return this === presence || (presence && this.status === presence.status && this.game ? this.game.equals(presence.game) : !presence.game);
    }
  }]);

  return Presence;
}();

/**
 * Represents a game that is part of a user's presence.
 */


var Game = function () {
  function Game(data) {
    _classCallCheck(this, Game);

    /**
     * The name of the game being played
     * @type {string}
     */
    this.name = data.name;

    /**
     * The type of the game status
     * @type {number}
     */
    this.type = data.type;

    /**
     * If the game is being streamed, a link to the stream
     * @type {?string}
     */
    this.url = data.url || null;
  }

  /**
   * Whether or not the game is being streamed
   * @type {boolean}
   * @readonly
   */


  _createClass(Game, [{
    key: 'equals',


    /**
     * Whether this game is equal to another game
     * @param {Game} game Game to compare with
     * @returns {boolean}
     */
    value: function equals(game) {
      return this === game || game && this.name === game.name && this.type === game.type && this.url === game.url;
    }
  }, {
    key: 'streaming',
    get: function get() {
      return this.type === 1;
    }
  }]);

  return Game;
}();

exports.Presence = Presence;
exports.Game = Game;