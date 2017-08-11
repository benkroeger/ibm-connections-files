'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules
const filesParser = require('./files-parser');
const xmlNS = require('../constants/xml-namespaces.json');
const { ensureXMLDoc, initParser } = require('./../utils/utility');

const selectXPath = initParser(xmlNS);

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
