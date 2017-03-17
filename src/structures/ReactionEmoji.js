"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a limited emoji set used for both custom and unicode emojis. Custom emojis
 * will use this class opposed to the Emoji class when the client doesn't know enough
 * information about them.
 */
var ReactionEmoji = function () {
  function ReactionEmoji(reaction, name, id) {
    _classCallCheck(this, ReactionEmoji);

    /**
     * The message reaction this emoji refers to
     * @type {MessageReaction}
     */
    this.reaction = reaction;

    /**
     * The name of this reaction emoji.
     * @type {string}
     */
    this.name = name;

    /**
     * The ID of this reaction emoji.
     * @type {?Snowflake}
     */
    this.id = id;
  }

  /**
   * The identifier of this emoji, used for message reactions
   * @type {string}
   * @readonly
   */


  _createClass(ReactionEmoji, [{
    key: "toString",


    /**
     * Creates the text required to form a graphical emoji on Discord.
     * @example
     * // send the emoji used in a reaction to the channel the reaction is part of
     * reaction.message.channel.sendMessage(`The emoji used is ${reaction.emoji}`);
     * @returns {string}
     */
    value: function toString() {
      return this.id ? "<:" + this.name + ":" + this.id + ">" : this.name;
    }
  }, {
    key: "identifier",
    get: function get() {
      if (this.id) return this.name + ":" + this.id;
      return encodeURIComponent(this.name);
    }
  }]);

  return ReactionEmoji;
}();

module.exports = ReactionEmoji;