'use strict';

try {
  var sodium = require('sodium');
  module.exports = {
    open: sodium.api.crypto_secretbox_open_easy,
    close: sodium.api.crypto_secretbox_easy
  };
} catch (err) {
  var tweetnacl = require('tweetnacl');
  module.exports = {
    open: tweetnacl.secretbox.open,
    close: tweetnacl.secretbox
  };
}