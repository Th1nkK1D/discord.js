'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PartialGuild = require('./PartialGuild');
var PartialGuildChannel = require('./PartialGuildChannel');
var Constants = require('../util/Constants');

/*
{ max_age: 86400,
  code: 'CG9A5',
  guild:
   { splash: null,
     id: '123123123',
     icon: '123123123',
     name: 'name' },
  created_at: '2016-08-28T19:07:04.763368+00:00',
  temporary: false,
  uses: 0,
  max_uses: 0,
  inviter:
   { username: '123',
     discriminator: '4204',
     bot: true,
     id: '123123123',
     avatar: '123123123' },
  channel: { type: 0, id: '123123', name: 'heavy-testing' } }
*/

/**
 * Represents an invitation to a guild channel.
 * <warn>The only guaranteed properties are `code`, `guild` and `channel`. Other properties can be missing.</warn>
 */

var Invite = function () {
  function Invite(client, data) {
    _classCallCheck(this, Invite);

    /**
     * The client that instantiated the invite
     * @name Invite#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    this.setup(data);
  }

  _createClass(Invite, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The guild the invite is for. If this guild is already known, this will be a Guild object. If the guild is
       * unknown, this will be a PartialGuild object.
       * @type {Guild|PartialGuild}
       */
      this.guild = this.client.guilds.get(data.guild.id) || new PartialGuild(this.client, data.guild);

      /**
       * The code for this invite
       * @type {string}
       */
      this.code = data.code;

      /**
       * Whether or not this invite is temporary
       * @type {boolean}
       */
      this.temporary = data.temporary;

      /**
       * The maximum age of the invite, in seconds
       * @type {?number}
       */
      this.maxAge = data.max_age;

      /**
       * How many times this invite has been used
       * @type {number}
       */
      this.uses = data.uses;

      /**
       * The maximum uses of this invite
       * @type {number}
       */
      this.maxUses = data.max_uses;

      if (data.inviter) {
        /**
         * The user who created this invite
         * @type {User}
         */
        this.inviter = this.client.dataManager.newUser(data.inviter);
      }

      /**
       * The channel the invite is for. If this channel is already known, this will be a GuildChannel object.
       * If the channel is unknown, this will be a PartialGuildChannel object.
       * @type {GuildChannel|PartialGuildChannel}
       */
      this.channel = this.client.channels.get(data.channel.id) || new PartialGuildChannel(this.client, data.channel);

      /**
       * The timestamp the invite was created at
       * @type {number}
       */
      this.createdTimestamp = new Date(data.created_at).getTime();
    }

    /**
     * The time the invite was created
     * @type {Date}
     * @readonly
     */

  }, {
    key: 'delete',


    /**
     * Deletes this invite
     * @returns {Promise<Invite>}
     */
    value: function _delete() {
      return this.client.rest.methods.deleteInvite(this);
    }

    /**
     * When concatenated with a string, this automatically concatenates the invite's URL instead of the object.
     * @returns {string}
     * @example
     * // logs: Invite: https://discord.gg/A1b2C3
     * console.log(`Invite: ${invite}`);
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.url;
    }
  }, {
    key: 'createdAt',
    get: function get() {
      return new Date(this.createdTimestamp);
    }

    /**
     * The timestamp the invite will expire at
     * @type {number}
     * @readonly
     */

  }, {
    key: 'expiresTimestamp',
    get: function get() {
      return this.createdTimestamp + this.maxAge * 1000;
    }

    /**
     * The time the invite will expire
     * @type {Date}
     * @readonly
     */

  }, {
    key: 'expiresAt',
    get: function get() {
      return new Date(this.expiresTimestamp);
    }

    /**
     * The URL to the invite
     * @type {string}
     * @readonly
     */

  }, {
    key: 'url',
    get: function get() {
      return Constants.Endpoints.inviteLink(this.code);
    }
  }]);

  return Invite;
}();

module.exports = Invite;