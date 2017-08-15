'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules
const { omitDefaultRequestParams, constructError } = require('./utils');
const { filesFromFolder: parser } = require('../response-parsers');

const qsValidParameters = [
  'added', // Specifies whether or not to return the <td:path> element that shows the path to the object
  'addedBy',
  'created',
  'page', // Page number, default is 1
  'ps', // Page size, default is 10
  'sl', // Specifies the start index (number) in the collection from which the results should be returned
  'sortBy',
  'sortOrder',
  'tag', // Filters the list of results by tag
];

/**
 * Retrieve files that belong to a certain folder.
 *
 * @param  {Object}   query                   Query object that holds information required by request uri.
 * @param  {String}   query.collectionId      URL parameter that is unique for every collection / folder.
 * @param  {Object}   options                 Additional information used as default for every request options.
 * @param  {Function} callback                [description]
 */
function filesFromFolder(query = {}, options, callback) {
  const { httpClient } = this;
  const { collectionId } = query;
  if (!collectionId) {
    const error = constructError('{{query.collectionId}} must be defined in [filesFromFolder] request', 404);
    callback(error);
    return;
  }

  // construct the request options
  const requestOptions = _.merge({}, omitDefaultRequestParams(options), {
    qs: _.pick(query, qsValidParameters),
    headers: {
      accept: 'application/atom+xml',
    },
    uri: `{ authType }/api/collection/${collectionId}/feed`,
  });

  httpClient.makeRequest(requestOptions, (requestError, response, body) => {
    if (requestError) {
      callback(requestError);
      return;
    }

    const { statusCode, headers: { 'content-type': contentType } } = response;
    // expected
    // status codes: 200, 401, 403, 404
    // content-type: application/atom+xml
    if (!response || statusCode !== 200) {
      const error = constructError(body || 'received response with unexpected status code', statusCode);
      callback(error);
      return;
    }

    if (!(response.headers && contentType.startsWith('application/atom+xml'))) {
      const error = constructError(`received response with unexpected content-type ${contentType}`, 401);
      callback(error);
      return;
    }

    callback(null, parser(body));
  });
}

module.exports = filesFromFolder;
