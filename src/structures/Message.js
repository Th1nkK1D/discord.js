'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Attachment = require('./MessageAttachment');
var Embed = require('./MessageEmbed');
var MessageReaction = require('./MessageReaction');
var Util = require('../util/Util');
var Collection = require('../util/Collection');
var Constants = require('../util/Constants');
var Permissions = require('../util/Permissions');
var GuildMember = void 0;

/**
 * Represents a message on Discord
 */

var Message = function () {
  function Message(channel, data, client) {
    _classCallCheck(this, Message);

    /**
     * The Client that instantiated the Message
     * @name Message#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * The channel that the message was sent in
     * @type {TextChannel|DMChannel|GroupDMChannel}
     */
    this.channel = channel;

    if (data) this.setup(data);
  }

  _createClass(Message, [{
    key: 'setup',
    value: function setup(data) {
      var _this = this;

      // eslint-disable-line complexity
      /**
       * The ID of the message (unique in the channel it was sent)
       * @type {Snowflake}
       */
      this.id = data.id;

      /**
       * The type of the message
       * @type {string}
       */
      this.type = Constants.MessageTypes[data.type];

      /**
       * The content of the message
       * @type {string}
       */
      this.content = data.content;

      /**
       * The author of the message
       * @type {User}
       */
      this.author = this.client.dataManager.newUser(data.author);

      /**
       * Represents the author of the message as a guild member. Only available if the message comes from a guild
       * where the author is still a member.
       * @type {?GuildMember}
       */
      this.member = this.guild ? this.guild.member(this.author) || null : null;

      /**
       * Whether or not this message is pinned
       * @type {boolean}
       */
      this.pinned = data.pinned;

      /**
       * Whether or not the message was Text-To-Speech
       * @type {boolean}
       */
      this.tts = data.tts;

      /**
       * A random number or string used for checking message delivery
       * @type {string}
       */
      this.nonce = data.nonce;

      /**
       * Whether or not this message was sent by Discord, not actually a user (e.g. pin notifications)
       * @type {boolean}
       */
      this.system = data.type === 6;

      /**
       * A list of embeds in the message - e.g. YouTube Player
       * @type {MessageEmbed[]}
       */
      this.embeds = data.embeds.map(function (e) {
        return new Embed(_this, e);
      });

      /**
       * A collection of attachments in the message - e.g. Pictures - mapped by their ID.
       * @type {Collection<Snowflake, MessageAttachment>}
       */
      this.attachments = new Collection();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data.attachments[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var attachment = _step.value;
          this.attachments.set(attachment.id, new Attachment(this, attachment));
        } /**
           * The timestamp the message was sent at
           * @type {number}
           */
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

      this.createdTimestamp = new Date(data.timestamp).getTime();

      /**
       * The timestamp the message was last edited at (if applicable)
       * @type {?number}
       */
      this.editedTimestamp = data.edited_timestamp ? new Date(data.edited_timestamp).getTime() : null;

      /**
       * An object containing a further users, roles or channels collections
       * @type {Object}
       * @property {Collection<Snowflake, User>} mentions.users Mentioned users, maps their ID to the user object.
       * @property {Collection<Snowflake, Role>} mentions.roles Mentioned roles, maps their ID to the role object.
       * @property {Collection<Snowflake, GuildChannel>} mentions.channels Mentioned channels,
       * maps their ID to the channel object.
       * @property {boolean} mentions.everyone Whether or not @everyone was mentioned.
       */
      this.mentions = {
        users: new Collection(),
        roles: new Collection(),
        channels: new Collection(),
        everyone: data.mention_everyone
      };

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data.mentions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _mention = _step2.value;

          var user = this.client.users.get(_mention.id);
          if (user) {
            this.mentions.users.set(user.id, user);
          } else {
            user = this.client.dataManager.newUser(_mention);
            this.mentions.users.set(user.id, user);
          }
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

      if (data.mention_roles) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = data.mention_roles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var mention = _step3.value;

            var role = this.channel.guild.roles.get(mention);
            if (role) this.mentions.roles.set(role.id, role);
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
      }

      if (this.channel.guild) {
        var channMentionsRaw = data.content.match(/<#([0-9]{14,20})>/g) || [];
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = channMentionsRaw[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var raw = _step4.value;

            var chan = this.channel.guild.channels.get(raw.match(/([0-9]{14,20})/g)[0]);
            if (chan) this.mentions.channels.set(chan.id, chan);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }

      this._edits = [];

      /**
       * A collection of reactions to this message, mapped by the reaction "id".
       * @type {Collection<Snowflake, MessageReaction>}
       */
      this.reactions = new Collection();

      if (data.reactions && data.reactions.length > 0) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = data.reactions[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var reaction = _step5.value;

            var id = reaction.emoji.id ? reaction.emoji.name + ':' + reaction.emoji.id : reaction.emoji.name;
            this.reactions.set(id, new MessageReaction(this, reaction.emoji, reaction.count, reaction.me));
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      }

      /**
       * ID of the webhook that sent the message, if applicable
       * @type {?Snowflake}
       */
      this.webhookID = data.webhook_id || null;

      /**
       * Whether this message is a hit in a search
       * @type {?boolean}
       */
      this.hit = typeof data.hit === 'boolean' ? data.hit : null;
    }
  }, {
    key: 'patch',
    value: function patch(data) {
      var _this2 = this;

      // eslint-disable-line complexity
      if (data.author) {
        this.author = this.client.users.get(data.author.id);
        if (this.guild) this.member = this.guild.member(this.author);
      }
      if (data.content) this.content = data.content;
      if (data.timestamp) this.createdTimestamp = new Date(data.timestamp).getTime();
      if (data.edited_timestamp) {
        this.editedTimestamp = data.edited_timestamp ? new Date(data.edited_timestamp).getTime() : null;
      }
      if ('tts' in data) this.tts = data.tts;
      if ('mention_everyone' in data) this.mentions.everyone = data.mention_everyone;
      if (data.nonce) this.nonce = data.nonce;
      if (data.embeds) this.embeds = data.embeds.map(function (e) {
        return new Embed(_this2, e);
      });
      if (data.type > -1) {
        this.system = false;
        if (data.type === 6) this.system = true;
      }
      if (data.attachments) {
        this.attachments.clear();
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = data.attachments[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var attachment = _step6.value;

            this.attachments.set(attachment.id, new Attachment(this, attachment));
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      }
      if (data.mentions) {
        this.mentions.users.clear();
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = data.mentions[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var mention = _step7.value;

            var user = this.client.users.get(mention.id);
            if (user) {
              this.mentions.users.set(user.id, user);
            } else {
              user = this.client.dataManager.newUser(mention);
              this.mentions.users.set(user.id, user);
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }
      }
      if (data.mention_roles) {
        this.mentions.roles.clear();
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = data.mention_roles[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var _mention2 = _step8.value;

            var role = this.channel.guild.roles.get(_mention2);
            if (role) this.mentions.roles.set(role.id, role);
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }
      }
      if (data.id) this.id = data.id;
      if (this.channel.guild && data.content) {
        this.mentions.channels.clear();
        var channMentionsRaw = data.content.match(/<#([0-9]{14,20})>/g) || [];
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = channMentionsRaw[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var raw = _step9.value;

            var chan = this.channel.guild.channels.get(raw.match(/([0-9]{14,20})/g)[0]);
            if (chan) this.mentions.channels.set(chan.id, chan);
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }
      }
      if (data.reactions) {
        this.reactions.clear();
        if (data.reactions.length > 0) {
          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            for (var _iterator10 = data.reactions[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              var reaction = _step10.value;

              var id = reaction.emoji.id ? reaction.emoji.name + ':' + reaction.emoji.id : reaction.emoji.name;
              this.reactions.set(id, new MessageReaction(this, reaction.emoji, reaction.count, reaction.me));
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10.return) {
                _iterator10.return();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
          }
        }
      }
    }

    /**
     * The time the message was sent
     * @type {Date}
     * @readonly
     */

  }, {
    key: 'isMentioned',


    /**
     * Whether or not a user, channel or role is mentioned in this message.
     * @param {GuildChannel|User|Role|string} data either a guild channel, user or a role object, or a string representing
     * the ID of any of these.
     * @returns {boolean}
     */
    value: function isMentioned(data) {
      data = data && data.id ? data.id : data;
      return this.mentions.users.has(data) || this.mentions.channels.has(data) || this.mentions.roles.has(data);
    }

    /**
     * Whether or not a guild member is mentioned in this message. Takes into account
     * user mentions, role mentions, and @everyone/@here mentions.
     * @param {GuildMember|User} member Member/user to check for a mention of
     * @returns {boolean}
     */

  }, {
    key: 'isMemberMentioned',
    value: function isMemberMentioned(member) {
      var _this3 = this;

      // Lazy-loading is used here to get around a circular dependency that breaks things
      if (!GuildMember) GuildMember = require('./GuildMember');
      if (this.mentions.everyone) return true;
      if (this.mentions.users.has(member.id)) return true;
      if (member instanceof GuildMember && member.roles.some(function (r) {
        return _this3.mentions.roles.has(r.id);
      })) return true;
      return false;
    }

    /**
     * Options that can be passed into editMessage
     * @typedef {Object} MessageEditOptions
     * @property {Object} [embed] An embed to be added/edited
     * @property {string|boolean} [code] Language for optional codeblock formatting to apply
     */

    /**
     * Edit the content of the message
     * @param {StringResolvable} [content] The new content for the message
     * @param {MessageEditOptions} [options] The options to provide
     * @returns {Promise<Message>}
     * @example
     * // update the content of a message
     * message.edit('This is my new content!')
     *  .then(msg => console.log(`Updated the content of a message from ${msg.author}`))
     *  .catch(console.error);
     */

  }, {
    key: 'edit',
    value: function edit(content, options) {
      if (!options && (typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object' && !(content instanceof Array)) {
        options = content;
        content = '';
      } else if (!options) {
        options = {};
      }
      return this.client.rest.methods.updateMessage(this, content, options);
    }

    /**
     * Edit the content of the message, with a code block
     * @param {string} lang Language for the code block
     * @param {StringResolvable} content The new content for the message
     * @returns {Promise<Message>}
     */

  }, {
    key: 'editCode',
    value: function editCode(lang, content) {
      content = Util.escapeMarkdown(this.client.resolver.resolveString(content), true);
      return this.edit('```' + (lang || '') + '\n' + content + '\n```');
    }

    /**
     * Pins this message to the channel's pinned messages
     * @returns {Promise<Message>}
     */

  }, {
    key: 'pin',
    value: function pin() {
      return this.client.rest.methods.pinMessage(this);
    }

    /**
     * Unpins this message from the channel's pinned messages
     * @returns {Promise<Message>}
     */

  }, {
    key: 'unpin',
    value: function unpin() {
      return this.client.rest.methods.unpinMessage(this);
    }

    /**
     * Add a reaction to the message
     * @param {string|Emoji|ReactionEmoji} emoji Emoji to react with
     * @returns {Promise<MessageReaction>}
     */

  }, {
    key: 'react',
    value: function react(emoji) {
      emoji = this.client.resolver.resolveEmojiIdentifier(emoji);
      if (!emoji) throw new TypeError('Emoji must be a string or Emoji/ReactionEmoji');

      return this.client.rest.methods.addMessageReaction(this, emoji);
    }

    /**
     * Remove all reactions from a message
     * @returns {Promise<Message>}
     */

  }, {
    key: 'clearReactions',
    value: function clearReactions() {
      return this.client.rest.methods.removeMessageReactions(this);
    }

    /**
     * Deletes the message
     * @param {number} [timeout=0] How long to wait to delete the message in milliseconds
     * @returns {Promise<Message>}
     * @example
     * // delete a message
     * message.delete()
     *  .then(msg => console.log(`Deleted message from ${msg.author}`))
     *  .catch(console.error);
     */

  }, {
    key: 'delete',
    value: function _delete() {
      var _this4 = this;

      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (timeout <= 0) {
        return this.client.rest.methods.deleteMessage(this);
      } else {
        return new Promise(function (resolve) {
          _this4.client.setTimeout(function () {
            resolve(_this4.delete());
          }, timeout);
        });
      }
    }

    /**
     * Reply to the message
     * @param {StringResolvable} [content] The content for the message
     * @param {MessageOptions} [options] The options to provide
     * @returns {Promise<Message|Message[]>}
     * @example
     * // reply to a message
     * message.reply('Hey, I\'m a reply!')
     *  .then(msg => console.log(`Sent a reply to ${msg.author}`))
     *  .catch(console.error);
     */

  }, {
    key: 'reply',
    value: function reply(content, options) {
      if (!options && (typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object' && !(content instanceof Array)) {
        options = content;
        content = '';
      } else if (!options) {
        options = {};
      }
      return this.channel.send(content, Object.assign(options, { reply: this.member || this.author }));
    }

    /**
     * Marks the message as read
     * <warn>This is only available when using a user account.</warn>
     * @returns {Promise<Message>}
     */

  }, {
    key: 'acknowledge',
    value: function acknowledge() {
      return this.client.rest.methods.ackMessage(this);
    }

    /**
     * Fetches the webhook used to create this message.
     * @returns {Promise<?Webhook>}
     */

  }, {
    key: 'fetchWebhook',
    value: function fetchWebhook() {
      if (!this.webhookID) return Promise.reject(new Error('The message was not sent by a webhook.'));
      return this.client.fetchWebhook(this.webhookID);
    }

    /**
     * Used mainly internally. Whether two messages are identical in properties. If you want to compare messages
     * without checking all the properties, use `message.id === message2.id`, which is much more efficient. This
     * method allows you to see if there are differences in content, embeds, attachments, nonce and tts properties.
     * @param {Message} message The message to compare it to
     * @param {Object} rawData Raw data passed through the WebSocket about this message
     * @returns {boolean}
     */

  }, {
    key: 'equals',
    value: function equals(message, rawData) {
      if (!message) return false;
      var embedUpdate = !message.author && !message.attachments;
      if (embedUpdate) return this.id === message.id && this.embeds.length === message.embeds.length;

      var equal = this.id === message.id && this.author.id === message.author.id && this.content === message.content && this.tts === message.tts && this.nonce === message.nonce && this.embeds.length === message.embeds.length && this.attachments.length === message.attachments.length;

      if (equal && rawData) {
        equal = this.mentions.everyone === message.mentions.everyone && this.createdTimestamp === new Date(rawData.timestamp).getTime() && this.editedTimestamp === new Date(rawData.edited_timestamp).getTime();
      }

      return equal;
    }

    /**
     * When concatenated with a string, this automatically concatenates the message's content instead of the object.
     * @returns {string}
     * @example
     * // logs: Message: This is a message!
     * console.log(`Message: ${message}`);
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.content;
    }
  }, {
    key: '_addReaction',
    value: function _addReaction(emoji, user) {
      var emojiID = emoji.id ? emoji.name + ':' + emoji.id : encodeURIComponent(emoji.name);
      var reaction = void 0;
      if (this.reactions.has(emojiID)) {
        reaction = this.reactions.get(emojiID);
        if (!reaction.me) reaction.me = user.id === this.client.user.id;
      } else {
        reaction = new MessageReaction(this, emoji, 0, user.id === this.client.user.id);
        this.reactions.set(emojiID, reaction);
      }
      if (!reaction.users.has(user.id)) reaction.users.set(user.id, user);
      reaction.count++;
      return reaction;
    }
  }, {
    key: '_removeReaction',
    value: function _removeReaction(emoji, user) {
      var emojiID = emoji.id ? emoji.name + ':' + emoji.id : encodeURIComponent(emoji.name);
      if (this.reactions.has(emojiID)) {
        var reaction = this.reactions.get(emojiID);
        if (reaction.users.has(user.id)) {
          reaction.users.delete(user.id);
          reaction.count--;
          if (user.id === this.client.user.id) reaction.me = false;
          return reaction;
        }
      }
      return null;
    }
  }, {
    key: '_clearReactions',
    value: function _clearReactions() {
      this.reactions.clear();
    }
  }, {
    key: 'createdAt',
    get: function get() {
      return new Date(this.createdTimestamp);
    }

    /**
     * The time the message was last edited at (if applicable)
     * @type {?Date}
     * @readonly
     */

  }, {
    key: 'editedAt',
    get: function get() {
      return this.editedTimestamp ? new Date(this.editedTimestamp) : null;
    }

    /**
     * The guild the message was sent in (if in a guild channel)
     * @type {?Guild}
     * @readonly
     */

  }, {
    key: 'guild',
    get: function get() {
      return this.channel.guild || null;
    }

    /**
     * The message contents with all mentions replaced by the equivalent text. If mentions cannot be resolved to a name,
     * the relevant mention in the message content will not be converted.
     * @type {string}
     * @readonly
     */

  }, {
    key: 'cleanContent',
    get: function get() {
      var _this5 = this;

      return this.content.replace(/@(everyone|here)/g, '@\u200B$1').replace(/<@!?[0-9]+>/g, function (input) {
        var id = input.replace(/<|!|>|@/g, '');
        if (_this5.channel.type === 'dm' || _this5.channel.type === 'group') {
          return _this5.client.users.has(id) ? '@' + _this5.client.users.get(id).username : input;
        }

        var member = _this5.channel.guild.members.get(id);
        if (member) {
          if (member.nickname) return '@' + member.nickname;
          return '@' + member.user.username;
        } else {
          var user = _this5.client.users.get(id);
          if (user) return '@' + user.username;
          return input;
        }
      }).replace(/<#[0-9]+>/g, function (input) {
        var channel = _this5.client.channels.get(input.replace(/<|#|>/g, ''));
        if (channel) return '#' + channel.name;
        return input;
      }).replace(/<@&[0-9]+>/g, function (input) {
        if (_this5.channel.type === 'dm' || _this5.channel.type === 'group') return input;
        var role = _this5.guild.roles.get(input.replace(/<|@|>|&/g, ''));
        if (role) return '@' + role.name;
        return input;
      });
    }

    /**
     * An array of cached versions of the message, including the current version.
     * Sorted from latest (first) to oldest (last).
     * @type {Message[]}
     * @readonly
     */

  }, {
    key: 'edits',
    get: function get() {
      var copy = this._edits.slice();
      copy.unshift(this);
      return copy;
    }

    /**
     * Whether the message is editable by the client user.
     * @type {boolean}
     * @readonly
     */

  }, {
    key: 'editable',
    get: function get() {
      return this.author.id === this.client.user.id;
    }

    /**
     * Whether the message is deletable by the client user.
     * @type {boolean}
     * @readonly
     */

  }, {
    key: 'deletable',
    get: function get() {
      return this.author.id === this.client.user.id || this.guild && this.channel.permissionsFor(this.client.user).hasPermission(Permissions.FLAGS.MANAGE_MESSAGES);
    }

    /**
     * Whether the message is pinnable by the client user.
     * @type {boolean}
     * @readonly
     */

  }, {
    key: 'pinnable',
    get: function get() {
      return !this.guild || this.channel.permissionsFor(this.client.user).hasPermission(Permissions.FLAGS.MANAGE_MESSAGES);
    }
  }]);

  return Message;
}();

module.exports = Message;