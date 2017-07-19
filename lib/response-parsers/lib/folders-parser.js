'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules
const { toInteger, extractIdFromURN, initParser, selectorParserFactory } = require('../../utils/utility');
const { xmlNamespaces, folderRankSchemes } = require('../../constants');
const { authorSelectors, modifierSelectors, policySelectors, rankSelectors } = require('./selectors');

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
    uuid: 'td: uuid',
    title: 'atom:title[@type="text"]',
    summary: 'atom:summary[@type="text"]',
    published: 'atom:published',
    updated: 'atom:updated',
    created: 'td:created',
    modified: 'td:modified',
    label: 'td:label',
    visibility: 'td:visibility',
    type: 'td:type',
    isSyncable: 'td:isSyncable',
    isExternal: 'snx:isExternal',
    orgId: 'snx:orgId',
    orgNam: 'snx:orgNam',
    allowSetFavorite: 'td:allowSetFavorite',
    allowFollowing: 'td:allowFollowing',
  };

  const linkSelectors = {
    self: 'atom:link[@rel="self"]',
    alternate: 'atom:link[@rel="alternate"]',
    edit: 'atom:link[@rel="edit"]',
    files: 'atom:link[@rel="files"]',
  };

  /* Selector parsing */
  const textValues = selectorParser(textValueSelectors, ['type']);
  const links = selectorParser(linkSelectors, ['href', 'type', 'length']);
  const author = selectorParser(authorSelectors);
  const modifier = selectorParser(modifierSelectors);
  const ranks = selectorParser(rankSelectors(folderRankSchemes));
  const policy = selectorParser(policySelectors);

  return _.assign(textValues, { links, author, modifier, ranks, policy });
}

module.exports = {
  parseXmlNode,
};
