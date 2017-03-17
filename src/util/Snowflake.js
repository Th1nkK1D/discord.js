'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Long = require('long');

// Discord epoch (2015-01-01T00:00:00.000Z)
var EPOCH = 1420070400000;
var INCREMENT = 0;

/**
 * A container for useful snowflake-related methods
 */

var SnowflakeUtil = function () {
  function SnowflakeUtil() {
    _classCallCheck(this, SnowflakeUtil);
  }

  _createClass(SnowflakeUtil, null, [{
    key: 'generate',

    /**
     * A Twitter snowflake, except the epoch is 2015-01-01T00:00:00.000Z
     * ```
     * If we have a snowflake '266241948824764416' we can represent it as binary:
     *
     * 64                                          22     17     12          0
     *  000000111011000111100001101001000101000000  00001  00000  000000000000
     *       number of ms since discord epoch       worker  pid    increment
     * ```
     * @typedef {string} Snowflake
     */

    /**
     * Generates a Discord snowflake
     * <info>This hardcodes the worker ID as 1 and the process ID as 0.</info>
     * @returns {Snowflake} The generated snowflake
     */
    value: function generate() {
      if (INCREMENT >= 4095) INCREMENT = 0;
      var BINARY = pad((Date.now() - EPOCH).toString(2), 42) + '0000100000' + pad((INCREMENT++).toString(2), 12);
      return Long.fromString(BINARY, 2).toString();
    }

    /**
     * A deconstructed snowflake
     * @typedef {Object} DeconstructedSnowflake
     * @property {number} timestamp Timestamp the snowflake was created
     * @property {Date} date Date the snowflake was created
     * @property {number} workerID Worker ID in the snowflake
     * @property {number} processID Process ID in the snowflake
     * @property {number} increment Increment in the snowflake
     * @property {string} binary Binary representation of the snowflake
     */

    /**
     * Deconstructs a Discord snowflake
     * @param {Snowflake} snowflake Snowflake to deconstruct
     * @returns {DeconstructedSnowflake} Deconstructed snowflake
     */

  }, {
    key: 'deconstruct',
    value: function deconstruct(snowflake) {
      var BINARY = pad(Long.fromString(snowflake).toString(2), 64);
      var res = {
        timestamp: parseInt(BINARY.substring(0, 42), 2) + EPOCH,
        workerID: parseInt(BINARY.substring(42, 47), 2),
        processID: parseInt(BINARY.substring(47, 52), 2),
        increment: parseInt(BINARY.substring(52, 64), 2),
        binary: BINARY
      };
      Object.defineProperty(res, 'date', {
        get: function get() {
          return new Date(this.timestamp);
        },
        enumerable: true
      });
      return res;
    }
  }]);

  return SnowflakeUtil;
}();

function pad(v, n) {
  var c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '0';

  return String(v).length >= n ? String(v) : (String(c).repeat(n) + v).slice(-n);
}

module.exports = SnowflakeUtil;