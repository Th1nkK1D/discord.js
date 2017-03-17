'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents an attachment in a message
 */
var MessageAttachment = function () {
  function MessageAttachment(message, data) {
    _classCallCheck(this, MessageAttachment);

    /**
     * The Client that instantiated this MessageAttachment.
     * @name MessageAttachment#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: message.client });

    /**
     * The message this attachment is part of.
     * @type {Message}
     */
    this.message = message;

    this.setup(data);
  }

  _createClass(MessageAttachment, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The ID of this attachment
       * @type {Snowflake}
       */
      this.id = data.id;

      /**
       * The file name of this attachment
       * @type {string}
       */
      this.filename = data.filename;

      /**
       * The size of this attachment in bytes
       * @type {number}
       */
      this.filesize = data.size;

      /**
       * The URL to this attachment
       * @type {string}
       */
      this.url = data.url;

      /**
       * The Proxy URL to this attachment
       * @type {string}
       */
      this.proxyURL = data.proxy_url;

      /**
       * The height of this attachment (if an image)
       * @type {?number}
       */
      this.height = data.height;

      /**
       * The width of this attachment (if an image)
       * @type {?number}
       */
      this.width = data.width;
    }
  }]);

  return MessageAttachment;
}();

module.exports = MessageAttachment;