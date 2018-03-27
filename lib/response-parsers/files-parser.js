'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');
const { parseXMLNode } = require('oniyi-utils-xml');

// internal modules
const { extractIdFromURN, toDate, parseUserInfo } = require('./utils');
const { fileRankSchemes } = require('../constants');
const selectXPath = require('../xpath-select');

// simple values selectors
const textValueSelectors = {
  id: {
    selector: 'string(atom:id/text())',
    transform: extractIdFromURN,
  },
  published: {
    selector: 'string(atom:published)',
    transform: toDate,
  },
  updated: {
    selector: 'string(atom:updated)',
    transform: toDate,
  },
  created: {
    selector: 'string(td:created)',
    transform: toDate,
  },
  modified: {
    selector: 'string(td:modified)',
    transform: toDate,
  },
  contentUpdated: {
    selector: 'string(td:contentUpdated/text())',
    transform: toDate,
  },
  versionLabel: 'number(td:versionLabel/text())',
  totalMediaSize: 'number(td:totalMediaSize/text())',
  title: 'string(atom:title[@type="text"]/text())',
  summary: 'string(atom:summary[@type="text"]/text())',
  added: 'string(td:added/text())',
  label: 'string(td:label/text())',
  libraryId: 'string(td:libraryId/text())',
  libraryType: 'string(td:libraryType/text())',
  versionUuid: 'string(td:versionUuid/text())',
  sharePermission: 'string(td:sharePermission/text())',
  objectTypeName: 'string(td:objectTypeName/text())',
  propagation: 'string(td:propagation/text())',
  isFieldInFolder: 'string(td:isFieldInFolder/text())',
  malwareScanState: 'string(td:malwareScanState/text())',
  restrictedVisibility: 'string(td:restrictedVisibility/text())',
  encrypt: 'string(snx:encrypt/text())',
  isExternal: 'string(snx:isExternal/text())',
  orgId: 'string(snx:orgId/text())',
  orgNam: 'string(snx:orgNam/text())',
};

const parsePolicy = node =>
  parseXMLNode(
    node,
    {
      organizationPublic: 'boolean(td:organizationPublic/text())',
      contentFollowing: 'boolean(td:contentFollowing/text())',
    },
    selectXPath
  );

// parsing links by assigning each link object to its 'rel' value
const parseLinks = nodes =>
  _.reduce(
    nodes,
    (result, node) => {
      const link = parseXMLNode(
        node,
        {
          rel: 'string(@rel)',
          type: 'string(@type)',
          href: 'string(@href)',
          length: 'string(@length)',
        },
        selectXPath
      );

      if (!link.rel) {
        return result;
      }
      /* beautify preserve:start */
      return Object.assign(result, { [link.rel]: link });
      /* beautify preserve:end */
    },
    {}
  );

// parsing ranks by extracting 'scheme', mapping it
// to a certain value, and assigning its text to it
const parseRanks = nodes =>
  _.reduce(
    nodes,
    (result, node) => {
      const rank = parseXMLNode(
        node,
        {
          scheme: 'string(@scheme)',
          text: 'string(text())',
        },
        selectXPath
      );

      const { scheme, text } = rank;
      const { [scheme]: key } = fileRankSchemes;

      if (!key) {
        return result;
      }

      return Object.assign(result, { [key]: text });
    },
    {}
  );

module.exports = (xmlNode) => {
  // collect all of the previous selectors/parsers into a one result object
  const result = _.assign(textValueSelectors, {
    ranks: { selector: 'snx:rank', multi: true, transform: parseRanks },
    links: { selector: 'atom:link', multi: true, transform: parseLinks },
    addedBy: { selector: 'td:addedBy', transform: parseUserInfo },
    author: { selector: 'atom:author', transform: parseUserInfo },
    modifier: { selector: 'td:modifier', transform: parseUserInfo },
    policy: { selector: 'td:policy', transform: parsePolicy },
  });

  return parseXMLNode(xmlNode, result, selectXPath);
};
