#  IBM Connections Files Service

> an implementation for the IBM Connections Files API


## Install

```sh
$ npm install --save ibm-connections-files-service
```


## Usage

After you require files service, you may easily setup the default properties. 
```js
const ibmConnectionsFilesService = require('ibm-connections-files-service');

const defaults = {
  headers: {
    Authorization: 'Basic 12345', // or any other auth method
  },
};
```

Beside default authorization, this service supports ```oniyi-http-plugin-credentials``` and ```oniyi-http-plugin-format-url-template```.

**Credentials** plugin is used only if ```plugins.credentials``` is provided.

**Format-url-template** is used by default, and it is recommended to use it in combination with **credentials** plugin.

For more details about plugins usage, please visit:

[oniyi-http-plugin-credentials](https://www.npmjs.com/package/oniyi-http-plugin-credentials)

[oniyi-http-plugin-format-url-template](https://www.npmjs.com/package/oniyi-http-plugin-format-url-template)

```js
const plugins = {
  credentials: {
    providerName: 'customProvider',
    userRelationProp: 'credentials',
  },
  formatUrlTemplate: {
    valuesMap: {
      authType: {
        basic: 'customAuthType', 
      }
    },
  },
};

const serviceOptions = {
  defaults,
  plugins,
  baseUrl: 'https://fake.base.url.com',
};

const service = ibmConnectionsFilesService(serviceOptions.baseUrl, serviceOptions);
```

Once source instance is created, you are able to use next methods:
```
1. service.myFiles
2. service.publicFiles
3. service.communityFiles
4. service.filesFromFolder
```

Every method comes with three arguments, ```query```, ```options``` and ```callback```.

```query``` - valid query parameters about each method can be found in the source code: /lib/methods/*
```options``` - additional options merged into default http request params

#### 1. service.myFiles

In order to retrieve personal files, prepare configuration and make a call:

```js
const query = {
  customQuery: 'query value',
};

const options = {
    customOptions: 'some value',
};

service.myFiles(query, options, (err, response) => {
  const { files } = response;
  
  // use files object to retrieve data about personal files
});
```
#### 2. service.publicFiles

Similar preparation as for the ```myFiles``` method:

```js
const query = {
  customQuery: 'query value',
};

const options = {
    customOptions: 'some value',
};

service.publicFiles(query, options, (err, response) => {
  const { files } = response;
  
  // use files object to retrieve data about public files
});
```

#### 3. service.communityFiles

When you need to retrieve files that belong to a certain community, it is necessary to provide the communityId:

```js
const query = {
  communityId: '123-foo-456-bar',
};

const options = {
    customOptions: 'some value',
};

service.communityFiles(query, options, (err, response) => {
  const { files } = response;
  
  // use files object to retrieve files from community
});
```

#### 4. service.filesFromFolder

And when you need to retrieve files that belong to a folder/collection, it is necessary to provide the collectionId:

```js
const query = {
  collectionId: '123-foo-456-bar',
};

const options = {
    customOptions: 'some value',
};

service.filesFromFolder(query, options, (err, response) => {
  const { files } = response;
  
  // use files object to retrieve files from folder/collection
});
```

## License

UNLICENSED ©  [GIS AG](https://gis-ag.com)