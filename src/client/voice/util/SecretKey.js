"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a Secret Key used in encryption over voice
 * @private
 */
var SecretKey = function SecretKey(key) {
  _classCallCheck(this, SecretKey);

  /**
   * The key used for encryption
   * @type {Uint8Array}
   */
  this.key = new Uint8Array(new ArrayBuffer(key.length));
  for (var index in key) {
    this.key[index] = key[index];
  }
};

module.exports = SecretKey;