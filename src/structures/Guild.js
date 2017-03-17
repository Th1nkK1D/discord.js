'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var User = require('./User');
var Role = require('./Role');
var Emoji = require('./Emoji');
var Presence = require('./Presence').Presence;
var GuildMember = require('./GuildMember');
var Constants = require('../util/Constants');
var Collection = require('../util/Collection');
var Util = require('../util/Util');
var Snowflake = require('../util/Snowflake');

/**
 * Represents a guild (or a server) on Discord.
 * <info>It's recommended to see if a guild is available before performing operations or reading data from it. You can
 * check this with `guild.available`.</info>
 */

var Guild = function () {
  function Guild(client, data) {
    _classCallCheck(this, Guild);

    /**
     * The Client that created the instance of the the Guild.
     * @name Guild#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * A collection of members that are in this guild. The key is the member's ID, the value is the member.
     * @type {Collection<Snowflake, GuildMember>}
     */
    this.members = new Collection();

    /**
     * A collection of channels that are in this guild. The key is the channel's ID, the value is the channel.
     * @type {Collection<Snowflake, GuildChannel>}
     */
    this.channels = new Collection();

    /**
     * A collection of roles that are in this guild. The key is the role's ID, the value is the role.
     * @type {Collection<Snowflake, Role>}
     */
    this.roles = new Collection();

    /**
     * A collection of presences in this guild
     * @type {Collection<Snowflake, Presence>}
     */
    this.presences = new Collection();

    if (!data) return;
    if (data.unavailable) {
      /**
       * Whether the guild is available to access. If it is not available, it indicates a server outage.
       * @type {boolean}
       */
      this.available = false;

      /**
       * The Unique ID of the Guild, useful for comparisons.
       * @type {Snowflake}
       */
      this.id = data.id;
    } else {
      this.available = true;
      this.setup(data);
    }
  }

  /**
   * Sets up the Guild
   * @param {*} data The raw data of the guild
   * @private
   */


  _createClass(Guild, [{
    key: 'setup',
    value: function setup(data) {
      /**
       * The name of the guild
       * @type {string}
       */
      this.name = data.name;

      /**
       * The hash of the guild icon, or null if there is no icon.
       * @type {?string}
       */
      this.icon = data.icon;

      /**
       * The hash of the guild splash image, or null if no splash (VIP only)
       * @type {?string}
       */
      this.splash = data.splash;

      /**
       * The region the guild is located in
       * @type {string}
       */
      this.region = data.region;

      /**
       * The full amount of members in this guild as of `READY`
       * @type {number}
       */
      this.memberCount = data.member_count || this.memberCount;

      /**
       * Whether the guild is "large" (has more than 250 members)
       * @type {boolean}
       */
      this.large = Boolean('large' in data ? data.large : this.large);

      /**
       * An array of guild features.
       * @type {Object[]}
       */
      this.features = data.features;

      /**
       * The ID of the application that created this guild (if applicable)
       * @type {?Snowflake}
       */
      this.applicationID = data.application_id;

      /**
       * A collection of emojis that are in this guild. The key is the emoji's ID, the value is the emoji.
       * @type {Collection<Snowflake, Emoji>}
       */
      this.emojis = new Collection();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data.emojis[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var emoji = _step.value;
          this.emojis.set(emoji.id, new Emoji(this, emoji));
        } /**
           * The time in seconds before a user is counted as "away from keyboard".
           * @type {?number}
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

      this.afkTimeout = data.afk_timeout;

      /**
       * The ID of the voice channel where AFK members are moved.
       * @type {?string}
       */
      this.afkChannelID = data.afk_channel_id;

      /**
       * Whether embedded images are enabled on this guild.
       * @type {boolean}
       */
      this.embedEnabled = data.embed_enabled;

      /**
       * The verification level of the guild.
       * @type {number}
       */
      this.verificationLevel = data.verification_level;

      /**
       * The timestamp the client user joined the guild at
       * @type {number}
       */
      this.joinedTimestamp = data.joined_at ? new Date(data.joined_at).getTime() : this.joinedTimestamp;

      this.id = data.id;
      this.available = !data.unavailable;
      this.features = data.features || this.features || [];

      if (data.members) {
        this.members.clear();
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = data.members[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var guildUser = _step2.value;
            this._addMember(guildUser, false);
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
      }

      if (data.owner_id) {
        /**
         * The user ID of this guild's owner.
         * @type {Snowflake}
         */
        this.ownerID = data.owner_id;
      }

      if (data.channels) {
        this.channels.clear();
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = data.channels[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var channel = _step3.value;
            this.client.dataManager.newChannel(channel, this);
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

      if (data.roles) {
        this.roles.clear();
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = data.roles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var role = _step4.value;

            var newRole = new Role(this, role);
            this.roles.set(newRole.id, newRole);
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

      if (data.presences) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = data.presences[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var presence = _step5.value;

            this._setPresence(presence.user.id, presence);
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

      this._rawVoiceStates = new Collection();
      if (data.voice_states) {
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = data.voice_states[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var voiceState = _step6.value;

            this._rawVoiceStates.set(voiceState.user_id, voiceState);
            var member = this.members.get(voiceState.user_id);
            if (member) {
              member.serverMute = voiceState.mute;
              member.serverDeaf = voiceState.deaf;
              member.selfMute = voiceState.self_mute;
              member.selfDeaf = voiceState.self_deaf;
              member.voiceSessionID = voiceState.session_id;
              member.voiceChannelID = voiceState.channel_id;
              this.channels.get(voiceState.channel_id).members.set(member.user.id, member);
            }
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
    }

    /**
     * The timestamp the guild was created at
     * @type {number}
     * @readonly
     */

  }, {
    key: 'member',


    /**
     * Returns the GuildMember form of a User object, if the user is present in the guild.
     * @param {UserResolvable} user The user that you want to obtain the GuildMember of
     * @returns {?GuildMember}
     * @example
     * // get the guild member of a user
     * const member = guild.member(message.author);
     */
    value: function member(user) {
      return this.client.resolver.resolveGuildMember(this, user);
    }

    /**
     * Fetch a collection of banned users in this guild.
     * @returns {Promise<Collection<Snowflake, User>>}
     */

  }, {
    key: 'fetchBans',
    value: function fetchBans() {
      return this.client.rest.methods.getGuildBans(this);
    }

    /**
     * Fetch a collection of invites to this guild. Resolves with a collection mapping invites by their codes.
     * @returns {Promise<Collection<string, Invite>>}
     */

  }, {
    key: 'fetchInvites',
    value: function fetchInvites() {
      return this.client.rest.methods.getGuildInvites(this);
    }

    /**
     * Fetch all webhooks for the guild.
     * @returns {Collection<Snowflake, Webhook>}
     */

  }, {
    key: 'fetchWebhooks',
    value: function fetchWebhooks() {
      return this.client.rest.methods.getGuildWebhooks(this);
    }

    /**
     * Fetch available voice regions
     * @returns {Collection<string, VoiceRegion>}
     */

  }, {
    key: 'fetchVoiceRegions',
    value: function fetchVoiceRegions() {
      return this.client.rest.methods.fetchVoiceRegions(this.id);
    }

    /**
     * Adds a user to the guild using OAuth2. Requires the `CREATE_INSTANT_INVITE` permission.
     * @param {UserResolvable} user User to add to the guild
     * @param {Object} options Options for the addition
     * @param {string} options.accessToken An OAuth2 access token for the user with the `guilds.join` scope granted to the
     * bot's application
     * @param {string} [options.nick] Nickname to give the member (requires `MANAGE_NICKNAMES`)
     * @param {Collection<Snowflake, Role>|Role[]|Snowflake[]} [options.roles] Roles to add to the member
     * (requires `MANAGE_ROLES`)
     * @param {boolean} [options.mute] Whether the member should be muted (requires `MUTE_MEMBERS`)
     * @param {boolean} [options.deaf] Whether the member should be deafened (requires `DEAFEN_MEMBERS`)
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'addMember',
    value: function addMember(user, options) {
      if (this.members.has(user.id)) return Promise.resolve(this.members.get(user.id));
      return this.client.rest.methods.putGuildMember(this, user, options);
    }

    /**
     * Fetch a single guild member from a user.
     * @param {UserResolvable} user The user to fetch the member for
     * @param {boolean} [cache=true] Insert the user into the users cache
     * @returns {Promise<GuildMember>}
     */

  }, {
    key: 'fetchMember',
    value: function fetchMember(user) {
      var cache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      user = this.client.resolver.resolveUser(user);
      if (!user) return Promise.reject(new Error('User is not cached. Use Client.fetchUser first.'));
      if (this.members.has(user.id)) return Promise.resolve(this.members.get(user.id));
      return this.client.rest.methods.getGuildMember(this, user, cache);
    }

    /**
     * Fetches all the members in the guild, even if they are offline. If the guild has less than 250 members,
     * this should not be necessary.
     * @param {string} [query=''] Limit fetch to members with similar usernames
     * @param {number} [limit=0] Maximum number of members to request
     * @returns {Promise<Guild>}
     */

  }, {
    key: 'fetchMembers',
    value: function fetchMembers() {
      var _this = this;

      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      return new Promise(function (resolve, reject) {
        if (_this.memberCount === _this.members.size) {
          // Uncomment in v12
          // resolve(this.members)
          resolve(_this);
          return;
        }
        _this.client.ws.send({
          op: Constants.OPCodes.REQUEST_GUILD_MEMBERS,
          d: {
            guild_id: _this.id,
            query: query,
            limit: limit
          }
        });
        var handler = function handler(members, guild) {
          if (guild.id !== _this.id) return;
          if (_this.memberCount === _this.members.size || members.length < 1000) {
            _this.client.removeListener(Constants.Events.GUILD_MEMBERS_CHUNK, handler);
            // Uncomment in v12
            // resolve(this.members)
            resolve(_this);
          }
        };
        _this.client.on(Constants.Events.GUILD_MEMBERS_CHUNK, handler);
        _this.client.setTimeout(function () {
          return reject(new Error('Members didn\'t arrive in time.'));
        }, 120 * 1000);
      });
    }

    /**
     * Performs a search within the entire guild.
     * @param {MessageSearchOptions} [options={}] Options to pass to the search
     * @returns {Promise<Array<Message[]>>}
     * An array containing arrays of messages. Each inner array is a search context cluster.
     * The message which has triggered the result will have the `hit` property set to `true`.
     * @example
     * guild.search({
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
     * The data for editing a guild
     * @typedef {Object} GuildEditData
     * @property {string} [name] The name of the guild
     * @property {string} [region] The region of the guild
     * @property {number} [verificationLevel] The verification level of the guild
     * @property {ChannelResolvable} [afkChannel] The AFK channel of the guild
     * @property {number} [afkTimeout] The AFK timeout of the guild
     * @property {Base64Resolvable} [icon] The icon of the guild
     * @property {GuildMemberResolvable} [owner] The owner of the guild
     * @property {Base64Resolvable} [splash] The splash screen of the guild
     */

    /**
     * Updates the Guild with new information - e.g. a new name.
     * @param {GuildEditData} data The data to update the guild with
     * @returns {Promise<Guild>}
     * @example
     * // set the guild name and region
     * guild.edit({
     *  name: 'Discord Guild',
     *  region: 'london',
     * })
     * .then(updated => console.log(`New guild name ${updated.name} in region ${updated.region}`))
     * .catch(console.error);
     */

  }, {
    key: 'edit',
    value: function edit(data) {
      return this.client.rest.methods.updateGuild(this, data);
    }

    /**
     * Edit the name of the guild.
     * @param {string} name The new name of the guild
     * @returns {Promise<Guild>}
     * @example
     * // edit the guild name
     * guild.setName('Discord Guild')
     *  .then(updated => console.log(`Updated guild name to ${guild.name}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setName',
    value: function setName(name) {
      return this.edit({ name: name });
    }

    /**
     * Edit the region of the guild.
     * @param {string} region The new region of the guild.
     * @returns {Promise<Guild>}
     * @example
     * // edit the guild region
     * guild.setRegion('london')
     *  .then(updated => console.log(`Updated guild region to ${guild.region}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setRegion',
    value: function setRegion(region) {
      return this.edit({ region: region });
    }

    /**
     * Edit the verification level of the guild.
     * @param {number} verificationLevel The new verification level of the guild
     * @returns {Promise<Guild>}
     * @example
     * // edit the guild verification level
     * guild.setVerificationLevel(1)
     *  .then(updated => console.log(`Updated guild verification level to ${guild.verificationLevel}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setVerificationLevel',
    value: function setVerificationLevel(verificationLevel) {
      return this.edit({ verificationLevel: verificationLevel });
    }

    /**
     * Edit the AFK channel of the guild.
     * @param {ChannelResolvable} afkChannel The new AFK channel
     * @returns {Promise<Guild>}
     * @example
     * // edit the guild AFK channel
     * guild.setAFKChannel(channel)
     *  .then(updated => console.log(`Updated guild AFK channel to ${guild.afkChannel}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setAFKChannel',
    value: function setAFKChannel(afkChannel) {
      return this.edit({ afkChannel: afkChannel });
    }

    /**
     * Edit the AFK timeout of the guild.
     * @param {number} afkTimeout The time in seconds that a user must be idle to be considered AFK
     * @returns {Promise<Guild>}
     * @example
     * // edit the guild AFK channel
     * guild.setAFKTimeout(60)
     *  .then(updated => console.log(`Updated guild AFK timeout to ${guild.afkTimeout}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setAFKTimeout',
    value: function setAFKTimeout(afkTimeout) {
      return this.edit({ afkTimeout: afkTimeout });
    }

    /**
     * Set a new guild icon.
     * @param {Base64Resolvable} icon The new icon of the guild
     * @returns {Promise<Guild>}
     * @example
     * // edit the guild icon
     * guild.setIcon(fs.readFileSync('./icon.png'))
     *  .then(updated => console.log('Updated the guild icon'))
     *  .catch(console.error);
     */

  }, {
    key: 'setIcon',
    value: function setIcon(icon) {
      return this.edit({ icon: icon });
    }

    /**
     * Sets a new owner of the guild.
     * @param {GuildMemberResolvable} owner The new owner of the guild
     * @returns {Promise<Guild>}
     * @example
     * // edit the guild owner
     * guild.setOwner(guilds.members[0])
     *  .then(updated => console.log(`Updated the guild owner to ${updated.owner.username}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setOwner',
    value: function setOwner(owner) {
      return this.edit({ owner: owner });
    }

    /**
     * Set a new guild splash screen.
     * @param {Base64Resolvable} splash The new splash screen of the guild
     * @returns {Promise<Guild>}
     * @example
     * // edit the guild splash
     * guild.setIcon(fs.readFileSync('./splash.png'))
     *  .then(updated => console.log('Updated the guild splash'))
     *  .catch(console.error);
     */

  }, {
    key: 'setSplash',
    value: function setSplash(splash) {
      return this.edit({ splash: splash });
    }

    /**
     * Bans a user from the guild.
     * @param {UserResolvable} user The user to ban
     * @param {number} [deleteDays=0] The amount of days worth of messages from this user that should
     * also be deleted. Between `0` and `7`.
     * @returns {Promise<GuildMember|User|string>} Result object will be resolved as specifically as possible.
     * If the GuildMember cannot be resolved, the User will instead be attempted to be resolved. If that also cannot
     * be resolved, the user ID will be the result.
     * @example
     * // ban a user by ID (or with a user/guild member object)
     * guild.ban('some user ID')
     *  .then(user => console.log(`Banned ${user.username || user.id || user} from ${guild.name}`))
     *  .catch(console.error);
     */

  }, {
    key: 'ban',
    value: function ban(user) {
      var deleteDays = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      return this.client.rest.methods.banGuildMember(this, user, deleteDays);
    }

    /**
     * Unbans a user from the guild.
     * @param {UserResolvable} user The user to unban
     * @returns {Promise<User>}
     * @example
     * // unban a user by ID (or with a user/guild member object)
     * guild.unban('some user ID')
     *  .then(user => console.log(`Unbanned ${user.username} from ${guild.name}`))
     *  .catch(console.error);
     */

  }, {
    key: 'unban',
    value: function unban(user) {
      return this.client.rest.methods.unbanGuildMember(this, user);
    }

    /**
     * Prunes members from the guild based on how long they have been inactive.
     * @param {number} days Number of days of inactivity required to kick
     * @param {boolean} [dry=false] If true, will return number of users that will be kicked, without actually doing it
     * @returns {Promise<number>} The number of members that were/will be kicked
     * @example
     * // see how many members will be pruned
     * guild.pruneMembers(12, true)
     *   .then(pruned => console.log(`This will prune ${pruned} people!`))
     *   .catch(console.error);
     * @example
     * // actually prune the members
     * guild.pruneMembers(12)
     *   .then(pruned => console.log(`I just pruned ${pruned} people!`))
     *   .catch(console.error);
     */

  }, {
    key: 'pruneMembers',
    value: function pruneMembers(days) {
      var dry = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (typeof days !== 'number') throw new TypeError('Days must be a number.');
      return this.client.rest.methods.pruneGuildMembers(this, days, dry);
    }

    /**
     * Syncs this guild (already done automatically every 30 seconds).
     * <warn>This is only available when using a user account.</warn>
     */

  }, {
    key: 'sync',
    value: function sync() {
      if (!this.client.user.bot) this.client.syncGuilds([this]);
    }

    /**
     * Creates a new channel in the guild.
     * @param {string} name The name of the new channel
     * @param {string} type The type of the new channel, either `text` or `voice`
     * @param {Array<PermissionOverwrites|Object>} overwrites Permission overwrites to apply to the new channel
     * @returns {Promise<TextChannel|VoiceChannel>}
     * @example
     * // create a new text channel
     * guild.createChannel('new-general', 'text')
     *  .then(channel => console.log(`Created new channel ${channel}`))
     *  .catch(console.error);
     */

  }, {
    key: 'createChannel',
    value: function createChannel(name, type, overwrites) {
      return this.client.rest.methods.createChannel(this, name, type, overwrites);
    }

    /**
     * The data needed for updating a channel's position.
     * @typedef {Object} ChannelPosition
     * @property {ChannelResolvable} channel Channel to update
     * @property {number} position New position for the channel
     */

    /**
     * Batch-updates the guild's channels' positions.
     * @param {ChannelPosition[]} channelPositions Channel positions to update
     * @returns {Promise<Guild>}
     * @example
     * guild.updateChannels([{ channel: channelID, position: newChannelIndex }])
     *  .then(guild => console.log(`Updated channel positions for ${guild.id}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setChannelPositions',
    value: function setChannelPositions(channelPositions) {
      return this.client.rest.methods.updateChannelPositions(this.id, channelPositions);
    }

    /**
     * Creates a new role in the guild with given information
     * @param {RoleData} [data] The data to update the role with
     * @returns {Promise<Role>}
     * @example
     * // create a new role
     * guild.createRole()
     *  .then(role => console.log(`Created role ${role}`))
     *  .catch(console.error);
     * @example
     * // create a new role with data
     * guild.createRole({
     *   name: 'Super Cool People',
     *   color: 'BLUE',
     * })
     * .then(role => console.log(`Created role ${role}`))
     * .catch(console.error)
     */

  }, {
    key: 'createRole',
    value: function createRole(data) {
      return this.client.rest.methods.createGuildRole(this, data);
    }

    /**
     * Set the position of a role in this guild
     * @param {Role|Snowflake} role the role to edit, can be a role object or a role ID.
     * @param {number} position the new position of the role
     * @param {boolean} [relative=false] Position moves the role relative to its current position
     * @returns {Promise<Guild>}
     */

  }, {
    key: 'setRolePosition',
    value: function setRolePosition(role, position) {
      var relative = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (typeof role === 'string') {
        role = this.roles.get(role);
        if (!role) return Promise.reject(new Error('Supplied role is not a role or string.'));
      }

      position = Number(position);
      if (isNaN(position)) return Promise.reject(new Error('Supplied position is not a number.'));

      var updatedRoles = Object.assign([], this.roles.array().sort(function (r1, r2) {
        return r1.position !== r2.position ? r1.position - r2.position : r1.id - r2.id;
      }));

      Util.moveElementInArray(updatedRoles, role, position, relative);

      updatedRoles = updatedRoles.map(function (r, i) {
        return { id: r.id, position: i };
      });
      return this.client.rest.methods.setRolePositions(this.id, updatedRoles);
    }

    /**
     * Creates a new custom emoji in the guild.
     * @param {BufferResolvable|Base64Resolvable} attachment The image for the emoji.
     * @param {string} name The name for the emoji.
     * @param {Collection<Snowflake, Role>|Role[]} [roles] Roles to limit the emoji to
     * @returns {Promise<Emoji>} The created emoji.
     * @example
     * // create a new emoji from a url
     * guild.createEmoji('https://i.imgur.com/w3duR07.png', 'rip')
     *  .then(emoji => console.log(`Created new emoji with name ${emoji.name}!`))
     *  .catch(console.error);
     * @example
     * // create a new emoji from a file on your computer
     * guild.createEmoji('./memes/banana.png', 'banana')
     *  .then(emoji => console.log(`Created new emoji with name ${emoji.name}!`))
     *  .catch(console.error);
     */

  }, {
    key: 'createEmoji',
    value: function createEmoji(attachment, name, roles) {
      var _this2 = this;

      return new Promise(function (resolve) {
        if (typeof attachment === 'string' && attachment.startsWith('data:')) {
          resolve(_this2.client.rest.methods.createEmoji(_this2, attachment, name, roles));
        } else {
          _this2.client.resolver.resolveBuffer(attachment).then(function (data) {
            var dataURI = _this2.client.resolver.resolveBase64(data);
            resolve(_this2.client.rest.methods.createEmoji(_this2, dataURI, name, roles));
          });
        }
      });
    }

    /**
     * Delete an emoji.
     * @param {Emoji|string} emoji The emoji to delete.
     * @returns {Promise}
     */

  }, {
    key: 'deleteEmoji',
    value: function deleteEmoji(emoji) {
      if (!(emoji instanceof Emoji)) emoji = this.emojis.get(emoji);
      return this.client.rest.methods.deleteEmoji(emoji);
    }

    /**
     * Causes the Client to leave the guild.
     * @returns {Promise<Guild>}
     * @example
     * // leave a guild
     * guild.leave()
     *  .then(g => console.log(`Left the guild ${g}`))
     *  .catch(console.error);
     */

  }, {
    key: 'leave',
    value: function leave() {
      return this.client.rest.methods.leaveGuild(this);
    }

    /**
     * Causes the Client to delete the guild.
     * @returns {Promise<Guild>}
     * @example
     * // delete a guild
     * guild.delete()
     *  .then(g => console.log(`Deleted the guild ${g}`))
     *  .catch(console.error);
     */

  }, {
    key: 'delete',
    value: function _delete() {
      return this.client.rest.methods.deleteGuild(this);
    }

    /**
     * Marks all messages in this guild as read
     * <warn>This is only available when using a user account.</warn>
     * @returns {Promise<Guild>} this guild
     */

  }, {
    key: 'acknowledge',
    value: function acknowledge() {
      return this.client.rest.methods.ackGuild(this);
    }

    /**
     * Whether this Guild equals another Guild. It compares all properties, so for most operations
     * it is advisable to just compare `guild.id === guild2.id` as it is much faster and is often
     * what most users need.
     * @param {Guild} guild Guild to compare with
     * @returns {boolean}
     */

  }, {
    key: 'equals',
    value: function equals(guild) {
      var equal = guild && this.id === guild.id && this.available === !guild.unavailable && this.splash === guild.splash && this.region === guild.region && this.name === guild.name && this.memberCount === guild.member_count && this.large === guild.large && this.icon === guild.icon && Util.arraysEqual(this.features, guild.features) && this.ownerID === guild.owner_id && this.verificationLevel === guild.verification_level && this.embedEnabled === guild.embed_enabled;

      if (equal) {
        if (this.embedChannel) {
          if (this.embedChannel.id !== guild.embed_channel_id) equal = false;
        } else if (guild.embed_channel_id) {
          equal = false;
        }
      }

      return equal;
    }

    /**
     * When concatenated with a string, this automatically concatenates the guild's name instead of the Guild object.
     * @returns {string}
     * @example
     * // logs: Hello from My Guild!
     * console.log(`Hello from ${guild}!`);
     * @example
     * // logs: Hello from My Guild!
     * console.log(`Hello from ' + guild + '!');
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.name;
    }
  }, {
    key: '_addMember',
    value: function _addMember(guildUser) {
      var emitEvent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      var existing = this.members.has(guildUser.user.id);
      if (!(guildUser.user instanceof User)) guildUser.user = this.client.dataManager.newUser(guildUser.user);

      guildUser.joined_at = guildUser.joined_at || 0;
      var member = new GuildMember(this, guildUser);
      this.members.set(member.id, member);

      if (this._rawVoiceStates && this._rawVoiceStates.has(member.user.id)) {
        var voiceState = this._rawVoiceStates.get(member.user.id);
        member.serverMute = voiceState.mute;
        member.serverDeaf = voiceState.deaf;
        member.selfMute = voiceState.self_mute;
        member.selfDeaf = voiceState.self_deaf;
        member.voiceSessionID = voiceState.session_id;
        member.voiceChannelID = voiceState.channel_id;
        if (this.client.channels.has(voiceState.channel_id)) {
          this.client.channels.get(voiceState.channel_id).members.set(member.user.id, member);
        } else {
          this.client.emit('warn', 'Member ' + member.id + ' added in guild ' + this.id + ' with an uncached voice channel');
        }
      }

      /**
       * Emitted whenever a user joins a guild.
       * @event Client#guildMemberAdd
       * @param {GuildMember} member The member that has joined a guild
       */
      if (this.client.ws.status === Constants.Status.READY && emitEvent && !existing) {
        this.client.emit(Constants.Events.GUILD_MEMBER_ADD, member);
      }

      return member;
    }
  }, {
    key: '_updateMember',
    value: function _updateMember(member, data) {
      var oldMember = Util.cloneObject(member);

      if (data.roles) member._roles = data.roles;
      if (typeof data.nick !== 'undefined') member.nickname = data.nick;

      var notSame = member.nickname !== oldMember.nickname || !Util.arraysEqual(member._roles, oldMember._roles);

      if (this.client.ws.status === Constants.Status.READY && notSame) {
        /**
         * Emitted whenever a guild member changes - i.e. new role, removed role, nickname
         * @event Client#guildMemberUpdate
         * @param {GuildMember} oldMember The member before the update
         * @param {GuildMember} newMember The member after the update
         */
        this.client.emit(Constants.Events.GUILD_MEMBER_UPDATE, oldMember, member);
      }

      return {
        old: oldMember,
        mem: member
      };
    }
  }, {
    key: '_removeMember',
    value: function _removeMember(guildMember) {
      this.members.delete(guildMember.id);
    }
  }, {
    key: '_memberSpeakUpdate',
    value: function _memberSpeakUpdate(user, speaking) {
      var member = this.members.get(user);
      if (member && member.speaking !== speaking) {
        member.speaking = speaking;
        /**
         * Emitted once a guild member starts/stops speaking
         * @event Client#guildMemberSpeaking
         * @param {GuildMember} member The member that started/stopped speaking
         * @param {boolean} speaking Whether or not the member is speaking
         */
        this.client.emit(Constants.Events.GUILD_MEMBER_SPEAKING, member, speaking);
      }
    }
  }, {
    key: '_setPresence',
    value: function _setPresence(id, presence) {
      if (this.presences.get(id)) {
        this.presences.get(id).update(presence);
        return;
      }
      this.presences.set(id, new Presence(presence));
    }
  }, {
    key: 'createdTimestamp',
    get: function get() {
      return Snowflake.deconstruct(this.id).timestamp;
    }

    /**
     * The time the guild was created
     * @type {Date}
     * @readonly
     */

  }, {
    key: 'createdAt',
    get: function get() {
      return new Date(this.createdTimestamp);
    }

    /**
     * The time the client user joined the guild
     * @type {Date}
     * @readonly
     */

  }, {
    key: 'joinedAt',
    get: function get() {
      return new Date(this.joinedTimestamp);
    }

    /**
     * Gets the URL to this guild's icon (if it has one, otherwise it returns null)
     * @type {?string}
     * @readonly
     */

  }, {
    key: 'iconURL',
    get: function get() {
      if (!this.icon) return null;
      return Constants.Endpoints.guildIcon(this.id, this.icon);
    }

    /**
     * Gets the URL to this guild's splash (if it has one, otherwise it returns null)
     * @type {?string}
     * @readonly
     */

  }, {
    key: 'splashURL',
    get: function get() {
      if (!this.splash) return null;
      return Constants.Endpoints.guildSplash(this.id, this.splash);
    }

    /**
     * The owner of the guild
     * @type {GuildMember}
     * @readonly
     */

  }, {
    key: 'owner',
    get: function get() {
      return this.members.get(this.ownerID);
    }

    /**
     * If the client is connected to any voice channel in this guild, this will be the relevant VoiceConnection.
     * @type {?VoiceConnection}
     * @readonly
     */

  }, {
    key: 'voiceConnection',
    get: function get() {
      if (this.client.browser) return null;
      return this.client.voice.connections.get(this.id) || null;
    }

    /**
     * The `#general` TextChannel of the server.
     * @type {TextChannel}
     * @readonly
     */

  }, {
    key: 'defaultChannel',
    get: function get() {
      return this.channels.get(this.id);
    }
  }]);

  return Guild;
}();

module.exports = Guild;