'use strict';

// node core modules

// 3rd party modules
import test from 'ava';
import _ from 'lodash';

// internal modules
import fileService from '../lib';
import { mock, record, persist } from './fixtures/http-mocking';

// configure dotenv
require('dotenv').config();

const { unmocked, username, password } = process.env;

test.before(() => (unmocked ? record() : mock()));
test.after(() => unmocked && persist());

test.beforeEach((t) => {
  const serviceOptions = {
    defaults: {
      authType: 'basic',
    },
  };
  if (unmocked) {
    Object.assign(serviceOptions.defaults, {
      auth: {
        user: username,
        pass: password,
      },
    });
  }

  const baseProperties = ['id', 'title', 'summary', 'created', 'published', 'updated',
    'modified', 'label', 'isExternal', 'orgId', 'links', 'author', 'modifier', 'ranks', 'policy'];

  const secondLvlProperties = ['links', 'author', 'ranks', 'policy', 'modifier'];
  const thirdLvlProperties = ['name', 'userId', 'orgId', 'orgName', 'email', 'userState'];

  const filesProperties = [...baseProperties, 'versionLabel', 'totalMediaSize', 'libraryId', 'libraryType',
    'versionUuid', 'objectTypeName', 'propagation', 'malwareScanState', 'restrictedVisibility', 'encrypt'];
  const communityFilesProperties = [...filesProperties, 'added', 'contentUpdated', 'sharePermission'];
  const foldersListProperties = [...baseProperties, 'uuid', 'visibility', 'type',
    'isSyncable', 'allowSetFavorite', 'allowFollowing'];

  const validateObjects = (file, extraProps) => {
    ['created', 'published', 'updated', 'modified', ...extraProps].forEach(elem => t.true(_.isFinite(file[elem]),
      `[${elem}] should be of type Number, instead we got: [${typeof file[elem]}]`));
  };

  const service = fileService('https://apps.na.collabserv.com/files', serviceOptions);
  _.assign(t.context, {
    service,
    serviceOptions,
    secondLvlProperties,
    thirdLvlProperties,
    filesProperties,
    communityFilesProperties,
    foldersListProperties,
    validateObjects,
  });
});

/* Successful scenarios validations */

test.cb('validate retrieving personal files feed', (t) => {
  const { service, filesProperties, secondLvlProperties, thirdLvlProperties, validateObjects } = t.context;

  service.myFiles({}, {}, (err, files) => {
    t.ifError(err);

    t.true(_.isArray(files), '{response.files} should be an array');
    t.is(files.length, 5, 'there should be exactly 5 elements in {response.files}');
    files.forEach((file, i) => {
      filesProperties.forEach(prop => t.true(prop in file, `[${prop}] should be a member of response.files[${i}]`));

      validateObjects(file, ['versionLabel', 'totalMediaSize']);

      secondLvlProperties.forEach(prop => t.true(_.isPlainObject(file[prop]),
        `[${prop}] should be a plain object, instead we got: [${typeof file[prop]}]`));
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
  const { service, communityFilesProperties, secondLvlProperties, thirdLvlProperties, validateObjects } = t.context;
  const query = {
    authType: 'basic',
    communityId: '5dd83cd6-d3a5-4fb3-89cd-1e2c04e52250',
  };

  service.communityFiles(query, {}, (err, files) => {
    t.ifError(err);

    t.true(_.isArray(files), '{response.files} should be an array');
    t.is(files.length, 10, 'there should be exactly 10 elements in {response.files}');
    files.forEach((file, i) => {
      communityFilesProperties.forEach(prop => t.true(prop in file,
        `[${prop}] should be a member of response.files[${i}]`));
      validateObjects(file, ['versionLabel', 'totalMediaSize']);

      [...secondLvlProperties, 'addedBy'].forEach(prop => t.true(_.isPlainObject(file[prop]),
        `[${prop}] should be a plain object, instead we got: [${typeof file[prop]}]`));
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
  const { service, filesProperties, secondLvlProperties, thirdLvlProperties } = t.context;

  service.publicFiles({}, {}, (err, files) => {
    t.ifError(err);

    t.true(_.isArray(files), '{response.files} should be an array');
    t.is(files.length, 2, 'there should be exactly 2 elements in {response.files}');
    files.forEach((file, i) => {
      filesProperties.forEach(prop => t.true(prop in file,
        `[${prop}] should be a member of response.files[${i}]`));
      [...secondLvlProperties].forEach(prop => t.true(_.isPlainObject(file[prop]),
        `[${prop}] should be a plain object, instead we got: [${typeof file[prop]}]`));
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
  const { service, filesProperties, secondLvlProperties, thirdLvlProperties } = t.context;
  const query = {
    authType: 'basic',
    collectionId: '2e53fe56-84f6-485f-8b7a-0429f852f015',
  };

  service.filesFromFolder(query, {}, (err, files) => {
    t.ifError(err);

    t.true(_.isArray(files), '{response.files} should be an array');
    t.is(files.length, 10, 'there should be exactly 10 elements in {response.files}');
    files.forEach((file, i) => {
      filesProperties.forEach(prop => t.true(prop in file,
        `[${prop}] should be a member of response.files[${i}]`));
      secondLvlProperties.forEach(prop => t.true(_.isPlainObject(file[prop]),
        `[${prop}] should be a plain object, instead we got: [${typeof file[prop]}]`));
      ['author', 'modifier'].forEach((obj) => {
        thirdLvlProperties.forEach(prop => t.true(prop in file[obj], `[${prop}] should be a member of file[${obj}]`));
      });

      const { links: { enclosure: { length } } } = file;
      t.true(!!parseInt(length, 10), `length: [${length}] should be a number`);
    });
    t.end();
  });
});

/* Error / Wrong input scenarios validations */

