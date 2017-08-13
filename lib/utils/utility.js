'use strict';

// node core modules

// 3rd party modules

//  internal modules

/**
 * Convert the given argument into an integer.
 * @param   {*} val  value to convert to an integer.
 * @returns {Number} The integer representation of the value.
 * @static
 */
function toInteger(val) {
  return parseInt(val, 10);
}

/**
 * Extract just the id of an IBM Connections Cloud object out of
 * the full Uniform Resource Name.
 * @param   {String} urn   A IBM Connections Cloud Uniform Resource Name.
 * @returns {String}        The id of the IBM Connections Cloud Object
 * @static
 * @example
 * const parserUtils = require('./parser-utils');
 * const id = parserUtils.extractIdFromURN('urn:lsid:ibm.com:oa:a8d112ee-024a-45b1-a7bc-6d918d009a3a');
 * console.log(id); // => 'a8d112ee-024a-45b1-a7bc-6d918d009a3a'
 */
// eslint-disable-next-line arrow-body-style
const extractIdFromURN = urn => urn.split(':')[4];

module.exports = {
  toInteger,
  extractIdFromURN,
};
