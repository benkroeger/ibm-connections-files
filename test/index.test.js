'use strict';

// node core modules
const fs = require('fs');
const path = require('path');

// 3rd party modules
const test = require('ava');
const _ = require('lodash');

// internal modules
const FileService = require('../lib');
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
  const baseProperties = ['id', 'title', 'summary', 'created', 'published', 'updated',
    'modified', 'label', 'isExternal', 'orgId', 'links', 'author', 'modifier', 'ranks', 'policy'];

  const secondLvlProperties = ['links', 'author', 'ranks', 'policy', 'modifier'];
  const thirdLvlProperties = ['name', 'userId', 'orgId', 'orgName', 'email', 'userState'];

  const filesProperties = [...baseProperties, 'versionLabel', 'totalMediaSize', 'libraryId', 'libraryType',
    'versionUuid', 'objectTypeName', 'propagation', 'malwareScanState', 'restrictedVisibility', 'encrypt', 'addedBy'];
  const communityFilesProperties = [...filesProperties, 'added', 'contentUpdated', 'sharePermission'];
  const foldersListProperties = [...baseProperties, 'uuid', 'visibility', 'type',
    'isSyncable', 'allowSetFavorite', 'allowFollowing'];

  const source = new FileService('https://apps.na.collabserv.com/files', serviceOptions);
  _.assign(t.context, {
    source,
    serviceOptions,
    secondLvlProperties,
    thirdLvlProperties,
    filesProperties,
    communityFilesProperties,
    foldersListProperties,
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
test.cb('validate retrieving personal files feed', (t) => {
  const { source, filesProperties, secondLvlProperties, thirdLvlProperties } = t.context;
  const params = {
    authType: 'basic',
  };

  source.feeds.myFiles(params, (err, response) => {
    const { files } = response;
    t.true(_.isArray(files), '{response.files} should be an array');
    t.is(files.length, 5, 'there should be exactly 5 elements in {response.files}');
    files.forEach((file, i) => {
      filesProperties.forEach(prop => t.true(prop in file, `[${prop}] should be a member of response.files[${i}]`));
      secondLvlProperties.forEach(prop => t.true(_.isPlainObject(file[prop]), `[${prop}] should be a plain object, instead we got: [${typeof file[prop]}]`));
      ['author', 'modifier'].forEach((obj) => {
        thirdLvlProperties.forEach(prop => t.true(prop in file[obj], `[${prop}] should be a member of file[${obj}]`));
      });
      const { links: { enclosure: { length } } } = file;
      t.true(!!parseInt(length, 10), `length: [${length}] should be a number`);
    });
    t.end();
  });
});

test.cb('validate retrieving files from community feed', (t) => {
  const { source, communityFilesProperties, secondLvlProperties, thirdLvlProperties } = t.context;
  const params = {
    authType: 'basic',
    communityId: '5dd83cd6-d3a5-4fb3-89cd-1e2c04e52250',
  };

  source.feeds.communityFiles(params, (err, response) => {
    const { files } = response;
    t.true(_.isArray(files), '{response.files} should be an array');
    t.is(files.length, 117, 'there should be exactly 117 elements in {response.files}');
    files.forEach((file, i) => {
      communityFilesProperties.forEach(prop => t.true(prop in file, `[${prop}] should be a member of response.files[${i}]`));
      [...secondLvlProperties, 'addedBy'].forEach(prop => t.true(_.isPlainObject(file[prop]), `[${prop}] should be a plain object, instead we got: [${typeof file[prop]}]`));
      ['author', 'modifier', 'addedBy'].forEach((obj) => {
        thirdLvlProperties.forEach(prop => t.true(prop in file[obj], `[${prop}] should be a member of file[${obj}]`));
      });

      const { links: { enclosure: { length } } } = file;
      t.true(!!parseInt(length, 10), `length: [${length}] should be a number`);
    });
    t.end();
  });
});

test.cb('validate retrieving publicFiles feed', (t) => {
  const { source, filesProperties, secondLvlProperties, thirdLvlProperties } = t.context;
  const params = {
    authType: 'basic',
  };

  source.feeds.publicFiles(params, (err, response) => {
    const { files } = response;
    t.true(_.isArray(files), '{response.files} should be an array');
    t.is(files.length, 2, 'there should be exactly 2 elements in {response.files}');
    files.forEach((file, i) => {
      filesProperties.forEach(prop => t.true(prop in file, `[${prop}] should be a member of response.files[${i}]`));
      [...secondLvlProperties].forEach(prop => t.true(_.isPlainObject(file[prop]), `[${prop}] should be a plain object, instead we got: [${typeof file[prop]}]`));
      ['author', 'modifier'].forEach((obj) => {
        thirdLvlProperties.forEach(prop => t.true(prop in file[obj], `[${prop}] should be a member of file[${obj}]`));
      });

      const { links: { enclosure: { length } } } = file;
      t.true(!!parseInt(length, 10), `length: [${length}] should be a number`);
    });
    t.end();
  });
});

test.cb('validate retrieving all files from folder feed', (t) => {
  const { source, filesProperties, secondLvlProperties, thirdLvlProperties } = t.context;
  const params = {
    authType: 'basic',
    collectionId: '2e53fe56-84f6-485f-8b7a-0429f852f015',
  };

  source.feeds.filesFromFolder(params, (err, response) => {
    const { files } = response;
    t.true(_.isArray(files), '{response.files} should be an array');
    t.is(files.length, 117, 'there should be exactly 117 elements in {response.files}');
    files.forEach((file, i) => {
      filesProperties.forEach(prop => t.true(prop in file, `[${prop}] should be a member of response.files[${i}]`));
      secondLvlProperties.forEach(prop => t.true(_.isPlainObject(file[prop]), `[${prop}] should be a plain object, instead we got: [${typeof file[prop]}]`));
      ['author', 'modifier'].forEach((obj) => {
        thirdLvlProperties.forEach(prop => t.true(prop in file[obj], `[${prop}] should be a member of file[${obj}]`));
      });

      const { links: { enclosure: { length } } } = file;
      t.true(!!parseInt(length, 10), `length: [${length}] should be a number`);
    });
    t.end();
  });
});

test.cb('validate retrieving list of folders feed', (t) => {
  const { source, foldersListProperties, secondLvlProperties, thirdLvlProperties } = t.context;
  const params = {
    authType: 'basic',
  };

  source.feeds.foldersList(params, (err, response) => {
    const { folders } = response;
    t.true(_.isArray(folders), '{response.folders} should be an array');
    t.is(folders.length, 1, 'there should be only 1 element in {response.folders}');
    folders.forEach((folder, i) => {
      foldersListProperties.forEach(prop => t.true(prop in folder, `[${prop}] should be a member of response.folders[${i}]`));
      secondLvlProperties.forEach(prop => t.true(_.isPlainObject(folder[prop]), `[${prop}] should be a plain object, instead we got: [${typeof folder[prop]}]`));
      ['author', 'modifier'].forEach((obj) => {
        thirdLvlProperties.forEach(prop => t.true(prop in folder[obj], `[${prop}] should be a member of folder[${obj}]`));
      });
    });
    t.end();
  });
});

/* Error / Wrong input scenarios validations */

