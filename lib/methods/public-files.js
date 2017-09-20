'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules
const { omitDefaultRequestParams, constructError } = require('./utils');
const { publicFiles: parser } = require('../response-parsers');

const qsValidParameters = [
  'visibility', // Defines who has access to the files. If {{search}} param not provided, this is an optional parameter, and needs to be set to public.
  'includePath', // Specifies whether or not to return the <td:path> element that shows the path to the object
  'includeTags', // Specifies whether or not the tags that are displayed on the file welcome page
  'page', // Page number, default is 1
  'ps', // Page size, default is 10
  'sl', // Specifies the start index (number) in the collection from which the results should be returned
  'since', // Returns entries that have file content that has been added or updated since the specified time
  'sortBy',
  'sortOrder',
  'tag', // Filters the list of results by tag
  'isExternal', // Shows also file marked public for external viewing
  'search', // Search parameter is not described in IBM Docs, but if not provided, then {{visibility}} param need to be set to public
];

/**
 * Retrieve files that belong to a certain folder.
 *
 * @param  {Object}   query                   Query object that holds information required by request uri.
 * @param  {Object}   options                 Additional information used as default for every request options.
 * @param  {Function} callback                [description]
 */
function publicFiles(query = {}, options, callback) {
  const { httpClient } = this;

  // construct the request options
  const requestOptions = _.defaultsDeep({
    qs: {
      visibility: 'public',
    },
  }, omitDefaultRequestParams(options), {
    qs: _.pick(query, qsValidParameters),
    headers: {
      accept: 'application/atom+xml',
    },
    uri: '{ authType }/api/documents/feed',
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

module.exports = publicFiles;
