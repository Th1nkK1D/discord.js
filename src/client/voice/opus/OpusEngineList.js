'use strict';

var list = [require('./NodeOpusEngine'), require('./OpusScriptEngine')];

var opusEngineFound = void 0;

function fetch(Encoder) {
  try {
    return new Encoder();
  } catch (err) {
    return null;
  }
}

exports.add = function (encoder) {
  list.push(encoder);
};

exports.fetch = function () {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var encoder = _step.value;

      var fetched = fetch(encoder);
      if (fetched) return fetched;
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

  return null;
};

exports.guaranteeOpusEngine = function () {
  if (typeof opusEngineFound === 'undefined') opusEngineFound = Boolean(exports.fetch());
  if (!opusEngineFound) throw new Error('Couldn\'t find an Opus engine.');
};