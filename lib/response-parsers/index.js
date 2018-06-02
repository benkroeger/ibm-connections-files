'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');
const { selectUseNamespaces, ensureXMLDoc } = require('oniyi-utils-xml');

// internal modules
const filesParser = require('./files-parser');
const xmlNamespaces = require('../constants/xml-namespaces.json');

const selectXPath = selectUseNamespaces(xmlNamespaces);

const fileParserNames = ['myFiles', 'communityFiles', 'publicFiles', 'filesFromFolder'];

const responseParser = () =>
  // build parser factory collection that generates data using parseXmlEntry
  fileParserNames.reduce(
    (parserCollection, name) =>
      _.assign(parserCollection, {
        [name]: (responseXML) => {
          const xmlDocument = ensureXMLDoc(responseXML);
          const selectorEntryFiles = selectXPath('/atom:feed/atom:entry', xmlDocument);

          const totalResults = selectXPath('number(atom:feed/opensearch:totalResults/text())', xmlDocument, true);
          const entries = _.map(selectorEntryFiles, fileNode => filesParser(fileNode));

          return {
            totalResults,
            entries,
          };
        },
      }),
    {}
  );

module.exports = responseParser();
