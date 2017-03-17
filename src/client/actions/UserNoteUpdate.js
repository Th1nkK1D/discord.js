'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Action = require('./Action');
var Constants = require('../../util/Constants');

var UserNoteUpdateAction = function (_Action) {
  _inherits(UserNoteUpdateAction, _Action);

  function UserNoteUpdateAction() {
    _classCallCheck(this, UserNoteUpdateAction);

    return _possibleConstructorReturn(this, (UserNoteUpdateAction.__proto__ || Object.getPrototypeOf(UserNoteUpdateAction)).apply(this, arguments));
  }

  _createClass(UserNoteUpdateAction, [{
    key: 'handle',
    value: function handle(data) {
      var client = this.client;

      var oldNote = client.user.notes.get(data.id);
      var note = data.note.length ? data.note : null;

      client.user.notes.set(data.id, note);

      client.emit(Constants.Events.USER_NOTE_UPDATE, data.id, oldNote, note);

      return {
        old: oldNote,
        updated: note
      };
    }
  }]);

  return UserNoteUpdateAction;
}(Action);

/**
 * Emitted whenever a note is updated.
 * @event Client#userNoteUpdate
 * @param {User} user The user the note belongs to
 * @param {string} oldNote The note content before the update
 * @param {string} newNote The note content after the update
 */

module.exports = UserNoteUpdateAction;