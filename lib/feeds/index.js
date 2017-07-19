'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules
const errorHandler = require('./errorHandler.js');
const parser = require('./../response-parsers');
const { ibmUris } = require('./../constants');
const { getAuthParams, extractRequiredQueryParams } = require('../utils/utility');

/**
 * A factory function that returns a function which retrieves the IBM Connections Cloud feed whose name was passed into the factory.
 * @param   {String} feedName     The name of the feed that the returned function should retrieve when called.
 * @returns {Function}            A function which, when invoked, will attempt to retrieve the feed whose name was passed into the factory function.
 * @private
 */
function makeFeedLoader(feedName) {
  return function loadFeed(httpClient, params, callback) {
    // making sure we have the right params
    const error = errorHandler(params, feedName);
    if (error) {
      callback(error);
      return;
    }
    // get predefined query params connected to {{feedName}}
    const qsValidParameters = ibmUris[feedName].queryParams;

    // extract only those values from {{qsValidParameters}} that have initial value
    const requiredQueryParams = extractRequiredQueryParams(qsValidParameters);
    const { query = {}, authType } = params;

    // If there are additional query parameters requested, filter allowed ones
    const pickedParams = _.pick(query || {}, Object.keys(qsValidParameters));

    // build request params
    const authParams = getAuthParams(params);

    const requestParams = _.merge({}, _.pick(params, ['headers', 'method', 'uri', 'user']), {
      uri: ibmUris[feedName].uri,
      method: 'GET',
      headers: {
        accept: 'application/atom+xml',
      },
      authType: authType || '',
      qs: _.defaults(requiredQueryParams, pickedParams),
    }, authParams);

    // build http request and return parsed data to service caller
    httpClient
      .makeRequest(requestParams, (feedErr, response, body) => {
        if (feedErr) {
          callback(feedErr);
          return;
        }
        if (!response || response.statusCode !== 200) {
          const err = new Error(response.statusMessage);
          err.httpStatus = response.statusCode;
          callback(err);
          return;
        }

        callback(null, parser[feedName](body, params));
      });
  };
}
/**
 * An object containing a function for each feed type in IBM Connections Files. Retrieve a feed by invoking the function whose name corresponds to the feed's name.
 * @namespace feeds
 * @memberof module:IbmConnectionsFilesService
 * @kind Object
 */

const feedLoader = [
  /**
   * Retrieve feed of files that belong to authorized user.
   * @param  {Object}   params                   Request parameters that will be used to retrieve the user's files feed.
   * @param  {Function} callback                 Called with the results of the feed request. Called with `(err, feed)`.
   * @name module:IbmConnectionsFilesService.feeds.myFiles
   * @method
   */
  'myFiles',
  /**
   * Retrieve feed of files that belong to specific place.
   * @param  {Object}   params                   Request parameters that will be used to retrieve the community files feed.
   * @param  {String}   params.communityId       URL parameter necessary for retrieving files feed.
   * @param  {Function} callback                 Called with the results of the feed request. Called with `(err, feed)`.
   * @name module:IbmConnectionsFilesService.feeds.communityFiles
   * @method
   */
  'communityFiles',
  /**
   * Retrieve the public files feed.
   * @param  {Object}   params                   Request parameters that will be used to retrieve the public files feed.
   * @param  {Function} callback                 Called with the results of the feed request. Called with `(err, feed)`.
   * @name module:IbmConnectionsFilesService.feeds.publicFiles
   * @method
   */
  'publicFiles',
  /**
   * Retrieve feed of files that belong to certain folder.
   * @param  {Object}   params                   Request parameters that will be used to retrieve the files from folder feed.
   * @param  {String}   params.collectionId      URL parameter necessary for retrieving files feed.
   * @param  {Function} callback                 Called with the results of the feed request. Called with `(err, feed)`.
   * @name module:IbmConnectionsFilesService.feeds.filesFromFolder
   * @method
   */
  'filesFromFolder',
  /**
   * Retrieve feed of folders.
   * @param  {Object}   params                   Request parameters that will be used to retrieve the folders feed.
   * @param  {Function} callback                 Called with the results of the feed request. Called with `(err, feed)`.
   * @name module:IbmConnectionsFilesService.feeds.foldersList
   * @method
   */
  'foldersList',
].reduce((result, feedName) => {
  _.assign(result, {
    [feedName]: makeFeedLoader(feedName),
  });
  return result;
}, {});

module.exports = feedLoader;
