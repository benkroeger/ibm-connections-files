'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');
const {
  parse: parseXML,
  serialize: serializeXML,
  selectUseNamespaces,
  ensureXMLDoc,
} = require('oniyi-utils-xml');

// internal modules

/**
 * init parser with namespaces
 * @param  {Object} xmlNS   namespaces
 * @example
 * selectXPath = parserUtils.initParser({...});
 */
const initParser = xmlNS => (selectUseNamespaces(xmlNS));

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

/**
 * Parse provided selectors with next options:
 *
 *  1. Provide 'multiFields' as an Array in order to parse attribute fields of a node
 *  2. Each selector could be a String or an Object. Provide an Object if needed result transformation
 *
 *  e.g.
 *        const selectorParser = selectorParserFactory(xmlNode, selectXPath);
 *
 *  1.  const author = selectorParser({authorId: 'atom:authorId',...}, ['href', 'type']);
 *  2.  const author = {
 *        selector: 'atom:authorId',
 *        transform: toInteger,
 *      };
 *                OR
 *      const author = 'atom:authorId';
 *
 * @param {Object} xmlNode            Xml node entry
 * @param {Function} selectXPath      used for extracting new node details by given 'selector' and 'node'
 *
 */
const selectorParserFactory = (xmlNode, selectXPath) =>
  function selectorParser(selectors, multiFields) {
    return _.reduce(selectors, (result, value, selectorKey) => {
      const selector = _.isString(value) ? value : value.selector;
      const node = selectXPath(selector, xmlNode, true);
      if (!node) {
        return result;
      }
      if (multiFields && _.isArray(multiFields)) {
        let multiField = {};
        multiFields.forEach((elem) => { // eslint-disable-line consistent-return
          if (!node.getAttribute(elem)) {
            return result;
          }
          multiField = _.defaultsDeep(multiField, {
            [selectorKey]: {
              [elem]: node.getAttribute(elem),
            },
          });
        });
        return _.assign(result, multiField);
      }

      return _.assign(result, {
        [selectorKey]: _.isFunction(value.transform) ? value.transform(node.textContent) : node.textContent,
      });
    }, {});
  };

/**
 * Look for any authentication parameters in the given object. If any are found,
 * use them to construct an authentication object to pass as part of the parameter object
 * to an http request made by [oniyi-http-client](https://www.npmjs.com/package/oniyi-http-client).
 * @param  {Object} params                   An object containing authentication data.
 * @param  {Object} [params.user]            A LoopBack User model instance.
 * @param  {String} [params.accessToken]     An OAuth access token.
 * @param  {String} [params.bearer]          An OAuth access token.
 * @param  {String} [params.username]        A username.
 * @param  {String} [params.password]        A password.
 * @param  {Object} [params.auth]            An object containing authentication data.
 * @param  {Object} [params.auth.bearer]     An OAuth access token.
 * @param  {String} [params.auth.username]   A username.
 * @param  {String} [params.auth.password]   A password.
 * @returns {Object}                         An object containing authentication data ready to be consumed by oniyi-http-client.
 * @static
 */
function getAuthParams(params) {
  // extract possible credentials

  // LoopBack User Model
  const user = params.user;
  if (user) return { user };

  // OAuth - AccessToken
  const accessToken = params.accessToken || params.bearer || (params.auth && params.auth.bearer);
  // Basic Credentials
  const username = params.username || (params.auth && params.auth.username);
  const password = params.password || (params.auth && params.auth.password);

  if (accessToken) {
    // apply accessToken according to the "request" documentation https://github.com/request/request#http-authentication
    return {
      auth: {
        bearer: accessToken,
      },
    };
  }

  if (username && password) {
    // apply basic credentials according to the "request" documentation https://github.com/request/request#http-authentication
    return {
      auth: {
        username,
        password,
      },
      jar: params.jar,
    };
  }

  return {
    jar: params.jar,
  };
}

/**
 * A factory function that returns a function ready to be attached to the ibm-connections-activities public API.
 * The returned function just calls the original private function passed in as a parameter to the factory, but
 * passing in the instance of [oniyi-http-client](https://www.npmjs.com/package/oniyi-http-client) that the private
 * function should use to issue the actual HTTP requests. This ensures that the service's internal httpClient instance
 * stays private and that the service cannot be used with an external httpClient instance.
 *
 * @param   {Object}   httpClient   An instance of [oniyi-http-client](https://www.npmjs.com/package/oniyi-http-client)
 * @param   {Function} fn           The internal function that the function produced by the factory will call.
 * @returns {Function}              A function which calls the internal function passed to the factory with the internal httpClient instance.
 * @static
 */
function makeServiceMethod(httpClient, fn) {
  return (params, callback) => fn.call(null, httpClient, params, callback);
}

/**
 * Extract default parameters while making an http request.
 *
 * e.g.
 *    const queryParams = {
        format: 'full',
        output: 'vcard',
        pageSize: '',
        pageOrder: '',
 *      };
 *
 * @param {object} queryParams   A list of valid query parameters
 * @return {*}
 */

function extractRequiredQueryParams(queryParams) {
  return Object.keys(queryParams).reduce((result, elem) => {
    const requiredParam = queryParams[elem];
    if (requiredParam) {
      return _.assign(result, {
        [elem]: requiredParam,
      });
    }
    return result;
  }, {});
}

/**
 * Function responsible to converting bytes to other units, depending on its size
 *
 * @param {String|Number} bytes   Input parameter used for unit transformation
 * @return {String} result        String literal representing data with corresponding unit
 */
function bytesTransformer(bytes) {
  let mBytes = bytes;
  if (!_.isNumber(bytes)) {
    mBytes = toInteger(bytes);
  }
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (mBytes === 0) return 'n/a';
  // This is a snippet for returning logarithm with different base. We need to get logarithm
  // of {{mBytes}} with base {{1024}}, where also using {{Math.floor}} to return the largest integer
  // less than or equal to result of logarithm division. At the last call, make sure we have an integer
  const i = toInteger(Math.floor(Math.log(mBytes) / Math.log(1024)));
  if (i === 0) return `${mBytes} ${sizes[i]}`;

  // For now this is a fix, since {{1024 ** i }} infix-operator for exponentiation isn't implemented yet in ECMAScript 6
  // eslint-disable-next-line no-restricted-properties
  return `${(mBytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

module.exports = {
  initParser,
  parseXML,
  serializeXML,
  ensureXMLDoc,
  toInteger,
  extractIdFromURN,
  getAuthParams,
  makeServiceMethod,
  extractRequiredQueryParams,
  bytesTransformer,
  selectorParserFactory,
};