'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');
const xmlUtils = require('oniyi-utils-xml');

// internal modules
const { toInteger, extractIdFromURN, initParser, selectorParserFactory } = require('../utils/utility');
const { xmlNamespaces, fileRankSchemes } = require('../constants');

const selectXPath = initParser(xmlNamespaces);

function parseXmlNode(xmlNode) {
  const selectorParser = selectorParserFactory(xmlNode, selectXPath);

  /**
   *  Purpose of this constant is to gather xml elements we need in our parser function. Property can be String or
   *  Object. As Object, it could have:
   *  selector -> (represented in string value),
   *  transform -> function used upon extracted data,
   *  attribute -> if we need to extract certain attribute from xml node
   *
   *  If we need to extract certain element by some of its own properties, we use [@prop="name"] syntax
   */
  const textValueSelectors = {
    id: {
      selector: 'atom:id',
      transform: extractIdFromURN,
    },
    versionLabel: {
      selector: 'td:versionLabel',
      transform: toInteger,
    },
    totalMediaSize: {
      selector: 'td:totalMediaSize',
      transform: toInteger,
    },
    title: 'atom:title[@type="text"]',
    summary: 'atom:summary[@type="text"]',
    added: 'td:added',
    created: 'td:created',
    published: 'atom:published',
    updated: 'atom:updated',
    contentUpdated: 'td:contentUpdated',
    modified: 'td:modified',
    label: 'td:label',
    libraryId: 'td:libraryId',
    libraryType: 'td:libraryType',
    versionUuid: 'td:versionUuid',
    sharePermission: 'td:sharePermission',
    objectTypeName: 'td:objectTypeName',
    propagation: 'td:propagation',
    isFieldInFolder: 'td:isFieldInFolder',
    malwareScanState: 'td:malwareScanState',
    restrictedVisibility: 'td:restrictedVisibility',
    encrypt: 'snx:encrypt',
    isExternal: 'snx:isExternal',
    orgId: 'snx:orgId',
    orgNam: 'snx:orgNam',
  };

  const linkSelectors = {
    self: 'atom:link[@rel="self"]',
    alternate: 'atom:link[@rel="alternate"]',
    edit: 'atom:link[@rel="edit"]',
    'edit-media': 'atom:link[@rel="edit-media"]',
    enclosure: 'atom:link[@rel="enclosure"]',
    thumbnail: 'atom:link[@rel="thumbnail"]',
    replies: 'atom:link[@rel="replies"]',
  };

  const addedBySelectors = {
    name: 'td:addedBy/atom:name',
    userId: 'td:addedBy/snx:userid',
    orgId: 'td:addedBy/snx:orgId',
    orgName: 'td:addedBy/snx:orgName',
    email: 'td:addedBy/atom:email',
    userState: 'td:addedBy/snx:userState',
  };
  const authorSelectors = {
    name: 'atom:author/atom:name',
    userId: 'atom:author/snx:userid',
    orgId: 'atom:author/snx:orgId',
    orgName: 'atom:author/snx:orgName',
    email: 'atom:author/atom:email',
    userState: 'atom:author/snx:userState',
  };

  const modifierSelectors = {
    name: 'td:modifier/atom:name',
    userId: 'td:modifier/snx:userid',
    orgId: 'td:modifier/snx:orgId',
    orgName: 'td:modifier/snx:orgName',
    email: 'td:modifier/atom:email',
    userState: 'td:modifier/snx:userState',
  };

  const rankSelectors = rankSchemes =>
    _.reduce(rankSchemes, (result, value, key) =>
      _.assign(result, {
        [key]: `snx:rank[@scheme="${value}"]`,
      }), {});

  const policySelectors = {
    organizationPublic: 'td:policy/td:organizationPublic',
    contentFollowing: 'td:policy/td:contentFollowing',
  };
  /* Selector parsing */
  const textValues = selectorParser(textValueSelectors);
  const links = selectorParser(linkSelectors, ['href', 'type', 'length']);
  const addedBy = selectorParser(addedBySelectors);
  const author = selectorParser(authorSelectors);
  const modifier = selectorParser(modifierSelectors);
  const ranks = selectorParser(rankSelectors(fileRankSchemes));
  const policy = selectorParser(policySelectors);

  return _.assign(textValues, { links, addedBy, author, modifier, ranks, policy });
}

module.exports = parseXmlNode;
