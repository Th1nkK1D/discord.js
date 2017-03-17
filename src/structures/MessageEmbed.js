'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents an embed in a message (image/video preview, rich embed, etc.)
 * <info>This class is only used for *recieved* embeds. If you wish to send one, use the {@link RichEmbed} class.</info>
 */
var MessageEmbed = function () {
  function MessageEmbed(message, data) {
    _classCallCheck(this, MessageEmbed);

    /**
     * The client that instantiated this embed
     * @name MessageEmbed#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: message.client });

    /**
     * The message this embed is part of
     * @type {Message}
     */
    this.message = message;

    this.setup(data);
  }

  _createClass(MessageEmbed, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The type of this embed
       * @type {string}
       */
      this.type = data.type;

      /**
       * The title of this embed, if there is one
       * @type {?string}
       */
      this.title = data.title;

      /**
       * The description of this embed, if there is one
       * @type {?string}
       */
      this.description = data.description;

      /**
       * The URL of this embed
       * @type {string}
       */
      this.url = data.url;

      /**
       * The color of the embed
       * @type {number}
       */
      this.color = data.color;

      /**
       * The fields of this embed
       * @type {MessageEmbedField[]}
       */
      this.fields = [];
      if (data.fields) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = data.fields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _field = _step.value;
            this.fields.push(new MessageEmbedField(this, _field));
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
      } /**
         * The timestamp of this embed
         * @type {number}
         */
      this.createdTimestamp = data.timestamp;

      /**
       * The thumbnail of this embed, if there is one
       * @type {MessageEmbedThumbnail}
       */
      this.thumbnail = data.thumbnail ? new MessageEmbedThumbnail(this, data.thumbnail) : null;

      /**
       * The author of this embed, if there is one
       * @type {MessageEmbedAuthor}
       */
      this.author = data.author ? new MessageEmbedAuthor(this, data.author) : null;

      /**
       * The provider of this embed, if there is one
       * @type {MessageEmbedProvider}
       */
      this.provider = data.provider ? new MessageEmbedProvider(this, data.provider) : null;

      /**
       * The footer of this embed
       * @type {MessageEmbedFooter}
       */
      this.footer = data.footer ? new MessageEmbedFooter(this, data.footer) : null;
    }

    /**
     * The date this embed was created
     * @type {Date}
     */

  }, {
    key: 'createdAt',
    get: function get() {
      return new Date(this.createdTimestamp);
    }

    /**
     * The hexadecimal version of the embed color, with a leading hash.
     * @type {string}
     * @readonly
     */

  }, {
    key: 'hexColor',
    get: function get() {
      var col = this.color.toString(16);
      while (col.length < 6) {
        col = '0' + col;
      }return '#' + col;
    }
  }]);

  return MessageEmbed;
}();

/**
 * Represents a thumbnail for a message embed
 */


var MessageEmbedThumbnail = function () {
  function MessageEmbedThumbnail(embed, data) {
    _classCallCheck(this, MessageEmbedThumbnail);

    /**
     * The embed this thumbnail is part of
     * @type {MessageEmbed}
     */
    this.embed = embed;

    this.setup(data);
  }

  _createClass(MessageEmbedThumbnail, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The URL for this thumbnail
       * @type {string}
       */
      this.url = data.url;

      /**
       * The Proxy URL for this thumbnail
       * @type {string}
       */
      this.proxyURL = data.proxy_url;

      /**
       * The height of the thumbnail
       * @type {number}
       */
      this.height = data.height;

      /**
       * The width of the thumbnail
       * @type {number}
       */
      this.width = data.width;
    }
  }]);

  return MessageEmbedThumbnail;
}();

/**
 * Represents a provider for a message embed
 */


var MessageEmbedProvider = function () {
  function MessageEmbedProvider(embed, data) {
    _classCallCheck(this, MessageEmbedProvider);

    /**
     * The embed this provider is part of
     * @type {MessageEmbed}
     */
    this.embed = embed;

    this.setup(data);
  }

  _createClass(MessageEmbedProvider, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The name of this provider
       * @type {string}
       */
      this.name = data.name;

      /**
       * The URL of this provider
       * @type {string}
       */
      this.url = data.url;
    }
  }]);

  return MessageEmbedProvider;
}();

/**
 * Represents an author for a message embed
 */


var MessageEmbedAuthor = function () {
  function MessageEmbedAuthor(embed, data) {
    _classCallCheck(this, MessageEmbedAuthor);

    /**
     * The embed this author is part of
     * @type {MessageEmbed}
     */
    this.embed = embed;

    this.setup(data);
  }

  _createClass(MessageEmbedAuthor, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The name of this author
       * @type {string}
       */
      this.name = data.name;

      /**
       * The URL of this author
       * @type {string}
       */
      this.url = data.url;

      /**
       * The icon URL of this author
       * @type {string}
       */
      this.iconURL = data.icon_url;
    }
  }]);

  return MessageEmbedAuthor;
}();

/**
 * Represents a field for a message embed
 */


var MessageEmbedField = function () {
  function MessageEmbedField(embed, data) {
    _classCallCheck(this, MessageEmbedField);

    /**
     * The embed this footer is part of
     * @type {MessageEmbed}
     */
    this.embed = embed;

    this.setup(data);
  }

  _createClass(MessageEmbedField, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The name of this field
       * @type {string}
       */
      this.name = data.name;

      /**
       * The value of this field
       * @type {string}
       */
      this.value = data.value;

      /**
       * If this field is displayed inline
       * @type {boolean}
       */
      this.inline = data.inline;
    }
  }]);

  return MessageEmbedField;
}();

/**
 * Represents the footer of a message embed
 */


var MessageEmbedFooter = function () {
  function MessageEmbedFooter(embed, data) {
    _classCallCheck(this, MessageEmbedFooter);

    /**
     * The embed this footer is part of
     * @type {MessageEmbed}
     */
    this.embed = embed;

    this.setup(data);
  }

  _createClass(MessageEmbedFooter, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The text in this footer
       * @type {string}
       */
      this.text = data.text;

      /**
       * The icon URL of this footer
       * @type {string}
       */
      this.iconURL = data.icon_url;

      /**
       * The proxy icon URL of this footer
       * @type {string}
       */
      this.proxyIconUrl = data.proxy_icon_url;
    }
  }]);

  return MessageEmbedFooter;
}();

MessageEmbed.Thumbnail = MessageEmbedThumbnail;
MessageEmbed.Provider = MessageEmbedProvider;
MessageEmbed.Author = MessageEmbedAuthor;
MessageEmbed.Field = MessageEmbedField;
MessageEmbed.Footer = MessageEmbedFooter;

module.exports = MessageEmbed;