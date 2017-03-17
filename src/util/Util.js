'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var superagent = require('superagent');
var botGateway = require('./Constants').Endpoints.botGateway;

/**
 * Contains various general-purpose utility methods. These functions are also available on the base `Discord` object.
 */

var Util = function () {
  function Util() {
    _classCallCheck(this, Util);

    throw new Error('The ' + this.constructor.name + ' class may not be instantiated.');
  }

  /**
   * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
   * @param {string} text Content to split
   * @param {SplitOptions} [options] Options controlling the behaviour of the split
   * @returns {string|string[]}
   */


  _createClass(Util, null, [{
    key: 'splitMessage',
    value: function splitMessage(text) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$maxLength = _ref.maxLength,
          maxLength = _ref$maxLength === undefined ? 1950 : _ref$maxLength,
          _ref$char = _ref.char,
          char = _ref$char === undefined ? '\n' : _ref$char,
          _ref$prepend = _ref.prepend,
          prepend = _ref$prepend === undefined ? '' : _ref$prepend,
          _ref$append = _ref.append,
          append = _ref$append === undefined ? '' : _ref$append;

      if (text.length <= maxLength) return text;
      var splitText = text.split(char);
      if (splitText.length === 1) throw new Error('Message exceeds the max length and contains no split characters.');
      var messages = [''];
      var msg = 0;
      for (var i = 0; i < splitText.length; i++) {
        if (messages[msg].length + splitText[i].length + 1 > maxLength) {
          messages[msg] += append;
          messages.push(prepend);
          msg++;
        }
        messages[msg] += (messages[msg].length > 0 && messages[msg] !== prepend ? char : '') + splitText[i];
      }
      return messages;
    }

    /**
     * Escapes any Discord-flavour markdown in a string.
     * @param {string} text Content to escape
     * @param {boolean} [onlyCodeBlock=false] Whether to only escape codeblocks (takes priority)
     * @param {boolean} [onlyInlineCode=false] Whether to only escape inline code
     * @returns {string}
     */

  }, {
    key: 'escapeMarkdown',
    value: function escapeMarkdown(text) {
      var onlyCodeBlock = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var onlyInlineCode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (onlyCodeBlock) return text.replace(/```/g, '`\u200B``');
      if (onlyInlineCode) return text.replace(/\\(`|\\)/g, '$1').replace(/(`|\\)/g, '\\$1');
      return text.replace(/\\(\*|_|`|~|\\)/g, '$1').replace(/(\*|_|`|~|\\)/g, '\\$1');
    }

    /**
     * Gets the recommended shard count from Discord.
     * @param {string} token Discord auth token
     * @param {number} [guildsPerShard=1000] Number of guilds per shard
     * @returns {Promise<number>} the recommended number of shards
     */

  }, {
    key: 'fetchRecommendedShards',
    value: function fetchRecommendedShards(token) {
      var guildsPerShard = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;

      return new Promise(function (resolve, reject) {
        if (!token) throw new Error('A token must be provided.');
        superagent.get(botGateway).set('Authorization', 'Bot ' + token.replace(/^Bot\s*/i, '')).end(function (err, res) {
          if (err) reject(err);
          resolve(res.body.shards * (1000 / guildsPerShard));
        });
      });
    }

    /**
     * Parses emoji info out of a string. The string must be one of:
     * - A UTF-8 emoji (no ID)
     * - A URL-encoded UTF-8 emoji (no ID)
     * - A Discord custom emoji (`<:name:id>`)
     * @param {string} text Emoji string to parse
     * @returns {Object} Object with `name` and `id` properties
     * @private
     */

  }, {
    key: 'parseEmoji',
    value: function parseEmoji(text) {
      if (text.includes('%')) text = decodeURIComponent(text);
      if (text.includes(':')) {
        var _text$split = text.split(':'),
            _text$split2 = _slicedToArray(_text$split, 2),
            name = _text$split2[0],
            id = _text$split2[1];

        return { name: name, id: id };
      } else {
        return {
          name: text,
          id: null
        };
      }
    }

    /**
     * Does some weird shit to test the equality of two arrays' elements.
     * <warn>Do not use. This will give your dog/cat severe untreatable cancer of the everything. RIP Fluffykins.</warn>
     * @param {Array<*>} a ????
     * @param {Array<*>} b ?????????
     * @returns {boolean}
     * @private
     */

  }, {
    key: 'arraysEqual',
    value: function arraysEqual(a, b) {
      if (a === b) return true;
      if (a.length !== b.length) return false;

      for (var itemInd in a) {
        var item = a[itemInd];
        var ind = b.indexOf(item);
        if (ind) b.splice(ind, 1);
      }

      return b.length === 0;
    }

    /**
     * Shallow-copies an object with its class/prototype intact.
     * @param {Object} obj Object to clone
     * @returns {Object}
     * @private
     */

  }, {
    key: 'cloneObject',
    value: function cloneObject(obj) {
      return Object.assign(Object.create(obj), obj);
    }

    /**
     * Sets default properties on an object that aren't already specified.
     * @param {Object} def Default properties
     * @param {Object} given Object to assign defaults to
     * @returns {Object}
     * @private
     */

  }, {
    key: 'mergeDefault',
    value: function mergeDefault(def, given) {
      if (!given) return def;
      for (var key in def) {
        if (!{}.hasOwnProperty.call(given, key)) {
          given[key] = def[key];
        } else if (given[key] === Object(given[key])) {
          given[key] = this.mergeDefault(def[key], given[key]);
        }
      }

      return given;
    }

    /**
     * Converts an ArrayBuffer or string to a Buffer.
     * @param {ArrayBuffer|string} ab ArrayBuffer to convert
     * @returns {Buffer}
     * @private
     */

  }, {
    key: 'convertToBuffer',
    value: function convertToBuffer(ab) {
      if (typeof ab === 'string') ab = this.str2ab(ab);
      return Buffer.from(ab);
    }

    /**
     * Converts a string to an ArrayBuffer.
     * @param {string} str String to convert
     * @returns {ArrayBuffer}
     * @private
     */

  }, {
    key: 'str2ab',
    value: function str2ab(str) {
      var buffer = new ArrayBuffer(str.length * 2);
      var view = new Uint16Array(buffer);
      for (var i = 0, strLen = str.length; i < strLen; i++) {
        view[i] = str.charCodeAt(i);
      }return buffer;
    }

    /**
     * Makes an Error from a plain info object
     * @param {Object} obj Error info
     * @param {string} obj.name Error type
     * @param {string} obj.message Message for the error
     * @param {string} obj.stack Stack for the error
     * @returns {Error}
     * @private
     */

  }, {
    key: 'makeError',
    value: function makeError(obj) {
      var err = new Error(obj.message);
      err.name = obj.name;
      err.stack = obj.stack;
      return err;
    }

    /**
     * Makes a plain error info object from an Error
     * @param {Error} err Error to get info from
     * @returns {Object}
     * @private
     */

  }, {
    key: 'makePlainError',
    value: function makePlainError(err) {
      var obj = {};
      obj.name = err.name;
      obj.message = err.message;
      obj.stack = err.stack;
      return obj;
    }

    /**
     * Moves an element in an array *in place*
     * @param {Array<*>} array Array to modify
     * @param {*} element Element to move
     * @param {number} newIndex Index or offset to move the element to
     * @param {boolean} [offset=false] Move the element by an offset amount rather than to a set index
     * @returns {Array<*>}
     * @private
     */

  }, {
    key: 'moveElementInArray',
    value: function moveElementInArray(array, element, newIndex) {
      var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var index = array.indexOf(element);
      newIndex = (offset ? index : 0) + newIndex;
      if (newIndex > -1 && newIndex < array.length) {
        var removedElement = array.splice(index, 1)[0];
        array.splice(newIndex, 0, removedElement);
      }
      return array;
    }
  }]);

  return Util;
}();

module.exports = Util;