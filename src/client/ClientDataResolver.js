'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var fs = require('fs');
var request = require('superagent');

var Constants = require('../util/Constants');
var convertToBuffer = require('../util/Util').convertToBuffer;
var User = require('../structures/User');
var Message = require('../structures/Message');
var Guild = require('../structures/Guild');
var Channel = require('../structures/Channel');
var GuildMember = require('../structures/GuildMember');
var Emoji = require('../structures/Emoji');
var ReactionEmoji = require('../structures/ReactionEmoji');

/**
 * The DataResolver identifies different objects and tries to resolve a specific piece of information from them, e.g.
 * extracting a User from a Message object.
 * @private
 */

var ClientDataResolver = function () {
  /**
   * @param {Client} client The client the resolver is for
   */
  function ClientDataResolver(client) {
    _classCallCheck(this, ClientDataResolver);

    this.client = client;
  }

  /**
   * Data that resolves to give a User object. This can be:
   * * A User object
   * * A user ID
   * * A Message object (resolves to the message author)
   * * A Guild object (owner of the guild)
   * * A GuildMember object
   * @typedef {User|Snowflake|Message|Guild|GuildMember} UserResolvable
   */

  /**
   * Resolves a UserResolvable to a User object
   * @param {UserResolvable} user The UserResolvable to identify
   * @returns {?User}
   */


  _createClass(ClientDataResolver, [{
    key: 'resolveUser',
    value: function resolveUser(user) {
      if (user instanceof User) return user;
      if (typeof user === 'string') return this.client.users.get(user) || null;
      if (user instanceof GuildMember) return user.user;
      if (user instanceof Message) return user.author;
      if (user instanceof Guild) return user.owner;
      return null;
    }

    /**
     * Resolves a UserResolvable to a user ID string
     * @param {UserResolvable} user The UserResolvable to identify
     * @returns {?Snowflake}
     */

  }, {
    key: 'resolveUserID',
    value: function resolveUserID(user) {
      if (user instanceof User || user instanceof GuildMember) return user.id;
      if (typeof user === 'string') return user || null;
      if (user instanceof Message) return user.author.id;
      if (user instanceof Guild) return user.ownerID;
      return null;
    }

    /**
     * Data that resolves to give a Guild object. This can be:
     * * A Guild object
     * * A Guild ID
     * @typedef {Guild|Snowflake} GuildResolvable
     */

    /**
     * Resolves a GuildResolvable to a Guild object
     * @param {GuildResolvable} guild The GuildResolvable to identify
     * @returns {?Guild}
     */

  }, {
    key: 'resolveGuild',
    value: function resolveGuild(guild) {
      if (guild instanceof Guild) return guild;
      if (typeof guild === 'string') return this.client.guilds.get(guild) || null;
      return null;
    }

    /**
     * Data that resolves to give a GuildMember object. This can be:
     * * A GuildMember object
     * * A User object
     * @typedef {Guild} GuildMemberResolvable
     */

    /**
     * Resolves a GuildMemberResolvable to a GuildMember object
     * @param {GuildResolvable} guild The guild that the member is part of
     * @param {UserResolvable} user The user that is part of the guild
     * @returns {?GuildMember}
     */

  }, {
    key: 'resolveGuildMember',
    value: function resolveGuildMember(guild, user) {
      if (user instanceof GuildMember) return user;
      guild = this.resolveGuild(guild);
      user = this.resolveUser(user);
      if (!guild || !user) return null;
      return guild.members.get(user.id) || null;
    }

    /**
     * Data that can be resolved to give a Channel object. This can be:
     * * A Channel object
     * * A Message object (the channel the message was sent in)
     * * A Guild object (the #general channel)
     * * A channel ID
     * @typedef {Channel|Guild|Message|Snowflake} ChannelResolvable
     */

    /**
     * Resolves a ChannelResolvable to a Channel object
     * @param {ChannelResolvable} channel The channel resolvable to resolve
     * @returns {?Channel}
     */

  }, {
    key: 'resolveChannel',
    value: function resolveChannel(channel) {
      if (channel instanceof Channel) return channel;
      if (typeof channel === 'string') return this.client.channels.get(channel) || null;
      if (channel instanceof Message) return channel.channel;
      if (channel instanceof Guild) return channel.channels.get(channel.id) || null;
      return null;
    }

    /**
     * Resolves a ChannelResolvable to a channel ID
     * @param {ChannelResolvable} channel The channel resolvable to resolve
     * @returns {?Snowflake}
     */

  }, {
    key: 'resolveChannelID',
    value: function resolveChannelID(channel) {
      if (channel instanceof Channel) return channel.id;
      if (typeof channel === 'string') return channel;
      if (channel instanceof Message) return channel.channel.id;
      if (channel instanceof Guild) return channel.defaultChannel.id;
      return null;
    }

    /**
     * Data that can be resolved to give an invite code. This can be:
     * * An invite code
     * * An invite URL
     * @typedef {string} InviteResolvable
     */

    /**
     * Resolves InviteResolvable to an invite code
     * @param {InviteResolvable} data The invite resolvable to resolve
     * @returns {string}
     */

  }, {
    key: 'resolveInviteCode',
    value: function resolveInviteCode(data) {
      var inviteRegex = /discord(?:app)?\.(?:gg|com\/invite)\/([a-z0-9]{5})/i;
      var match = inviteRegex.exec(data);
      if (match && match[1]) return match[1];
      return data;
    }

    /**
     * Data that can be resolved to give a string. This can be:
     * * A string
     * * An array (joined with a new line delimiter to give a string)
     * * Any value
     * @typedef {string|Array|*} StringResolvable
     */

    /**
     * Resolves a StringResolvable to a string
     * @param {StringResolvable} data The string resolvable to resolve
     * @returns {string}
     */

  }, {
    key: 'resolveString',
    value: function resolveString(data) {
      if (typeof data === 'string') return data;
      if (data instanceof Array) return data.join('\n');
      return String(data);
    }

    /**
     * Data that resolves to give a Base64 string, typically for image uploading. This can be:
     * * A Buffer
     * * A base64 string
     * @typedef {Buffer|string} Base64Resolvable
     */

    /**
     * Resolves a Base64Resolvable to a Base 64 image
     * @param {Base64Resolvable} data The base 64 resolvable you want to resolve
     * @returns {?string}
     */

  }, {
    key: 'resolveBase64',
    value: function resolveBase64(data) {
      if (data instanceof Buffer) return 'data:image/jpg;base64,' + data.toString('base64');
      return data;
    }

    /**
     * Data that can be resolved to give a Buffer. This can be:
     * * A Buffer
     * * The path to a local file
     * * A URL
     * @typedef {string|Buffer} BufferResolvable
     */

    /**
     * Resolves a BufferResolvable to a Buffer
     * @param {BufferResolvable} resource The buffer resolvable to resolve
     * @returns {Promise<Buffer>}
     */

  }, {
    key: 'resolveBuffer',
    value: function resolveBuffer(resource) {
      var _this = this;

      if (resource instanceof Buffer) return Promise.resolve(resource);
      if (this.client.browser && resource instanceof ArrayBuffer) return Promise.resolve(convertToBuffer(resource));

      if (typeof resource === 'string') {
        return new Promise(function (resolve, reject) {
          if (/^https?:\/\//.test(resource)) {
            var req = request.get(resource).set('Content-Type', 'blob');
            if (_this.client.browser) req.responseType('arraybuffer');
            req.end(function (err, res) {
              if (err) return reject(err);
              if (_this.client.browser) return resolve(convertToBuffer(res.xhr.response));
              if (!(res.body instanceof Buffer)) return reject(new TypeError('The response body isn\'t a Buffer.'));
              return resolve(res.body);
            });
          } else {
            var file = path.resolve(resource);
            fs.stat(file, function (err, stats) {
              if (err) return reject(err);
              if (!stats || !stats.isFile()) return reject(new Error('The file could not be found: ' + file));
              fs.readFile(file, function (err2, data) {
                if (err2) reject(err2);else resolve(data);
              });
              return null;
            });
          }
        });
      }

      return Promise.reject(new TypeError('The resource must be a string or Buffer.'));
    }

    /**
     * Data that can be resolved to give an emoji identifier. This can be:
     * * A string
     * * An Emoji
     * * A ReactionEmoji
     * @typedef {string|Emoji|ReactionEmoji} EmojiIdentifierResolvable
     */

    /**
     * Resolves an EmojiResolvable to an emoji identifier
     * @param {EmojiIdentifierResolvable} emoji The emoji resolvable to resolve
     * @returns {string}
     */

  }, {
    key: 'resolveEmojiIdentifier',
    value: function resolveEmojiIdentifier(emoji) {
      if (emoji instanceof Emoji || emoji instanceof ReactionEmoji) return emoji.identifier;
      if (typeof emoji === 'string') {
        if (!emoji.includes('%')) return encodeURIComponent(emoji);
      }
      return null;
    }

    /**
     * Can be a Hex Literal, Hex String, Number, RGB Array, or one of the following
     * ```
     * [
     *   'DEFAULT',
     *   'AQUA',
     *   'GREEN',
     *   'BLUE',
     *   'PURPLE',
     *   'GOLD',
     *   'ORANGE',
     *   'RED',
     *   'GREY',
     *   'DARKER_GREY',
     *   'NAVY',
     *   'DARK_AQUA',
     *   'DARK_GREEN',
     *   'DARK_BLUE',
     *   'DARK_PURPLE',
     *   'DARK_GOLD',
     *   'DARK_ORANGE',
     *   'DARK_RED',
     *   'DARK_GREY',
     *   'LIGHT_GREY',
     *   'DARK_NAVY',
     *   'RANDOM',
     * ]
     * ```
     * or something like
     * ```
     * [255, 0, 255]
     * ```
     * for purple
     * @typedef {String|number|Array} ColorResolvable
     */

    /**
     * Resolves a ColorResolvable into a color number
     * @param {ColorResolvable} color Color to resolve
     * @returns {number} A color
     */

  }, {
    key: 'resolveColor',


    /**
     * @param {ColorResolvable} color Color to resolve
     * @returns {number} A color
     */
    value: function resolveColor(color) {
      return this.constructor.resolveColor(color);
    }
  }], [{
    key: 'resolveColor',
    value: function resolveColor(color) {
      if (typeof color === 'string') {
        if (color === 'RANDOM') return Math.floor(Math.random() * (0xFFFFFF + 1));
        color = Constants.Colors[color] || parseInt(color.replace('#', ''), 16);
      } else if (color instanceof Array) {
        color = (color[0] << 16) + (color[1] << 8) + color[2];
      }

      if (color < 0 || color > 0xFFFFFF) {
        throw new RangeError('Color must be within the range 0 - 16777215 (0xFFFFFF).');
      } else if (color && isNaN(color)) {
        throw new TypeError('Unable to convert color to a number.');
      }

      return color;
    }
  }]);

  return ClientDataResolver;
}();

module.exports = ClientDataResolver;