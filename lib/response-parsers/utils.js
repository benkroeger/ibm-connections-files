'use strict';

// node core modules

// 3rd party modules
const { parseXMLNode } = require('oniyi-utils-xml');

//  internal modules
const xpath = require('../xpath-select');

/**
 * Convert the given argument into an integer.
 * @param   {*} val  value to convert to an integer.
 * @returns {Number} The integer representation of the value.
 * @static
 */
function toInteger(val) {
  return parseInt(val, 10);
}

const urnRegexp = /([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})$/;

const extractIdFromURN = (val) => {
  const [, id] = val.match(urnRegexp);
  return id;
};

const toDate = val => val && Date.parse(val);

const parseUserInfo = node => parseXMLNode(node, {
  name: 'string(atom:name/text())',
  userId: 'string(snx:userid/text())',
  orgId: 'string(snx:orgId/text())',
  orgName: 'string(snx:orgName/text())',
  email: 'string(atom:email/text())',
  userState: 'string(snx:userState/text())',
}, xpath);

module.exports = {
  toInteger,
  toDate,
  extractIdFromURN,
  parseUserInfo,
};
