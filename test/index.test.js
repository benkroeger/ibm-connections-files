'use strict';

// node core modules
const fs = require('fs');
const path = require('path');

// 3rd party modules
const test = require('ava');
const _ = require('lodash');

// internal modules
const WikiSource = require('../lib');
const { mockHttpRequests, cleanAll, writeNockCallsToFile, recordHttpRequests } = require('./helpers/http-mocking-utils');

// configure dotenv
require('dotenv').config();

const { USER_CREDENTIALS: userCredentials } = process.env;
const nockCallsExist = fs.existsSync(path.join(__dirname, 'helpers/nock-calls.js'));

test.beforeEach((t) => {
  const auth = `Basic ${new Buffer(userCredentials).toString('base64')}`;
  const defaults = {
    headers: {
      Authorization: auth,
    },
  };
  const serviceOptions = {
    defaults,
  };
  const baseMembers = ['id', 'versionLabel', 'title', 'published', 'updated', 'created',
    'content', 'links', 'author', 'modified'];

  const wikiPageMembers = [...baseMembers, 'label', 'summary', 'visibility', 'versionUuid',
    'propagation', 'totalMediaSize', 'ranks'];
  const wikiVersionPageMembers = [...baseMembers, 'label', 'summary', 'documentUuid', 'libraryId'];
  const wikiCommentsMembers = [...baseMembers, 'language', 'deleteWithRecord'];
  const wikiVersionsMembers = [...baseMembers, 'label', 'summary', 'libraryId', 'documentUuid'];

  const source = new WikiSource('https://apps.na.collabserv.com/wikis/', serviceOptions);
  _.assign(t.context, {
    source,
    serviceOptions,
    wikiPageMembers,
    wikiVersionPageMembers,
    wikiCommentsMembers,
    wikiVersionsMembers,
  });
});
//
// test.before(() => {
//   if (!nockCallsExist) {
//     recordHttpRequests();
//     return;
//   }
//   mockHttpRequests();
// });
//
// test.after(() => {
//   if (!nockCallsExist) {
//     writeNockCallsToFile();
//   }
//   cleanAll();
// });

/* Successful scenarios validations */


/* Error / Wrong input scenarios validations */

