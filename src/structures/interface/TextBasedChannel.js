'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var Message = require('../Message');
var MessageCollector = require('../MessageCollector');
var Collection = require('../../util/Collection');

/**
 * Interface for classes that have text-channel-like features
 * @interface
 */

var TextBasedChannel = function () {
  function TextBasedChannel() {
    _classCallCheck(this, TextBasedChannel);

    /**
     * A collection containing the messages sent to this channel.
     * @type {Collection<Snowflake, Message>}
     */
    this.messages = new Collection();

    /**
     * The ID of the last message in the channel, if one was sent.
     * @type {?Snowflake}
     */
    this.lastMessageID = null;

    /**
     * The Message object of the last message in the channel, if one was sent.
     * @type {?Message}
     */
    this.lastMessage = null;
  }

  /**
   * Options provided when sending or editing a message
   * @typedef {Object} MessageOptions
   * @property {boolean} [tts=false] Whether or not the message should be spoken aloud
   * @property {string} [nonce=''] The nonce for the message
   * @property {RichEmbed|Object} [embed] An embed for the message
   * (see [here](https://discordapp.com/developers/docs/resources/channel#embed-object) for more details)
   * @property {boolean} [disableEveryone=this.client.options.disableEveryone] Whether or not @everyone and @here
   * should be replaced with plain-text
   * @property {FileOptions|string} [file] A file to send with the message **(deprecated)**
   * @property {FileOptions[]|string[]} [files] Files to send with the message
   * @property {string|boolean} [code] Language for optional codeblock formatting to apply
   * @property {boolean|SplitOptions} [split=false] Whether or not the message should be split into multiple messages if
   * it exceeds the character limit. If an object is provided, these are the options for splitting the message.
   * @property {UserResolvable} [reply] User to reply to (prefixes the message with a mention, except in DMs)
   */

  /**
   * @typedef {Object} FileOptions
   * @property {BufferResolvable} attachment File to attach
   * @property {string} [name='file.jpg'] Filename of the attachment
   */

  /**
   * Options for splitting a message
   * @typedef {Object} SplitOptions
   * @property {number} [maxLength=1950] Maximum character length per message piece
   * @property {string} [char='\n'] Character to split the message with
   * @property {string} [prepend=''] Text to prepend to every piece except the first
   * @property {string} [append=''] Text to append to every piece except the last
   */

  /**
   * Send a message to this channel
   * @param {StringResolvable} [content] Text for the message
   * @param {MessageOptions} [options={}] Options for the message
   * @returns {Promise<Message|Message[]>}
   * @example
   * // send a message
   * channel.send('hello!')
   *  .then(message => console.log(`Sent message: ${message.content}`))
   *  .catch(console.error);
   */


  _createClass(TextBasedChannel, [{
    key: 'send',
    value: function send(content, options) {
      var _this = this;

      if (!options && (typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object' && !(content instanceof Array)) {
        options = content;
        content = '';
      } else if (!options) {
        options = {};
      }

      if (options.embed && options.embed.file) options.file = options.embed.file;

      if (options.file) {
        if (options.files) options.files.push(options.file);else options.files = [options.file];
      }

      if (options.files) {
        for (var i in options.files) {
          var file = options.files[i];
          if (typeof file === 'string') file = { attachment: file };
          if (!file.name) {
            if (typeof file.attachment === 'string') {
              file.name = path.basename(file.attachment);
            } else if (file.attachment && file.attachment.path) {
              file.name = path.basename(file.attachment.path);
            } else {
              file.name = 'file.jpg';
            }
          }
          options.files[i] = file;
        }

        return Promise.all(options.files.map(function (file) {
          return _this.client.resolver.resolveBuffer(file.attachment).then(function (buffer) {
            file.file = buffer;
            return file;
          });
        })).then(function (files) {
          return _this.client.rest.methods.sendMessage(_this, content, options, files);
        });
      }

      return this.client.rest.methods.sendMessage(this, content, options);
    }

    /**
     * Send a message to this channel
     * @param {StringResolvable} [content] Text for the message
     * @param {MessageOptions} [options={}] Options for the message
     * @returns {Promise<Message|Message[]>}
     * @example
     * // send a message
     * channel.sendMessage('hello!')
     *  .then(message => console.log(`Sent message: ${message.content}`))
     *  .catch(console.error);
     */

  }, {
    key: 'sendMessage',
    value: function sendMessage(content, options) {
      return this.send(content, options);
    }

    /**
     * Send an embed to this channel
     * @param {RichEmbed|Object} embed Embed for the message
     * @param {string} [content] Text for the message
     * @param {MessageOptions} [options] Options for the message
     * @returns {Promise<Message>}
     */

  }, {
    key: 'sendEmbed',
    value: function sendEmbed(embed, content, options) {
      if (!options && (typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object' && !(content instanceof Array)) {
        options = content;
        content = '';
      } else if (!options) {
        options = {};
      }
      return this.send(content, Object.assign(options, { embed: embed }));
    }

    /**
     * Send files to this channel
     * @param {FileOptions[]|string[]} files Files to send with the message
     * @param {StringResolvable} [content] Text for the message
     * @param {MessageOptions} [options] Options for the message
     * @returns {Promise<Message>}
     */

  }, {
    key: 'sendFiles',
    value: function sendFiles(files, content) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      return this.send(content, Object.assign(options, { files: files }));
    }

    /**
     * Send a file to this channel
     * @param {BufferResolvable} attachment File to send
     * @param {string} [name='file.jpg'] Name and extension of the file
     * @param {StringResolvable} [content] Text for the message
     * @param {MessageOptions} [options] Options for the message
     * @returns {Promise<Message>}
     */

  }, {
    key: 'sendFile',
    value: function sendFile(attachment, name, content) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      return this.sendFiles([{ attachment: attachment, name: name }], content, options);
    }

    /**
     * Send a code block to this channel
     * @param {string} lang Language for the code block
     * @param {StringResolvable} content Content of the code block
     * @param {MessageOptions} [options] Options for the message
     * @returns {Promise<Message|Message[]>}
     */

  }, {
    key: 'sendCode',
    value: function sendCode(lang, content) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      return this.send(content, Object.assign(options, { code: lang }));
    }

    /**
     * Gets a single message from this channel, regardless of it being cached or not.
     * <warn>This is only available when using a bot account.</warn>
     * @param {Snowflake} messageID ID of the message to get
     * @returns {Promise<Message>}
     * @example
     * // get message
     * channel.fetchMessage('99539446449315840')
     *   .then(message => console.log(message.content))
     *   .catch(console.error);
     */

  }, {
    key: 'fetchMessage',
    value: function fetchMessage(messageID) {
      var _this2 = this;

      return this.client.rest.methods.getChannelMessage(this, messageID).then(function (data) {
        var msg = data instanceof Message ? data : new Message(_this2, data, _this2.client);
        _this2._cacheMessage(msg);
        return msg;
      });
    }

    /**
     * The parameters to pass in when requesting previous messages from a channel. `around`, `before` and
     * `after` are mutually exclusive. All the parameters are optional.
     * @typedef {Object} ChannelLogsQueryOptions
     * @property {number} [limit=50] Number of messages to acquire
     * @property {Snowflake} [before] ID of a message to get the messages that were posted before it
     * @property {Snowflake} [after] ID of a message to get the messages that were posted after it
     * @property {Snowflake} [around] ID of a message to get the messages that were posted around it
     */

    /**
     * Gets the past messages sent in this channel. Resolves with a collection mapping message ID's to Message objects.
     * @param {ChannelLogsQueryOptions} [options={}] Query parameters to pass in
     * @returns {Promise<Collection<Snowflake, Message>>}
     * @example
     * // get messages
     * channel.fetchMessages({limit: 10})
     *  .then(messages => console.log(`Received ${messages.size} messages`))
     *  .catch(console.error);
     */

  }, {
    key: 'fetchMessages',
    value: function fetchMessages() {
      var _this3 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.client.rest.methods.getChannelMessages(this, options).then(function (data) {
        var messages = new Collection();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var message = _step.value;

            var msg = new Message(_this3, message, _this3.client);
            messages.set(message.id, msg);
            _this3._cacheMessage(msg);
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

        return messages;
      });
    }

    /**
     * Fetches the pinned messages of this channel and returns a collection of them.
     * @returns {Promise<Collection<Snowflake, Message>>}
     */

  }, {
    key: 'fetchPinnedMessages',
    value: function fetchPinnedMessages() {
      var _this4 = this;

      return this.client.rest.methods.getChannelPinnedMessages(this).then(function (data) {
        var messages = new Collection();
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var message = _step2.value;

            var msg = new Message(_this4, message, _this4.client);
            messages.set(message.id, msg);
            _this4._cacheMessage(msg);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return messages;
      });
    }

    /**
     * @typedef {Object} MessageSearchOptions
     * @property {string} [content] Message content
     * @property {Snowflake} [maxID] Maximum ID for the filter
     * @property {Snowflake} [minID] Minimum ID for the filter
     * @property {string} [has] One of `link`, `embed`, `file`, `video`, `image`, or `sound`,
     * or add `-` to negate (e.g. `-file`)
     * @property {ChannelResolvable} [channel] Channel to limit search to (only for guild search endpoint)
     * @property {UserResolvable} [author] Author to limit search
     * @property {string} [authorType] One of `user`, `bot`, `webhook`, or add `-` to negate (e.g. `-webhook`)
     * @property {string} [sortBy='recent'] `recent` or `relevant`
     * @property {string} [sortOrder='desc'] `asc` or `desc`
     * @property {number} [contextSize=2] How many messages to get around the matched message (0 to 2)
     * @property {number} [limit=25] Maximum number of results to get (1 to 25)
     * @property {number} [offset=0] Offset the "pages" of results (since you can only see 25 at a time)
     * @property {UserResolvable} [mentions] Mentioned user filter
     * @property {boolean} [mentionsEveryone] If everyone is mentioned
     * @property {string} [linkHostname] Filter links by hostname
     * @property {string} [embedProvider] The name of an embed provider
     * @property {string} [embedType] one of `image`, `video`, `url`, `rich`
     * @property {string} [attachmentFilename] The name of an attachment
     * @property {string} [attachmentExtension] The extension of an attachment
     * @property {Date} [before] Date to find messages before
     * @property {Date} [after] Date to find messages before
     * @property {Date} [during] Date to find messages during (range of date to date + 24 hours)
     */

    /**
     * Performs a search within the channel.
     * @param {MessageSearchOptions} [options={}] Options to pass to the search
     * @returns {Promise<Array<Message[]>>}
     * An array containing arrays of messages. Each inner array is a search context cluster.
     * The message which has triggered the result will have the `hit` property set to `true`.
     * @example
     * channel.search({
     *   content: 'discord.js',
     *   before: '2016-11-17'
     * }).then(res => {
     *   const hit = res.messages[0].find(m => m.hit).content;
     *   console.log(`I found: **${hit}**, total results: ${res.totalResults}`);
     * }).catch(console.error);
     */

  }, {
    key: 'search',
    value: function search(options) {
      return this.client.rest.methods.search(this, options);
    }

    /**
     * Starts a typing indicator in the channel.
     * @param {number} [count] The number of times startTyping should be considered to have been called
     * @example
     * // start typing in a channel
     * channel.startTyping();
     */

  }, {
    key: 'startTyping',
    value: function startTyping(count) {
      var _this5 = this;

      if (typeof count !== 'undefined' && count < 1) throw new RangeError('Count must be at least 1.');
      if (!this.client.user._typing.has(this.id)) {
        this.client.user._typing.set(this.id, {
          count: count || 1,
          interval: this.client.setInterval(function () {
            _this5.client.rest.methods.sendTyping(_this5.id);
          }, 9000)
        });
        this.client.rest.methods.sendTyping(this.id);
      } else {
        var entry = this.client.user._typing.get(this.id);
        entry.count = count || entry.count + 1;
      }
    }

    /**
     * Stops the typing indicator in the channel.
     * The indicator will only stop if this is called as many times as startTyping().
     * <info>It can take a few seconds for the client user to stop typing.</info>
     * @param {boolean} [force=false] Whether or not to reset the call count and force the indicator to stop
     * @example
     * // stop typing in a channel
     * channel.stopTyping();
     * @example
     * // force typing to fully stop in a channel
     * channel.stopTyping(true);
     */

  }, {
    key: 'stopTyping',
    value: function stopTyping() {
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (this.client.user._typing.has(this.id)) {
        var entry = this.client.user._typing.get(this.id);
        entry.count--;
        if (entry.count <= 0 || force) {
          this.client.clearInterval(entry.interval);
          this.client.user._typing.delete(this.id);
        }
      }
    }

    /**
     * Whether or not the typing indicator is being shown in the channel.
     * @type {boolean}
     * @readonly
     */

  }, {
    key: 'createCollector',


    /**
     * Creates a Message Collector
     * @param {CollectorFilterFunction} filter The filter to create the collector with
     * @param {CollectorOptions} [options={}] The options to pass to the collector
     * @returns {MessageCollector}
     * @example
     * // create a message collector
     * const collector = channel.createCollector(
     *  m => m.content.includes('discord'),
     *  { time: 15000 }
     * );
     * collector.on('message', m => console.log(`Collected ${m.content}`));
     * collector.on('end', collected => console.log(`Collected ${collected.size} items`));
     */
    value: function createCollector(filter) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return new MessageCollector(this, filter, options);
    }

    /**
     * An object containing the same properties as CollectorOptions, but a few more:
     * @typedef {CollectorOptions} AwaitMessagesOptions
     * @property {string[]} [errors] Stop/end reasons that cause the promise to reject
     */

    /**
     * Similar to createCollector but in promise form. Resolves with a collection of messages that pass the specified
     * filter.
     * @param {CollectorFilterFunction} filter The filter function to use
     * @param {AwaitMessagesOptions} [options={}] Optional options to pass to the internal collector
     * @returns {Promise<Collection<Snowflake, Message>>}
     * @example
     * // await !vote messages
     * const filter = m => m.content.startsWith('!vote');
     * // errors: ['time'] treats ending because of the time limit as an error
     * channel.awaitMessages(filter, { max: 4, time: 60000, errors: ['time'] })
     *  .then(collected => console.log(collected.size))
     *  .catch(collected => console.log(`After a minute, only ${collected.size} out of 4 voted.`));
     */

  }, {
    key: 'awaitMessages',
    value: function awaitMessages(filter) {
      var _this6 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return new Promise(function (resolve, reject) {
        var collector = _this6.createCollector(filter, options);
        collector.on('end', function (collection, reason) {
          if (options.errors && options.errors.includes(reason)) {
            reject(collection);
          } else {
            resolve(collection);
          }
        });
      });
    }

    /**
     * Bulk delete given messages that are newer than two weeks
     * <warn>This is only available when using a bot account.</warn>
     * @param {Collection<Snowflake, Message>|Message[]|number} messages Messages or number of messages to delete
     * @param {boolean} [filterOld=false] Filter messages to remove those which are older than two weeks automatically
     * @returns {Promise<Collection<Snowflake, Message>>} Deleted messages
     */

  }, {
    key: 'bulkDelete',
    value: function bulkDelete(messages) {
      var _this7 = this;

      var filterOld = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (!isNaN(messages)) return this.fetchMessages({ limit: messages }).then(function (msgs) {
        return _this7.bulkDelete(msgs, filterOld);
      });
      if (messages instanceof Array || messages instanceof Collection) {
        var messageIDs = messages instanceof Collection ? messages.keyArray() : messages.map(function (m) {
          return m.id;
        });
        return this.client.rest.methods.bulkDeleteMessages(this, messageIDs, filterOld);
      }
      throw new TypeError('The messages must be an Array, Collection, or number.');
    }

    /**
     * Marks all messages in this channel as read
     * <warn>This is only available when using a user account.</warn>
     * @returns {Promise<TextChannel|GroupDMChannel|DMChannel>}
     */

  }, {
    key: 'acknowledge',
    value: function acknowledge() {
      return this.client.rest.methods.ackTextMessage(this);
    }
  }, {
    key: '_cacheMessage',
    value: function _cacheMessage(message) {
      var maxSize = this.client.options.messageCacheMaxSize;
      if (maxSize === 0) return null;
      if (this.messages.size >= maxSize && maxSize > 0) this.messages.delete(this.messages.firstKey());
      this.messages.set(message.id, message);
      return message;
    }
  }, {
    key: 'typing',
    get: function get() {
      return this.client.user._typing.has(this.id);
    }

    /**
     * Number of times `startTyping` has been called.
     * @type {number}
     * @readonly
     */

  }, {
    key: 'typingCount',
    get: function get() {
      if (this.client.user._typing.has(this.id)) return this.client.user._typing.get(this.id).count;
      return 0;
    }
  }]);

  return TextBasedChannel;
}();

exports.applyToClass = function (structure) {
  var full = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var ignore = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  var props = ['send', 'sendMessage', 'sendEmbed', 'sendFile', 'sendFiles', 'sendCode'];
  if (full) {
    props.push('_cacheMessage', 'fetchMessages', 'fetchMessage', 'search', 'bulkDelete', 'startTyping', 'stopTyping', 'typing', 'typingCount', 'fetchPinnedMessages', 'createCollector', 'awaitMessages');
  }
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = props[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var prop = _step3.value;

      if (ignore.includes(prop)) continue;
      Object.defineProperty(structure.prototype, prop, Object.getOwnPropertyDescriptor(TextBasedChannel.prototype, prop));
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
};