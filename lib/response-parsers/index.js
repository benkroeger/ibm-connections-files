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
  fileParserNames.reduce((parserCollection, name) =>
    _.assign(parserCollection, {
      [name]: (responseXML) => {
        const response = ensureXMLDoc(responseXML);
        const selectorEntryFiles = selectXPath('/atom:feed/atom:entry', response);

        return {
          files: _.map(selectorEntryFiles, fileNode => filesParser(fileNode)),
        };
      },
    }), {});

module.exports = responseParser();
