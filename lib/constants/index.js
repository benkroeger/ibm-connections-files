'use strict';

// node core modules

// 3rd party modules

// internal modules
const ibmUris = require('./ibm-uris');
const xmlNamespaces = require('./xml-namespaces.json');
const fileRankSchemes = require('./xml-rank-schemes/files.json');
const folderRankSchemes = require('./xml-rank-schemes/folders.json');

module.exports = {
  ibmUris,
  xmlNamespaces,
  fileRankSchemes,
  folderRankSchemes,
};
