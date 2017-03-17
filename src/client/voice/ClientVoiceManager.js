'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Collection = require('../../util/Collection');
var VoiceConnection = require('./VoiceConnection');

/**
 * Manages all the voice stuff for the Client
 * @private
 */

var ClientVoiceManager = function () {
  function ClientVoiceManager(client) {
    _classCallCheck(this, ClientVoiceManager);

    /**
     * The client that instantiated this voice manager
     * @type {Client}
     */
    this.client = client;

    /**
     * A collection mapping connection IDs to the Connection objects
     * @type {Collection<Snowflake, VoiceConnection>}
     */
    this.connections = new Collection();

    this.client.on('self.voiceServer', this.onVoiceServer.bind(this));
    this.client.on('self.voiceStateUpdate', this.onVoiceStateUpdate.bind(this));
  }

  _createClass(ClientVoiceManager, [{
    key: 'onVoiceServer',
    value: function onVoiceServer(_ref) {
      var guild_id = _ref.guild_id,
          token = _ref.token,
          endpoint = _ref.endpoint;

      var connection = this.connections.get(guild_id);
      if (connection) connection.setTokenAndEndpoint(token, endpoint);
    }
  }, {
    key: 'onVoiceStateUpdate',
    value: function onVoiceStateUpdate(_ref2) {
      var guild_id = _ref2.guild_id,
          session_id = _ref2.session_id,
          channel_id = _ref2.channel_id;

      var connection = this.connections.get(guild_id);
      if (connection) {
        connection.channel = this.client.channels.get(channel_id);
        connection.setSessionID(session_id);
      }
    }

    /**
     * Sets up a request to join a voice channel
     * @param {VoiceChannel} channel The voice channel to join
     * @returns {Promise<VoiceConnection>}
     */

  }, {
    key: 'joinChannel',
    value: function joinChannel(channel) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (!channel.joinable) {
          if (channel.full) {
            throw new Error('You do not have permission to join this voice channel; it is full.');
          } else {
            throw new Error('You do not have permission to join this voice channel.');
          }
        }

        var connection = _this.connections.get(channel.guild.id);

        if (connection) {
          if (connection.channel.id !== channel.id) {
            _this.connections.get(channel.guild.id).updateChannel(channel);
          }
          resolve(connection);
          return;
        } else {
          connection = new VoiceConnection(_this, channel);
          _this.connections.set(channel.guild.id, connection);
        }

        connection.once('failed', function (reason) {
          _this.connections.delete(channel.guild.id);
          reject(reason);
        });

        connection.once('authenticated', function () {
          connection.once('ready', function () {
            return resolve(connection);
          });
          connection.once('error', reject);
          connection.once('disconnect', function () {
            return _this.connections.delete(channel.guild.id);
          });
        });
      });
    }
  }]);

  return ClientVoiceManager;
}();

module.exports = ClientVoiceManager;