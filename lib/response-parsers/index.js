'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules
const { filesParser, foldersParser } = require('./lib');
const xmlNS = require('../constants/xml-namespaces.json');
const { ensureXMLDoc, initParser } = require('./../utils/utility');

const selectXPath = initParser(xmlNS);

const fileParserNames = ['myFiles', 'communityFiles', 'publicFiles', 'filesFromFolder'];

const responseParser = (function responseParser() {
  // build parser factory collection that generates data using parseXmlEntry
  const filesResponseParser = fileParserNames.reduce((parserCollection, name) => { // eslint-disable-line arrow-body-style
    return _.assign(parserCollection, {
      [name]: (responseXML) => {
        const response = ensureXMLDoc(responseXML);
        const selectorEntryFiles = selectXPath('/atom:feed/atom:entry', response);

        return {
          files: _.map(selectorEntryFiles, fileNode => filesParser(fileNode)),
        };
      },
    });
  }, {});

  const foldersList = function foldersListParser(responseXML) {
    const response = ensureXMLDoc(responseXML);
    const selectorEntryFolders = selectXPath('/atom:feed/atom:entry', response);
    return {
      folders: _.map(selectorEntryFolders, folderNode => foldersParser(folderNode)),
    };
  };
  // merge file function factory and folder function
  return _.merge(filesResponseParser, { foldersList });
}());

module.exports = responseParser;
