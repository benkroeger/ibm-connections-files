'use strict';

// node core modules

// 3rd party modules
const _ = require('lodash');

// internal modules

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

module.exports = {
  authorSelectors,
  modifierSelectors,
  policySelectors,
  rankSelectors,
};
