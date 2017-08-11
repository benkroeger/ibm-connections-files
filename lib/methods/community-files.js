'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules
const { omitDefaultRequestParams, constructError } = require('./utils');
const { communityFiles: parser } = require('../response-parsers');

const qsValidParameters = [
  'added', // Specifies whether or not to return the <td:path> element that shows the path to the object
  'addedBy',
  'created',
  'page', // Page number, default is 1
  'pageSize', // Page size, default is 10
  'sl', // Specifies the start index (number) in the collection from which the results should be returned
  'since', // Returns entries that have file content that has been added or updated since the specified time
  'sortBy',
  'sortOrder',
  'tag', // Filters the list of results by tag
  'sC', // String. Specifies sort category. Authorized values: document, collection, all
  'category', // String. To filter the items by the specified item type. Authorized values: document, collection, page, all
  'format', // String. Format the result should be returned as. Authorized values: ATOM, JSON
  'includeNotification', // String. If the notification information will be returned in collection entry. Authorized values: false, true
  'type', // String. Filter on files that are in either personal or community libraries. Authorized values: allFiles, personalFiles, communityFiles
  'sharePermission', // String. Filter the files by shared permission into the collection. Authorized values: view, edit
  'includeFavorite', // String. Indicate whether to return favorite information of files in the feed. Authorized values: false, true
  'label', // String. Filter the files or sub-folders with the label of the folder
  'title', // String. Filter files and/or sub-folders based on their title
  'acl', // String. Indicate whether to return permission information of files in the feed. Authorized values: false, true
  'collectionAcIs', // String. Indicate whether to return permission information for the folder/community folder. Authorized values: false, true
  'access', // String. Filter the content of the returned feed by the access role of the authenticated user. Authorized values: reader, editor, manager
  'includeAncestors', // String. Specify whether to return ancestors of the folder. Authorized values: false, true
  'isExact', // Defines who has access to the files. Authorized values: public, private
  'wildmatch', // Shows also file marked public for external viewing;
];

/**
 * Retrieve files that belong to a specific community.
 *
 * @param  {Object}   query               Query object that holds information required by request uri.
 * @param  {String}   query.wikiLabel     URL parameter that is unique for every community.
 * @param  {String}   query.pageLabel     URL parameter that is unique for every wiki page.
 * @param  {Object}   options             Additional information used as default for every request options.
 * @param  {Function} callback            [description]
 */
function communityFiles(query = {}, options, callback) {
  const { httpClient } = this;
  const { communityId } = query;
  if (!communityId) {
    const error = constructError('{{query.communityId}} must be defined in [communityFiles] request', 404);
    callback(error);
    return;
  }

  // construct the request options
  const requestOptions = _.merge({}, omitDefaultRequestParams(options), {
    qs: _.pick(query, qsValidParameters),
    headers: {
      accept: 'application/atom+xml',
    },
    uri: `{ authType }/api/communitycollection/${communityId}/feed`,
  });

  httpClient.makeRequest(requestOptions, (requestError, response, body) => {
    if (requestError) {
      callback(requestError);
      return;
    }

    const { statusCode, headers: { 'content-type': contentType } } = response;
    // expected
    // status codes: 200, 403, 404
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

module.exports = communityFiles;
