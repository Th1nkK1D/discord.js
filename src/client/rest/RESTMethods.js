'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var querystring = require('querystring');
var long = require('long');
var Permissions = require('../../util/Permissions');
var Constants = require('../../util/Constants');
var Collection = require('../../util/Collection');
var Snowflake = require('../../util/Snowflake');
var Util = require('../../util/Util');

var User = require('../../structures/User');
var GuildMember = require('../../structures/GuildMember');
var Message = require('../../structures/Message');
var Role = require('../../structures/Role');
var Invite = require('../../structures/Invite');
var Webhook = require('../../structures/Webhook');
var UserProfile = require('../../structures/UserProfile');
var OAuth2Application = require('../../structures/OAuth2Application');
var Channel = require('../../structures/Channel');
var GroupDMChannel = require('../../structures/GroupDMChannel');
var Guild = require('../../structures/Guild');
var VoiceRegion = require('../../structures/VoiceRegion');

var RESTMethods = function () {
  function RESTMethods(restManager) {
    _classCallCheck(this, RESTMethods);

    this.rest = restManager;
    this.client = restManager.client;
    this._ackToken = null;
  }

  _createClass(RESTMethods, [{
    key: 'login',
    value: function login() {
      var _this = this;

      var token = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.client.token;

      return new Promise(function (resolve, reject) {
        if (typeof token !== 'string') throw new Error(Constants.Errors.INVALID_TOKEN);
        token = token.replace(/^Bot\s*/i, '');
        _this.client.manager.connectToWebSocket(token, resolve, reject);
      });
    }
  }, {
    key: 'logout',
    value: function logout() {
      return this.rest.makeRequest('post', Constants.Endpoints.logout, true, {});
    }
  }, {
    key: 'getGateway',
    value: function getGateway() {
      var _this2 = this;

      return this.rest.makeRequest('get', Constants.Endpoints.gateway, true).then(function (res) {
        _this2.client.ws.gateway = res.url + '/?v=' + Constants.PROTOCOL_VERSION;
        return _this2.client.ws.gateway;
      });
    }
  }, {
    key: 'getBotGateway',
    value: function getBotGateway() {
      return this.rest.makeRequest('get', Constants.Endpoints.botGateway, true);
    }
  }, {
    key: 'fetchVoiceRegions',
    value: function fetchVoiceRegions(guildID) {
      var endpoint = Constants.Endpoints[guildID ? 'guildVoiceRegions' : 'voiceRegions'];
      return this.rest.makeRequest('get', guildID ? endpoint(guildID) : endpoint, true).then(function (res) {
        var regions = new Collection();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = res[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var region = _step.value;
            regions.set(region.id, new VoiceRegion(region));
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

        return regions;
      });
    }
  }, {
    key: 'sendMessage',
    value: function sendMessage(channel, content) {
      var _this3 = this;

      var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          tts = _ref.tts,
          nonce = _ref.nonce,
          embed = _ref.embed,
          disableEveryone = _ref.disableEveryone,
          split = _ref.split,
          code = _ref.code,
          reply = _ref.reply;

      var files = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      return new Promise(function (resolve, reject) {
        // eslint-disable-line complexity
        if (typeof content !== 'undefined') content = _this3.client.resolver.resolveString(content);

        if (content) {
          if (split && (typeof split === 'undefined' ? 'undefined' : _typeof(split)) !== 'object') split = {};

          // Wrap everything in a code block
          if (typeof code !== 'undefined' && (typeof code !== 'boolean' || code === true)) {
            content = Util.escapeMarkdown(_this3.client.resolver.resolveString(content), true);
            content = '```' + (typeof code !== 'boolean' ? code || '' : '') + '\n' + content + '\n```';
            if (split) {
              split.prepend = '```' + (typeof code !== 'boolean' ? code || '' : '') + '\n';
              split.append = '\n```';
            }
          }

          // Add zero-width spaces to @everyone/@here
          if (disableEveryone || typeof disableEveryone === 'undefined' && _this3.client.options.disableEveryone) {
            content = content.replace(/@(everyone|here)/g, '@\u200B$1');
          }

          // Add the reply prefix
          if (reply && !(channel instanceof User || channel instanceof GuildMember) && channel.type !== 'dm') {
            var id = _this3.client.resolver.resolveUserID(reply);
            var mention = '<@' + (reply instanceof GuildMember && reply.nickname ? '!' : '') + id + '>';
            content = '' + mention + (content ? ', ' + content : '');
            if (split) split.prepend = mention + ', ' + (split.prepend || '');
          }

          // Split the content
          if (split) content = Util.splitMessage(content, split);
        } else if (reply && !(channel instanceof User || channel instanceof GuildMember) && channel.type !== 'dm') {
          var _id = _this3.client.resolver.resolveUserID(reply);
          content = '<@' + (reply instanceof GuildMember && reply.nickname ? '!' : '') + _id + '>';
        }

        var send = function send(chan) {
          if (content instanceof Array) {
            var messages = [];
            (function sendChunk(list, index) {
              var options = index === list.length ? { tts: tts, embed: embed } : { tts: tts };
              chan.send(list[index], options, index === list.length ? files : null).then(function (message) {
                messages.push(message);
                if (index >= list.length - 1) return resolve(messages);
                return sendChunk(list, ++index);
              });
            })(content, 0);
          } else {
            _this3.rest.makeRequest('post', Constants.Endpoints.channelMessages(chan.id), true, {
              content: content, tts: tts, nonce: nonce, embed: embed
            }, files).then(function (data) {
              return resolve(_this3.client.actions.MessageCreate.handle(data).message);
            }, reject);
          }
        };

        if (channel instanceof User || channel instanceof GuildMember) {
          _this3.createDM(channel).then(send, reject);
        } else {
          send(channel);
        }
      });
    }
  }, {
    key: 'updateMessage',
    value: function updateMessage(message, content) {
      var _this4 = this;

      var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          embed = _ref2.embed,
          code = _ref2.code,
          reply = _ref2.reply;

      if (typeof content !== 'undefined') content = this.client.resolver.resolveString(content);

      // Wrap everything in a code block
      if (typeof code !== 'undefined' && (typeof code !== 'boolean' || code === true)) {
        content = Util.escapeMarkdown(this.client.resolver.resolveString(content), true);
        content = '```' + (typeof code !== 'boolean' ? code || '' : '') + '\n' + content + '\n```';
      }

      // Add the reply prefix
      if (reply && message.channel.type !== 'dm') {
        var id = this.client.resolver.resolveUserID(reply);
        var mention = '<@' + (reply instanceof GuildMember && reply.nickname ? '!' : '') + id + '>';
        content = '' + mention + (content ? ', ' + content : '');
      }

      return this.rest.makeRequest('patch', Constants.Endpoints.channelMessage(message.channel.id, message.id), true, {
        content: content, embed: embed
      }).then(function (data) {
        return _this4.client.actions.MessageUpdate.handle(data).updated;
      });
    }
  }, {
    key: 'deleteMessage',
    value: function deleteMessage(message) {
      var _this5 = this;

      return this.rest.makeRequest('del', Constants.Endpoints.channelMessage(message.channel.id, message.id), true).then(function () {
        return _this5.client.actions.MessageDelete.handle({
          id: message.id,
          channel_id: message.channel.id
        }).message;
      });
    }
  }, {
    key: 'ackMessage',
    value: function ackMessage(message) {
      var _this6 = this;

      return this.rest.makeRequest('post', Constants.Endpoints.channelMessage(message.channel.id, message.id) + '/ack', true, { token: this._ackToken }).then(function (res) {
        _this6._ackToken = res.token;
        return message;
      });
    }
  }, {
    key: 'ackTextChannel',
    value: function ackTextChannel(channel) {
      var _this7 = this;

      return this.rest.makeRequest('post', Constants.Endpoints.channel(channel.id) + '/ack', true, { token: this._ackToken }).then(function (res) {
        _this7._ackToken = res.token;
        return channel;
      });
    }
  }, {
    key: 'ackGuild',
    value: function ackGuild(guild) {
      return this.rest.makeRequest('post', Constants.Endpoints.guild(guild.id) + '/ack', true).then(function () {
        return guild;
      });
    }
  }, {
    key: 'bulkDeleteMessages',
    value: function bulkDeleteMessages(channel, messages, filterOld) {
      var _this8 = this;

      if (filterOld) {
        messages = messages.filter(function (id) {
          return Date.now() - Snowflake.deconstruct(id).date.getTime() < 1209600000;
        });
      }
      return this.rest.makeRequest('post', Constants.Endpoints.channelMessages(channel.id) + '/bulk-delete', true, {
        messages: messages
      }).then(function () {
        return _this8.client.actions.MessageDeleteBulk.handle({
          channel_id: channel.id,
          ids: messages
        }).messages;
      });
    }
  }, {
    key: 'search',
    value: function search(target, options) {
      var _this9 = this;

      if (options.before) {
        if (!(options.before instanceof Date)) options.before = new Date(options.before);
        options.maxID = long.fromNumber(options.before.getTime() - 14200704e5).shiftLeft(22).toString();
      }
      if (options.after) {
        if (!(options.after instanceof Date)) options.after = new Date(options.after);
        options.minID = long.fromNumber(options.after.getTime() - 14200704e5).shiftLeft(22).toString();
      }
      if (options.during) {
        if (!(options.during instanceof Date)) options.during = new Date(options.during);
        var t = options.during.getTime() - 14200704e5;
        options.minID = long.fromNumber(t).shiftLeft(22).toString();
        options.maxID = long.fromNumber(t + 86400000).shiftLeft(22).toString();
      }
      if (options.channel) options.channel = this.client.resolver.resolveChannelID(options.channel);
      if (options.author) options.author = this.client.resolver.resolveUserID(options.author);
      if (options.mentions) options.mentions = this.client.resolver.resolveUserID(options.options.mentions);
      options = {
        content: options.content,
        max_id: options.maxID,
        min_id: options.minID,
        has: options.has,
        channel_id: options.channel,
        author_id: options.author,
        author_type: options.authorType,
        context_size: options.contextSize,
        sort_by: options.sortBy,
        sort_order: options.sortOrder,
        limit: options.limit,
        offset: options.offset,
        mentions: options.mentions,
        mentions_everyone: options.mentionsEveryone,
        link_hostname: options.linkHostname,
        embed_provider: options.embedProvider,
        embed_type: options.embedType,
        attachment_filename: options.attachmentFilename,
        attachment_extension: options.attachmentExtension
      };

      for (var key in options) {
        if (options[key] === undefined) delete options[key];
      }var queryString = (querystring.stringify(options).match(/[^=&?]+=[^=&?]+/g) || []).join('&');

      var type = void 0;
      if (target instanceof Channel) {
        type = 'channel';
      } else if (target instanceof Guild) {
        type = 'guild';
      } else {
        throw new TypeError('Target must be a TextChannel, DMChannel, GroupDMChannel, or Guild.');
      }

      var url = Constants.Endpoints[type + 'Search'](target.id) + '?' + queryString;
      return this.rest.makeRequest('get', url, true).then(function (body) {
        var messages = body.messages.map(function (x) {
          return x.map(function (m) {
            return new Message(_this9.client.channels.get(m.channel_id), m, _this9.client);
          });
        });
        return {
          totalResults: body.total_results,
          messages: messages
        };
      });
    }
  }, {
    key: 'createChannel',
    value: function createChannel(guild, channelName, channelType, overwrites) {
      var _this10 = this;

      if (overwrites instanceof Collection) overwrites = overwrites.array();
      return this.rest.makeRequest('post', Constants.Endpoints.guildChannels(guild.id), true, {
        name: channelName,
        type: channelType,
        permission_overwrites: overwrites
      }).then(function (data) {
        return _this10.client.actions.ChannelCreate.handle(data).channel;
      });
    }
  }, {
    key: 'createDM',
    value: function createDM(recipient) {
      var _this11 = this;

      var dmChannel = this.getExistingDM(recipient);
      if (dmChannel) return Promise.resolve(dmChannel);
      return this.rest.makeRequest('post', Constants.Endpoints.userChannels(this.client.user.id), true, {
        recipient_id: recipient.id
      }).then(function (data) {
        return _this11.client.actions.ChannelCreate.handle(data).channel;
      });
    }
  }, {
    key: 'createGroupDM',
    value: function createGroupDM(options) {
      var _this12 = this;

      var data = this.client.user.bot ? { access_tokens: options.accessTokens, nicks: options.nicks } : { recipients: options.recipients };

      return this.rest.makeRequest('post', Constants.Endpoints.meChannels, true, data).then(function (res) {
        return new GroupDMChannel(_this12.client, res);
      });
    }
  }, {
    key: 'addUserToGroupDM',
    value: function addUserToGroupDM(channel, options) {
      var data = this.client.user.bot ? { nick: options.nick, access_token: options.accessToken } : { recipient: options.id };
      return this.rest.makeRequest('put', Constants.Endpoints.dmChannelRecipient(channel.id, options.id), true, data).then(function () {
        return channel;
      });
    }
  }, {
    key: 'getExistingDM',
    value: function getExistingDM(recipient) {
      return this.client.channels.find(function (channel) {
        return channel.recipient && channel.recipient.id === recipient.id;
      });
    }
  }, {
    key: 'deleteChannel',
    value: function deleteChannel(channel) {
      var _this13 = this;

      if (channel instanceof User || channel instanceof GuildMember) channel = this.getExistingDM(channel);
      if (!channel) return Promise.reject(new Error('No channel to delete.'));
      return this.rest.makeRequest('del', Constants.Endpoints.channel(channel.id), true).then(function (data) {
        data.id = channel.id;
        return _this13.client.actions.ChannelDelete.handle(data).channel;
      });
    }
  }, {
    key: 'updateChannel',
    value: function updateChannel(channel, _data) {
      var _this14 = this;

      var data = {};
      data.name = (_data.name || channel.name).trim();
      data.topic = _data.topic || channel.topic;
      data.position = _data.position || channel.position;
      data.bitrate = _data.bitrate || channel.bitrate;
      data.user_limit = _data.userLimit || channel.userLimit;
      return this.rest.makeRequest('patch', Constants.Endpoints.channel(channel.id), true, data).then(function (newData) {
        return _this14.client.actions.ChannelUpdate.handle(newData).updated;
      });
    }
  }, {
    key: 'leaveGuild',
    value: function leaveGuild(guild) {
      var _this15 = this;

      if (guild.ownerID === this.client.user.id) return Promise.reject(new Error('Guild is owned by the client.'));
      return this.rest.makeRequest('del', Constants.Endpoints.meGuild(guild.id), true).then(function () {
        return _this15.client.actions.GuildDelete.handle({ id: guild.id }).guild;
      });
    }
  }, {
    key: 'createGuild',
    value: function createGuild(options) {
      var _this16 = this;

      options.icon = this.client.resolver.resolveBase64(options.icon) || null;
      options.region = options.region || 'us-central';
      return new Promise(function (resolve, reject) {
        _this16.rest.makeRequest('post', Constants.Endpoints.guilds, true, options).then(function (data) {
          if (_this16.client.guilds.has(data.id)) {
            resolve(_this16.client.guilds.get(data.id));
            return;
          }

          var handleGuild = function handleGuild(guild) {
            if (guild.id === data.id) {
              _this16.client.removeListener('guildCreate', handleGuild);
              _this16.client.clearTimeout(timeout);
              resolve(guild);
            }
          };
          _this16.client.on('guildCreate', handleGuild);

          var timeout = _this16.client.setTimeout(function () {
            _this16.client.removeListener('guildCreate', handleGuild);
            reject(new Error('Took too long to receive guild data.'));
          }, 10000);
        }, reject);
      });
    }

    // Untested but probably will work

  }, {
    key: 'deleteGuild',
    value: function deleteGuild(guild) {
      var _this17 = this;

      return this.rest.makeRequest('del', Constants.Endpoints.guild(guild.id), true).then(function () {
        return _this17.client.actions.GuildDelete.handle({ id: guild.id }).guild;
      });
    }
  }, {
    key: 'getUser',
    value: function getUser(userID, cache) {
      var _this18 = this;

      return this.rest.makeRequest('get', Constants.Endpoints.user(userID), true).then(function (data) {
        if (cache) {
          return _this18.client.actions.UserGet.handle(data).user;
        } else {
          return new User(_this18.client, data);
        }
      });
    }
  }, {
    key: 'updateCurrentUser',
    value: function updateCurrentUser(_data, password) {
      var _this19 = this;

      var user = this.client.user;
      var data = {};
      data.username = _data.username || user.username;
      data.avatar = this.client.resolver.resolveBase64(_data.avatar) || user.avatar;
      if (!user.bot) {
        data.email = _data.email || user.email;
        data.password = password;
        if (_data.new_password) data.new_password = _data.newPassword;
      }
      return this.rest.makeRequest('patch', Constants.Endpoints.me, true, data).then(function (newData) {
        return _this19.client.actions.UserUpdate.handle(newData).updated;
      });
    }
  }, {
    key: 'updateGuild',
    value: function updateGuild(guild, _data) {
      var _this20 = this;

      var data = {};
      if (_data.name) data.name = _data.name;
      if (_data.region) data.region = _data.region;
      if (_data.verificationLevel) data.verification_level = Number(_data.verificationLevel);
      if (_data.afkChannel) data.afk_channel_id = this.client.resolver.resolveChannel(_data.afkChannel).id;
      if (_data.afkTimeout) data.afk_timeout = Number(_data.afkTimeout);
      if (_data.icon) data.icon = this.client.resolver.resolveBase64(_data.icon);
      if (_data.owner) data.owner_id = this.client.resolver.resolveUser(_data.owner).id;
      if (_data.splash) data.splash = this.client.resolver.resolveBase64(_data.splash);
      return this.rest.makeRequest('patch', Constants.Endpoints.guild(guild.id), true, data).then(function (newData) {
        return _this20.client.actions.GuildUpdate.handle(newData).updated;
      });
    }
  }, {
    key: 'kickGuildMember',
    value: function kickGuildMember(guild, member) {
      var _this21 = this;

      return this.rest.makeRequest('del', Constants.Endpoints.guildMember(guild.id, member.id), true).then(function () {
        return _this21.client.actions.GuildMemberRemove.handle({
          guild_id: guild.id,
          user: member.user
        }).member;
      });
    }
  }, {
    key: 'createGuildRole',
    value: function createGuildRole(guild, data) {
      var _this22 = this;

      if (data.color) data.color = this.client.resolver.resolveColor(data.color);
      return this.rest.makeRequest('post', Constants.Endpoints.guildRoles(guild.id), true, data).then(function (role) {
        return _this22.client.actions.GuildRoleCreate.handle({
          guild_id: guild.id,
          role: role
        }).role;
      });
    }
  }, {
    key: 'deleteGuildRole',
    value: function deleteGuildRole(role) {
      var _this23 = this;

      return this.rest.makeRequest('del', Constants.Endpoints.guildRole(role.guild.id, role.id), true).then(function () {
        return _this23.client.actions.GuildRoleDelete.handle({
          guild_id: role.guild.id,
          role_id: role.id
        }).role;
      });
    }
  }, {
    key: 'setChannelOverwrite',
    value: function setChannelOverwrite(channel, payload) {
      return this.rest.makeRequest('put', Constants.Endpoints.channelPermissions(channel.id) + '/' + payload.id, true, payload);
    }
  }, {
    key: 'deletePermissionOverwrites',
    value: function deletePermissionOverwrites(overwrite) {
      return this.rest.makeRequest('del', Constants.Endpoints.channelPermissions(overwrite.channel.id) + '/' + overwrite.id, true).then(function () {
        return overwrite;
      });
    }
  }, {
    key: 'getChannelMessages',
    value: function getChannelMessages(channel) {
      var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var params = [];
      if (payload.limit) params.push('limit=' + payload.limit);
      if (payload.around) params.push('around=' + payload.around);else if (payload.before) params.push('before=' + payload.before);else if (payload.after) params.push('after=' + payload.after);

      var endpoint = Constants.Endpoints.channelMessages(channel.id);
      if (params.length > 0) endpoint += '?' + params.join('&');
      return this.rest.makeRequest('get', endpoint, true);
    }
  }, {
    key: 'getChannelMessage',
    value: function getChannelMessage(channel, messageID) {
      var msg = channel.messages.get(messageID);
      if (msg) return Promise.resolve(msg);
      return this.rest.makeRequest('get', Constants.Endpoints.channelMessage(channel.id, messageID), true);
    }
  }, {
    key: 'putGuildMember',
    value: function putGuildMember(guild, user, options) {
      var _this24 = this;

      options.access_token = options.accessToken;
      if (options.roles) {
        var roles = options.roles;
        if (roles instanceof Collection || roles instanceof Array && roles[0] instanceof Role) {
          options.roles = roles.map(function (role) {
            return role.id;
          });
        }
      }
      return this.rest.makeRequest('put', Constants.Endpoints.guildMember(guild.id, user.id), true, options).then(function (data) {
        return _this24.client.actions.GuildMemberGet.handle(guild, data).member;
      });
    }
  }, {
    key: 'getGuildMember',
    value: function getGuildMember(guild, user, cache) {
      var _this25 = this;

      return this.rest.makeRequest('get', Constants.Endpoints.guildMember(guild.id, user.id), true).then(function (data) {
        if (cache) {
          return _this25.client.actions.GuildMemberGet.handle(guild, data).member;
        } else {
          return new GuildMember(guild, data);
        }
      });
    }
  }, {
    key: 'updateGuildMember',
    value: function updateGuildMember(member, data) {
      if (data.channel) data.channel_id = this.client.resolver.resolveChannel(data.channel).id;
      if (data.roles) data.roles = data.roles.map(function (role) {
        return role instanceof Role ? role.id : role;
      });

      var endpoint = Constants.Endpoints.guildMember(member.guild.id, member.id);
      // Fix your endpoints, discord ;-;
      if (member.id === this.client.user.id) {
        var keys = Object.keys(data);
        if (keys.length === 1 && keys[0] === 'nick') {
          endpoint = Constants.Endpoints.guildMemberNickname(member.guild.id);
        }
      }

      return this.rest.makeRequest('patch', endpoint, true, data).then(function (newData) {
        return member.guild._updateMember(member, newData).mem;
      });
    }
  }, {
    key: 'addMemberRole',
    value: function addMemberRole(member, role) {
      var _this26 = this;

      return new Promise(function (resolve) {
        var listener = function listener(oldMember, newMember) {
          if (!oldMember._roles.includes(role.id) && newMember._roles.includes(role.id)) {
            _this26.client.removeListener('guildMemberUpdate', listener);
            resolve(newMember);
          }
        };

        _this26.client.on('guildMemberUpdate', listener);
        _this26.client.setTimeout(function () {
          return _this26.client.removeListener('guildMemberUpdate', listener);
        }, 10e3);

        _this26.rest.makeRequest('put', Constants.Endpoints.guildMemberRole(member.guild.id, member.id, role.id), true);
      });
    }
  }, {
    key: 'removeMemberRole',
    value: function removeMemberRole(member, role) {
      var _this27 = this;

      return new Promise(function (resolve) {
        var listener = function listener(oldMember, newMember) {
          if (oldMember._roles.includes(role.id) && !newMember._roles.includes(role.id)) {
            _this27.client.removeListener('guildMemberUpdate', listener);
            resolve(newMember);
          }
        };

        _this27.client.on('guildMemberUpdate', listener);
        _this27.client.setTimeout(function () {
          return _this27.client.removeListener('guildMemberUpdate', listener);
        }, 10e3);

        _this27.rest.makeRequest('delete', Constants.Endpoints.guildMemberRole(member.guild.id, member.id, role.id), true);
      });
    }
  }, {
    key: 'sendTyping',
    value: function sendTyping(channelID) {
      return this.rest.makeRequest('post', Constants.Endpoints.channel(channelID) + '/typing', true);
    }
  }, {
    key: 'banGuildMember',
    value: function banGuildMember(guild, member) {
      var _this28 = this;

      var deleteDays = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var id = this.client.resolver.resolveUserID(member);
      if (!id) return Promise.reject(new Error('Couldn\'t resolve the user ID to ban.'));
      return this.rest.makeRequest('put', Constants.Endpoints.guildBans(guild.id) + '/' + id + '?delete-message-days=' + deleteDays, true, {
        'delete-message-days': deleteDays
      }).then(function () {
        if (member instanceof GuildMember) return member;
        var user = _this28.client.resolver.resolveUser(id);
        if (user) {
          member = _this28.client.resolver.resolveGuildMember(guild, user);
          return member || user;
        }
        return id;
      });
    }
  }, {
    key: 'unbanGuildMember',
    value: function unbanGuildMember(guild, member) {
      var _this29 = this;

      return new Promise(function (resolve, reject) {
        var id = _this29.client.resolver.resolveUserID(member);
        if (!id) throw new Error('Couldn\'t resolve the user ID to unban.');

        var listener = function listener(eGuild, eUser) {
          if (eGuild.id === guild.id && eUser.id === id) {
            _this29.client.removeListener(Constants.Events.GUILD_BAN_REMOVE, listener);
            _this29.client.clearTimeout(timeout);
            resolve(eUser);
          }
        };
        _this29.client.on(Constants.Events.GUILD_BAN_REMOVE, listener);

        var timeout = _this29.client.setTimeout(function () {
          _this29.client.removeListener(Constants.Events.GUILD_BAN_REMOVE, listener);
          reject(new Error('Took too long to receive the ban remove event.'));
        }, 10000);

        _this29.rest.makeRequest('del', Constants.Endpoints.guildBans(guild.id) + '/' + id, true).catch(function (err) {
          _this29.client.removeListener(Constants.Events.GUILD_BAN_REMOVE, listener);
          _this29.client.clearTimeout(timeout);
          reject(err);
        });
      });
    }
  }, {
    key: 'getGuildBans',
    value: function getGuildBans(guild) {
      var _this30 = this;

      return this.rest.makeRequest('get', Constants.Endpoints.guildBans(guild.id), true).then(function (banItems) {
        var bannedUsers = new Collection();
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = banItems[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var banItem = _step2.value;

            var user = _this30.client.dataManager.newUser(banItem.user);
            bannedUsers.set(user.id, user);
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

        return bannedUsers;
      });
    }
  }, {
    key: 'updateGuildRole',
    value: function updateGuildRole(role, _data) {
      var _this31 = this;

      var data = {};
      data.name = _data.name || role.name;
      data.position = typeof _data.position !== 'undefined' ? _data.position : role.position;
      data.color = this.client.resolver.resolveColor(_data.color || role.color);
      data.hoist = typeof _data.hoist !== 'undefined' ? _data.hoist : role.hoist;
      data.mentionable = typeof _data.mentionable !== 'undefined' ? _data.mentionable : role.mentionable;

      if (_data.permissions) {
        var perms = 0;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = _data.permissions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var perm = _step3.value;

            if (typeof perm === 'string') perm = Permissions.FLAGS[perm];
            perms |= perm;
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

        data.permissions = perms;
      } else {
        data.permissions = role.permissions;
      }

      return this.rest.makeRequest('patch', Constants.Endpoints.guildRole(role.guild.id, role.id), true, data).then(function (_role) {
        return _this31.client.actions.GuildRoleUpdate.handle({
          role: _role,
          guild_id: role.guild.id
        }).updated;
      });
    }
  }, {
    key: 'pinMessage',
    value: function pinMessage(message) {
      return this.rest.makeRequest('put', Constants.Endpoints.channel(message.channel.id) + '/pins/' + message.id, true).then(function () {
        return message;
      });
    }
  }, {
    key: 'unpinMessage',
    value: function unpinMessage(message) {
      return this.rest.makeRequest('del', Constants.Endpoints.channel(message.channel.id) + '/pins/' + message.id, true).then(function () {
        return message;
      });
    }
  }, {
    key: 'getChannelPinnedMessages',
    value: function getChannelPinnedMessages(channel) {
      return this.rest.makeRequest('get', Constants.Endpoints.channel(channel.id) + '/pins', true);
    }
  }, {
    key: 'createChannelInvite',
    value: function createChannelInvite(channel, options) {
      var _this32 = this;

      var payload = {};
      payload.temporary = options.temporary;
      payload.max_age = options.maxAge;
      payload.max_uses = options.maxUses;
      return this.rest.makeRequest('post', '' + Constants.Endpoints.channelInvites(channel.id), true, payload).then(function (invite) {
        return new Invite(_this32.client, invite);
      });
    }
  }, {
    key: 'deleteInvite',
    value: function deleteInvite(invite) {
      return this.rest.makeRequest('del', Constants.Endpoints.invite(invite.code), true).then(function () {
        return invite;
      });
    }
  }, {
    key: 'getInvite',
    value: function getInvite(code) {
      var _this33 = this;

      return this.rest.makeRequest('get', Constants.Endpoints.invite(code), true).then(function (invite) {
        return new Invite(_this33.client, invite);
      });
    }
  }, {
    key: 'getGuildInvites',
    value: function getGuildInvites(guild) {
      var _this34 = this;

      return this.rest.makeRequest('get', Constants.Endpoints.guildInvites(guild.id), true).then(function (inviteItems) {
        var invites = new Collection();
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = inviteItems[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var inviteItem = _step4.value;

            var invite = new Invite(_this34.client, inviteItem);
            invites.set(invite.code, invite);
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

        return invites;
      });
    }
  }, {
    key: 'pruneGuildMembers',
    value: function pruneGuildMembers(guild, days, dry) {
      return this.rest.makeRequest(dry ? 'get' : 'post', Constants.Endpoints.guildPrune(guild.id) + '?days=' + days, true).then(function (data) {
        return data.pruned;
      });
    }
  }, {
    key: 'createEmoji',
    value: function createEmoji(guild, image, name, roles) {
      var _this35 = this;

      var data = { image: image, name: name };
      if (roles) data.roles = roles.map(function (r) {
        return r.id ? r.id : r;
      });
      return this.rest.makeRequest('post', '' + Constants.Endpoints.guildEmojis(guild.id), true, data).then(function (emoji) {
        return _this35.client.actions.GuildEmojiCreate.handle(guild, emoji).emoji;
      });
    }
  }, {
    key: 'updateEmoji',
    value: function updateEmoji(emoji, _data) {
      var _this36 = this;

      var data = {};
      if (_data.name) data.name = _data.name;
      if (_data.roles) data.roles = _data.roles.map(function (r) {
        return r.id ? r.id : r;
      });
      return this.rest.makeRequest('patch', Constants.Endpoints.guildEmoji(emoji.guild.id, emoji.id), true, data).then(function (newEmoji) {
        return _this36.client.actions.GuildEmojiUpdate.handle(emoji, newEmoji).emoji;
      });
    }
  }, {
    key: 'deleteEmoji',
    value: function deleteEmoji(emoji) {
      var _this37 = this;

      return this.rest.makeRequest('delete', Constants.Endpoints.guildEmojis(emoji.guild.id) + '/' + emoji.id, true).then(function () {
        return _this37.client.actions.GuildEmojiDelete.handle(emoji).data;
      });
    }
  }, {
    key: 'getWebhook',
    value: function getWebhook(id, token) {
      var _this38 = this;

      return this.rest.makeRequest('get', Constants.Endpoints.webhook(id, token), !token).then(function (data) {
        return new Webhook(_this38.client, data);
      });
    }
  }, {
    key: 'getGuildWebhooks',
    value: function getGuildWebhooks(guild) {
      var _this39 = this;

      return this.rest.makeRequest('get', Constants.Endpoints.guildWebhooks(guild.id), true).then(function (data) {
        var hooks = new Collection();
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = data[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var hook = _step5.value;
            hooks.set(hook.id, new Webhook(_this39.client, hook));
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

        return hooks;
      });
    }
  }, {
    key: 'getChannelWebhooks',
    value: function getChannelWebhooks(channel) {
      var _this40 = this;

      return this.rest.makeRequest('get', Constants.Endpoints.channelWebhooks(channel.id), true).then(function (data) {
        var hooks = new Collection();
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = data[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var hook = _step6.value;
            hooks.set(hook.id, new Webhook(_this40.client, hook));
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

        return hooks;
      });
    }
  }, {
    key: 'createWebhook',
    value: function createWebhook(channel, name, avatar) {
      var _this41 = this;

      return this.rest.makeRequest('post', Constants.Endpoints.channelWebhooks(channel.id), true, { name: name, avatar: avatar }).then(function (data) {
        return new Webhook(_this41.client, data);
      });
    }
  }, {
    key: 'editWebhook',
    value: function editWebhook(webhook, name, avatar) {
      return this.rest.makeRequest('patch', Constants.Endpoints.webhook(webhook.id, webhook.token), false, {
        name: name,
        avatar: avatar
      }).then(function (data) {
        webhook.name = data.name;
        webhook.avatar = data.avatar;
        return webhook;
      });
    }
  }, {
    key: 'deleteWebhook',
    value: function deleteWebhook(webhook) {
      return this.rest.makeRequest('delete', Constants.Endpoints.webhook(webhook.id, webhook.token), false);
    }
  }, {
    key: 'sendWebhookMessage',
    value: function sendWebhookMessage(webhook, content) {
      var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          avatarURL = _ref3.avatarURL,
          tts = _ref3.tts,
          disableEveryone = _ref3.disableEveryone,
          embeds = _ref3.embeds,
          username = _ref3.username;

      var file = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      username = username || webhook.name;
      if (typeof content !== 'undefined') content = this.client.resolver.resolveString(content);
      if (content) {
        if (disableEveryone || typeof disableEveryone === 'undefined' && this.client.options.disableEveryone) {
          content = content.replace(/@(everyone|here)/g, '@\u200B$1');
        }
      }
      return this.rest.makeRequest('post', Constants.Endpoints.webhook(webhook.id, webhook.token) + '?wait=true', false, {
        username: username,
        avatar_url: avatarURL,
        content: content,
        tts: tts,
        embeds: embeds
      }, file);
    }
  }, {
    key: 'sendSlackWebhookMessage',
    value: function sendSlackWebhookMessage(webhook, body) {
      return this.rest.makeRequest('post', Constants.Endpoints.webhook(webhook.id, webhook.token) + '/slack?wait=true', false, body);
    }
  }, {
    key: 'fetchUserProfile',
    value: function fetchUserProfile(user) {
      return this.rest.makeRequest('get', Constants.Endpoints.userProfile(user.id), true).then(function (data) {
        return new UserProfile(user, data);
      });
    }
  }, {
    key: 'fetchMeMentions',
    value: function fetchMeMentions(options) {
      var _this42 = this;

      if (options.guild) options.guild = options.guild.id ? options.guild.id : options.guild;
      return this.rest.makeRequest('get', Constants.Endpoints.meMentions(options.limit, options.roles, options.everyone, options.guild)).then(function (res) {
        return res.body.map(function (m) {
          return new Message(_this42.client.channels.get(m.channel_id), m, _this42.client);
        });
      });
    }
  }, {
    key: 'addFriend',
    value: function addFriend(user) {
      return this.rest.makeRequest('post', Constants.Endpoints.relationships('@me'), true, {
        username: user.username,
        discriminator: user.discriminator
      }).then(function () {
        return user;
      });
    }
  }, {
    key: 'removeFriend',
    value: function removeFriend(user) {
      return this.rest.makeRequest('delete', Constants.Endpoints.relationships('@me') + '/' + user.id, true).then(function () {
        return user;
      });
    }
  }, {
    key: 'blockUser',
    value: function blockUser(user) {
      return this.rest.makeRequest('put', Constants.Endpoints.relationships('@me') + '/' + user.id, true, { type: 2 }).then(function () {
        return user;
      });
    }
  }, {
    key: 'unblockUser',
    value: function unblockUser(user) {
      return this.rest.makeRequest('delete', Constants.Endpoints.relationships('@me') + '/' + user.id, true).then(function () {
        return user;
      });
    }
  }, {
    key: 'updateChannelPositions',
    value: function updateChannelPositions(guildID, channels) {
      var _this43 = this;

      var data = new Array(channels.length);
      for (var i = 0; i < channels.length; i++) {
        data[i] = {
          id: this.client.resolver.resolveChannelID(channels[i].channel),
          position: channels[i].position
        };
      }

      return this.rest.makeRequest('patch', Constants.Endpoints.guildChannels(guildID), true, data).then(function () {
        return _this43.client.actions.GuildChannelsPositionUpdate.handle({
          guild_id: guildID,
          channels: channels
        }).guild;
      });
    }
  }, {
    key: 'setRolePositions',
    value: function setRolePositions(guildID, roles) {
      var _this44 = this;

      return this.rest.makeRequest('patch', Constants.Endpoints.guildRoles(guildID), true, roles).then(function () {
        return _this44.client.actions.GuildRolesPositionUpdate.handle({
          guild_id: guildID,
          roles: roles
        }).guild;
      });
    }
  }, {
    key: 'addMessageReaction',
    value: function addMessageReaction(message, emoji) {
      var _this45 = this;

      return this.rest.makeRequest('put', Constants.Endpoints.selfMessageReaction(message.channel.id, message.id, emoji), true).then(function () {
        return _this45.client.actions.MessageReactionAdd.handle({
          user_id: _this45.client.user.id,
          message_id: message.id,
          emoji: Util.parseEmoji(emoji),
          channel_id: message.channel.id
        }).reaction;
      });
    }
  }, {
    key: 'removeMessageReaction',
    value: function removeMessageReaction(message, emoji, user) {
      var _this46 = this;

      var endpoint = Constants.Endpoints.selfMessageReaction(message.channel.id, message.id, emoji);
      if (user !== this.client.user.id) {
        endpoint = Constants.Endpoints.userMessageReaction(message.channel.id, message.id, emoji, null, user);
      }
      return this.rest.makeRequest('delete', endpoint, true).then(function () {
        return _this46.client.actions.MessageReactionRemove.handle({
          user_id: user,
          message_id: message.id,
          emoji: Util.parseEmoji(emoji),
          channel_id: message.channel.id
        }).reaction;
      });
    }
  }, {
    key: 'removeMessageReactions',
    value: function removeMessageReactions(message) {
      return this.rest.makeRequest('delete', Constants.Endpoints.messageReactions(message.channel.id, message.id), true).then(function () {
        return message;
      });
    }
  }, {
    key: 'getMessageReactionUsers',
    value: function getMessageReactionUsers(message, emoji) {
      var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;

      return this.rest.makeRequest('get', Constants.Endpoints.messageReaction(message.channel.id, message.id, emoji, limit), true);
    }
  }, {
    key: 'getApplication',
    value: function getApplication(id) {
      var _this47 = this;

      return this.rest.makeRequest('get', Constants.Endpoints.oauth2Application(id), true).then(function (app) {
        return new OAuth2Application(_this47.client, app);
      });
    }
  }, {
    key: 'resetApplication',
    value: function resetApplication(id) {
      var _this48 = this;

      return this.rest.makeRequest('post', Constants.Endpoints.oauth2Application(id) + '/reset', true).then(function (app) {
        return new OAuth2Application(_this48.client, app);
      });
    }
  }, {
    key: 'setNote',
    value: function setNote(user, note) {
      return this.rest.makeRequest('put', Constants.Endpoints.note(user.id), true, { note: note }).then(function () {
        return user;
      });
    }
  }, {
    key: 'acceptInvite',
    value: function acceptInvite(code) {
      var _this49 = this;

      if (code.id) code = code.id;
      return new Promise(function (resolve, reject) {
        return _this49.rest.makeRequest('post', Constants.Endpoints.invite(code), true).then(function (res) {
          var handler = function handler(guild) {
            if (guild.id === res.id) {
              resolve(guild);
              _this49.client.removeListener('guildCreate', handler);
            }
          };
          _this49.client.on('guildCreate', handler);
          _this49.client.setTimeout(function () {
            _this49.client.removeListener('guildCreate', handler);
            reject(new Error('Accepting invite timed out'));
          }, 120e3);
        });
      });
    }
  }]);

  return RESTMethods;
}();

module.exports = RESTMethods;