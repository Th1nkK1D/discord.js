'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ClientDataResolver = require('../client/ClientDataResolver');

/**
 * A rich embed to be sent with a message with a fluent interface for creation
 * @param {Object} [data] Data to set in the rich embed
 */

var RichEmbed = function () {
  function RichEmbed() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RichEmbed);

    /**
     * Title for this Embed
     * @type {string}
     */
    this.title = data.title;

    /**
     * Description for this Embed
     * @type {string}
     */
    this.description = data.description;

    /**
     * URL for this Embed
     * @type {string}
     */
    this.url = data.url;

    /**
     * Color for this Embed
     * @type {number}
     */
    this.color = data.color;

    /**
     * Author for this Embed
     * @type {Object}
     */
    this.author = data.author;

    /**
     * Timestamp for this Embed
     * @type {Date}
     */
    this.timestamp = data.timestamp;

    /**
     * Fields for this Embed
     * @type {Object[]}
     */
    this.fields = data.fields || [];

    /**
     * Thumbnail for this Embed
     * @type {Object}
     */
    this.thumbnail = data.thumbnail;

    /**
     * Image for this Embed
     * @type {Object}
     */
    this.image = data.image;

    /**
     * Footer for this Embed
     * @type {Object}
     */
    this.footer = data.footer;

    /**
     * File to upload alongside this Embed
     * @type {string}
     */
    this.file = data.file;
  }

  /**
   * Sets the title of this embed
   * @param {StringResolvable} title The title
   * @returns {RichEmbed} This embed
   */


  _createClass(RichEmbed, [{
    key: 'setTitle',
    value: function setTitle(title) {
      title = resolveString(title);
      if (title.length > 256) throw new RangeError('RichEmbed titles may not exceed 256 characters.');
      this.title = title;
      return this;
    }

    /**
     * Sets the description of this embed
     * @param {StringResolvable} description The description
     * @returns {RichEmbed} This embed
     */

  }, {
    key: 'setDescription',
    value: function setDescription(description) {
      description = resolveString(description);
      if (description.length > 2048) throw new RangeError('RichEmbed descriptions may not exceed 2048 characters.');
      this.description = description;
      return this;
    }

    /**
     * Sets the URL of this embed
     * @param {string} url The URL
     * @returns {RichEmbed} This embed
     */

  }, {
    key: 'setURL',
    value: function setURL(url) {
      this.url = url;
      return this;
    }

    /**
     * Sets the color of this embed
     * @param {ColorResolvable} color The color of the embed
     * @returns {RichEmbed} This embed
     */

  }, {
    key: 'setColor',
    value: function setColor(color) {
      this.color = ClientDataResolver.resolveColor(color);
      return this;
    }

    /**
     * Sets the author of this embed
     * @param {StringResolvable} name The name of the author
     * @param {string} [icon] The icon URL of the author
     * @param {string} [url] The URL of the author
     * @returns {RichEmbed} This embed
     */

  }, {
    key: 'setAuthor',
    value: function setAuthor(name, icon, url) {
      this.author = { name: resolveString(name), icon_url: icon, url: url };
      return this;
    }

    /**
     * Sets the timestamp of this embed
     * @param {Date} [timestamp=current date] The timestamp
     * @returns {RichEmbed} This embed
     */

  }, {
    key: 'setTimestamp',
    value: function setTimestamp() {
      var timestamp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();

      this.timestamp = timestamp;
      return this;
    }

    /**
     * Adds a field to the embed (max 25)
     * @param {StringResolvable} name The name of the field
     * @param {StringResolvable} value The value of the field
     * @param {boolean} [inline=false] Set the field to display inline
     * @returns {RichEmbed} This embed
     */

  }, {
    key: 'addField',
    value: function addField(name, value) {
      var inline = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (this.fields.length >= 25) throw new RangeError('RichEmbeds may not exceed 25 fields.');
      name = resolveString(name);
      if (name.length > 256) throw new RangeError('RichEmbed field names may not exceed 256 characters.');
      if (!/\S/.test(name)) throw new RangeError('RichEmbed field names may not be empty.');
      value = resolveString(value);
      if (value.length > 1024) throw new RangeError('RichEmbed field values may not exceed 1024 characters.');
      if (!/\S/.test(value)) throw new RangeError('RichEmbed field values may not be empty.');
      this.fields.push({ name: name, value: value, inline: inline });
      return this;
    }

    /**
     * Convenience function for `<RichEmbed>.addField('\u200B', '\u200B', inline)`.
     * @param {boolean} [inline=false] Set the field to display inline
     * @returns {RichEmbed} This embed
     */

  }, {
    key: 'addBlankField',
    value: function addBlankField() {
      var inline = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      return this.addField('\u200B', '\u200B', inline);
    }

    /**
     * Set the thumbnail of this embed
     * @param {string} url The URL of the thumbnail
     * @returns {RichEmbed} This embed
     */

  }, {
    key: 'setThumbnail',
    value: function setThumbnail(url) {
      this.thumbnail = { url: url };
      return this;
    }

    /**
     * Set the image of this embed
     * @param {string} url The URL of the image
     * @returns {RichEmbed} This embed
     */

  }, {
    key: 'setImage',
    value: function setImage(url) {
      this.image = { url: url };
      return this;
    }

    /**
     * Sets the footer of this embed
     * @param {StringResolvable} text The text of the footer
     * @param {string} [icon] The icon URL of the footer
     * @returns {RichEmbed} This embed
     */

  }, {
    key: 'setFooter',
    value: function setFooter(text, icon) {
      text = resolveString(text);
      if (text.length > 2048) throw new RangeError('RichEmbed footer text may not exceed 2048 characters.');
      this.footer = { text: text, icon_url: icon };
      return this;
    }

    /**
     * Sets the file to upload alongside the embed. This file can be accessed via `attachment://fileName.extension` when
     * setting an embed image or author/footer icons. Only one file may be attached.
     * @param {FileOptions|string} file Local path or URL to the file to attach, or valid FileOptions for a file to attach
     * @returns {RichEmbed} This embed
     */

  }, {
    key: 'attachFile',
    value: function attachFile(file) {
      if (this.file) throw new RangeError('You may not upload more than one file at once.');
      this.file = file;
      return this;
    }
  }]);

  return RichEmbed;
}();

module.exports = RichEmbed;

function resolveString(data) {
  if (typeof data === 'string') return data;
  if (data instanceof Array) return data.join('\n');
  return String(data);
}