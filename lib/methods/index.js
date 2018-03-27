'use strict';

// node core modules

// 3rd party modules

// internal modules
const publicFiles = require('./public-files');
const myFiles = require('./my-files');
const filesFromFolder = require('./files-from-folder');
const communityFiles = require('./community-files');

module.exports = {
  publicFiles,
  myFiles,
  filesFromFolder,
  communityFiles,
};
