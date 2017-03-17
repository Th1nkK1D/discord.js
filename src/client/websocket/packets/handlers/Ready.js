'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractHandler = require('./AbstractHandler');

var ClientUser = require('../../../../structures/ClientUser');

var ReadyHandler = function (_AbstractHandler) {
  _inherits(ReadyHandler, _AbstractHandler);

  function ReadyHandler() {
    _classCallCheck(this, ReadyHandler);

    return _possibleConstructorReturn(this, (ReadyHandler.__proto__ || Object.getPrototypeOf(ReadyHandler)).apply(this, arguments));
  }

  _createClass(ReadyHandler, [{
    key: 'handle',
    value: function handle(packet) {
      var client = this.packetManager.client;
      var data = packet.d;

      client.ws.heartbeat();

      var clientUser = new ClientUser(client, data.user);
      clientUser.settings = data.user_settings;
      client.user = clientUser;
      client.readyAt = new Date();
      client.users.set(clientUser.id, clientUser);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data.guilds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var guild = _step.value;
          client.dataManager.newGuild(guild);
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data.private_channels[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var privateDM = _step2.value;
          client.dataManager.newChannel(privateDM);
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

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data.relationships[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var relation = _step3.value;

          var _user = client.dataManager.newUser(relation.user);
          if (relation.type === 1) {
            client.user.friends.set(_user.id, _user);
          } else if (relation.type === 2) {
            client.user.blocked.set(_user.id, _user);
          }
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

      data.presences = data.presences || [];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = data.presences[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var presence = _step4.value;

          client.dataManager.newUser(presence.user);
          client._setPresence(presence.user.id, presence);
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

      if (data.notes) {
        for (var user in data.notes) {
          var note = data.notes[user];
          if (!note.length) note = null;

          client.user.notes.set(user, note);
        }
      }

      if (!client.user.bot && client.options.sync) client.setInterval(client.syncGuilds.bind(client), 30000);
      client.once('ready', client.syncGuilds.bind(client));

      if (!client.users.has('1')) {
        client.dataManager.newUser({
          id: '1',
          username: 'Clyde',
          discriminator: '0000',
          avatar: 'https://discordapp.com/assets/f78426a064bc9dd24847519259bc42af.png',
          bot: true,
          status: 'online',
          game: null,
          verified: true
        });
      }

      client.setTimeout(function () {
        if (!client.ws.normalReady) client.ws._emitReady(false);
      }, 1200 * data.guilds.length);

      this.packetManager.ws.sessionID = data.session_id;
      this.packetManager.ws.checkIfReady();
    }
  }]);

  return ReadyHandler;
}(AbstractHandler);

module.exports = ReadyHandler;