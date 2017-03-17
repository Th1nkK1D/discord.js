'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Constants = require('../util/Constants');
var Util = require('../util/Util');
var Guild = require('../structures/Guild');
var User = require('../structures/User');
var DMChannel = require('../structures/DMChannel');
var Emoji = require('../structures/Emoji');
var TextChannel = require('../structures/TextChannel');
var VoiceChannel = require('../structures/VoiceChannel');
var GuildChannel = require('../structures/GuildChannel');
var GroupDMChannel = require('../structures/GroupDMChannel');

var ClientDataManager = function () {
  function ClientDataManager(client) {
    _classCallCheck(this, ClientDataManager);

    this.client = client;
  }

  _createClass(ClientDataManager, [{
    key: 'newGuild',
    value: function newGuild(data) {
      var _this = this;

      var already = this.client.guilds.has(data.id);
      var guild = new Guild(this.client, data);
      this.client.guilds.set(guild.id, guild);
      if (this.pastReady && !already) {
        /**
         * Emitted whenever the client joins a guild.
         * @event Client#guildCreate
         * @param {Guild} guild The created guild
         */
        if (this.client.options.fetchAllMembers) {
          guild.fetchMembers().then(function () {
            _this.client.emit(Constants.Events.GUILD_CREATE, guild);
          });
        } else {
          this.client.emit(Constants.Events.GUILD_CREATE, guild);
        }
      }

      return guild;
    }
  }, {
    key: 'newUser',
    value: function newUser(data) {
      if (this.client.users.has(data.id)) return this.client.users.get(data.id);
      var user = new User(this.client, data);
      this.client.users.set(user.id, user);
      return user;
    }
  }, {
    key: 'newChannel',
    value: function newChannel(data, guild) {
      var already = this.client.channels.has(data.id);
      var channel = void 0;
      if (data.type === Constants.ChannelTypes.DM) {
        channel = new DMChannel(this.client, data);
      } else if (data.type === Constants.ChannelTypes.GROUP_DM) {
        channel = new GroupDMChannel(this.client, data);
      } else {
        guild = guild || this.client.guilds.get(data.guild_id);
        if (guild) {
          if (data.type === Constants.ChannelTypes.TEXT) {
            channel = new TextChannel(guild, data);
            guild.channels.set(channel.id, channel);
          } else if (data.type === Constants.ChannelTypes.VOICE) {
            channel = new VoiceChannel(guild, data);
            guild.channels.set(channel.id, channel);
          }
        }
      }

      if (channel) {
        if (this.pastReady && !already) this.client.emit(Constants.Events.CHANNEL_CREATE, channel);
        this.client.channels.set(channel.id, channel);
        return channel;
      }

      return null;
    }
  }, {
    key: 'newEmoji',
    value: function newEmoji(data, guild) {
      var already = guild.emojis.has(data.id);
      if (data && !already) {
        var emoji = new Emoji(guild, data);
        this.client.emit(Constants.Events.GUILD_EMOJI_CREATE, emoji);
        guild.emojis.set(emoji.id, emoji);
        return emoji;
      } else if (already) {
        return guild.emojis.get(data.id);
      }

      return null;
    }
  }, {
    key: 'killEmoji',
    value: function killEmoji(emoji) {
      if (!(emoji instanceof Emoji && emoji.guild)) return;
      this.client.emit(Constants.Events.GUILD_EMOJI_DELETE, emoji);
      emoji.guild.emojis.delete(emoji.id);
    }
  }, {
    key: 'killGuild',
    value: function killGuild(guild) {
      var already = this.client.guilds.has(guild.id);
      this.client.guilds.delete(guild.id);
      if (already && this.pastReady) this.client.emit(Constants.Events.GUILD_DELETE, guild);
    }
  }, {
    key: 'killUser',
    value: function killUser(user) {
      this.client.users.delete(user.id);
    }
  }, {
    key: 'killChannel',
    value: function killChannel(channel) {
      this.client.channels.delete(channel.id);
      if (channel instanceof GuildChannel) channel.guild.channels.delete(channel.id);
    }
  }, {
    key: 'updateGuild',
    value: function updateGuild(currentGuild, newData) {
      var oldGuild = Util.cloneObject(currentGuild);
      currentGuild.setup(newData);
      if (this.pastReady) this.client.emit(Constants.Events.GUILD_UPDATE, oldGuild, currentGuild);
    }
  }, {
    key: 'updateChannel',
    value: function updateChannel(currentChannel, newData) {
      currentChannel.setup(newData);
    }
  }, {
    key: 'updateEmoji',
    value: function updateEmoji(currentEmoji, newData) {
      var oldEmoji = Util.cloneObject(currentEmoji);
      currentEmoji.setup(newData);
      this.client.emit(Constants.Events.GUILD_EMOJI_UPDATE, oldEmoji, currentEmoji);
      return currentEmoji;
    }
  }, {
    key: 'pastReady',
    get: function get() {
      return this.client.ws.status === Constants.Status.READY;
    }
  }]);

  return ClientDataManager;
}();

module.exports = ClientDataManager;