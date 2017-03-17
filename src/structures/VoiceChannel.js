'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GuildChannel = require('./GuildChannel');
var Collection = require('../util/Collection');

/**
 * Represents a guild voice channel on Discord.
 * @extends {GuildChannel}
 */

var VoiceChannel = function (_GuildChannel) {
  _inherits(VoiceChannel, _GuildChannel);

  function VoiceChannel(guild, data) {
    _classCallCheck(this, VoiceChannel);

    /**
     * The members in this voice channel.
     * @type {Collection<Snowflake, GuildMember>}
     */
    var _this = _possibleConstructorReturn(this, (VoiceChannel.__proto__ || Object.getPrototypeOf(VoiceChannel)).call(this, guild, data));

    _this.members = new Collection();

    _this.type = 'voice';
    return _this;
  }

  _createClass(VoiceChannel, [{
    key: 'setup',
    value: function setup(data) {
      _get(VoiceChannel.prototype.__proto__ || Object.getPrototypeOf(VoiceChannel.prototype), 'setup', this).call(this, data);

      /**
       * The bitrate of this voice channel
       * @type {number}
       */
      this.bitrate = data.bitrate;

      /**
       * The maximum amount of users allowed in this channel - 0 means unlimited.
       * @type {number}
       */
      this.userLimit = data.user_limit;
    }

    /**
     * The voice connection for this voice channel, if the client is connected
     * @type {?VoiceConnection}
     * @readonly
     */

  }, {
    key: 'setBitrate',


    /**
     * Sets the bitrate of the channel
     * @param {number} bitrate The new bitrate
     * @returns {Promise<VoiceChannel>}
     * @example
     * // set the bitrate of a voice channel
     * voiceChannel.setBitrate(48000)
     *  .then(vc => console.log(`Set bitrate to ${vc.bitrate} for ${vc.name}`))
     *  .catch(console.error);
     */
    value: function setBitrate(bitrate) {
      return this.edit({ bitrate: bitrate });
    }

    /**
     * Sets the user limit of the channel
     * @param {number} userLimit The new user limit
     * @returns {Promise<VoiceChannel>}
     * @example
     * // set the user limit of a voice channel
     * voiceChannel.setUserLimit(42)
     *  .then(vc => console.log(`Set user limit to ${vc.userLimit} for ${vc.name}`))
     *  .catch(console.error);
     */

  }, {
    key: 'setUserLimit',
    value: function setUserLimit(userLimit) {
      return this.edit({ userLimit: userLimit });
    }

    /**
     * Attempts to join this voice channel
     * @returns {Promise<VoiceConnection>}
     * @example
     * // join a voice channel
     * voiceChannel.join()
     *  .then(connection => console.log('Connected!'))
     *  .catch(console.error);
     */

  }, {
    key: 'join',
    value: function join() {
      if (this.client.browser) return Promise.reject(new Error('Voice connections are not available in browsers.'));
      return this.client.voice.joinChannel(this);
    }

    /**
     * Leaves this voice channel
     * @example
     * // leave a voice channel
     * voiceChannel.leave();
     */

  }, {
    key: 'leave',
    value: function leave() {
      if (this.client.browser) return;
      var connection = this.client.voice.connections.get(this.guild.id);
      if (connection && connection.channel.id === this.id) connection.disconnect();
    }
  }, {
    key: 'connection',
    get: function get() {
      var connection = this.guild.voiceConnection;
      if (connection && connection.channel.id === this.id) return connection;
      return null;
    }

    /**
     * Checks if the voice channel is full
     * @type {boolean}
     */

  }, {
    key: 'full',
    get: function get() {
      return this.userLimit > 0 && this.members.size >= this.userLimit;
    }

    /**
     * Checks if the client has permission join the voice channel
     * @type {boolean}
     */

  }, {
    key: 'joinable',
    get: function get() {
      if (this.client.browser) return false;
      if (!this.permissionsFor(this.client.user).hasPermission('CONNECT')) return false;
      if (this.full && !this.permissionsFor(this.client.user).hasPermission('MOVE_MEMBERS')) return false;
      return true;
    }

    /**
     * Checks if the client has permission to send audio to the voice channel
     * @type {boolean}
     */

  }, {
    key: 'speakable',
    get: function get() {
      return this.permissionsFor(this.client.user).hasPermission('SPEAK');
    }
  }]);

  return VoiceChannel;
}(GuildChannel);

module.exports = VoiceChannel;