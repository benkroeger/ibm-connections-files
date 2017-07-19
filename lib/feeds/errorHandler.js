'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules

function constructError(message) {
  const error = new Error(message);
  error.httpStatus = 400;
  return error;
}

const errorChecker = function errorChecker(params, feedName) {
  if (_.isEmpty(params)) {
    return constructError('params object should not be empty');
  }
  const { communityId, collectionId } = params;
  // check for placesFiles and files extracted from folder, since they require additional parameters
  // if they are provided, they need to have their ids on them, otherwise continue normally
  if (feedName === 'communityFiles') {
    if (!communityId) {
      return constructError('params.communityId must be defined');
    }
  } else if (feedName === 'filesFromFolder') {
    if (!collectionId) {
      return constructError('params.collectionId must be defined');
    }
  }
  return false;
};

module.exports = errorChecker;
