'use strict';

// node core modules

// 3rd party modules

// internal modules

module.exports = {
  myFiles: {
    uri: '{ authType }/api/myuserlibrary/feed',
    queryParams: {
      visibility: '', // Defines who has access to the files. Authorized values: public, private
      includePath: '', // Specifies whether or not to return the <td:path> element that shows the path to the object
      includeQuota: '', // If set to true , the <td:librarySize> and <td:libraryQuota> elements, are returned in the resulting feed
      includeTags: '', // Specifies whether or not the tags that are displayed on the file welcome page
      page: '', // Page number, default is 1
      ps: '', // Page size, default is 10
      sl: '', // Specifies the start index (number) in the collection from which the results should be returned
      since: '', // Returns entries that have file content that has been added or updated since the specified time
      sortBy: '',
      sortOrder: '',
      tag: '', // Filters the list of results by tag
      shared: '',
    },
  },
  communityFiles: {
    uri: '{ authType }/api/communitycollection/{ communityId }/feed',
    queryParams: {
      added: '', // Specifies whether or not to return the <td:path> element that shows the path to the object
      addedBy: '',
      created: '',
      page: '', // Page number, default is 1
      pageSize: '', // Page size, default is 10
      sl: '', // Specifies the start index (number) in the collection from which the results should be returned
      since: '', // Returns entries that have file content that has been added or updated since the specified time
      sortBy: '',
      sortOrder: '',
      tag: '', // Filters the list of results by tag
      sC: '', // String. Specifies sort category. Authorized values: document, collection, all
      category: '', // String. To filter the items by the specified item type. Authorized values: document, collection, page, all
      format: '', // String. Format the result should be returned as. Authorized values: ATOM, JSON
      includeNotification: '', // String. If the notification information will be returned in collection entry. Authorized values: false, true
      type: '', // String. Filter on files that are in either personal or community libraries. Authorized values: allFiles, personalFiles, communityFiles
      sharePermission: '', // String. Filter the files by shared permission into the collection. Authorized values: view, edit
      includeFavorite: '', // String. Indicate whether to return favorite information of files in the feed. Authorized values: false, true
      label: '', // String. Filter the files or sub-folders with the label of the folder
      title: '', // String. Filter files and/or sub-folders based on their title
      acl: '', // String. Indicate whether to return permission information of files in the feed. Authorized values: false, true
      collectionAcIs: '', // String. Indicate whether to return permission information for the folder/community folder. Authorized values: false, true
      access: '', // String. Filter the content of the returned feed by the access role of the authenticated user. Authorized values: reader, editor, manager
      includeAncestors: '', // String. Specify whether to return ancestors of the folder. Authorized values: false, true
      isExact: '', // Defines who has access to the files. Authorized values: public, private
      wildmatch: '', // Shows also file marked public for external viewing
    },
  },
  publicFiles: {
    uri: '{ authType }/api/documents/feed',
    queryParams: {
      visibility: 'public', // Defines who has access to the files. If {{search}} param not provided, this is an optional parameter, and needs to be set to public.
      includePath: '', // Specifies whether or not to return the <td:path> element that shows the path to the object
      includeTags: '', // Specifies whether or not the tags that are displayed on the file welcome page
      page: '', // Page number, default is 1
      ps: '', // Page size, default is 10
      sl: '', // Specifies the start index (number) in the collection from which the results should be returned
      since: '', // Returns entries that have file content that has been added or updated since the specified time
      sortBy: '',
      sortOrder: '',
      tag: '', // Filters the list of results by tag
      isExternal: '', // Shows also file marked public for external viewing
      search: '', // Search parameter is not described in IBM Docs, but if not provided, then {{visibility}} param need to be set to public
    },
  },
  filesFromFolder: {
    uri: '{ authType }/api/collection/{ collectionId }/feed',
    queryParams: {
      added: '', // Specifies whether or not to return the <td:path> element that shows the path to the object
      addedBy: '',
      created: '',
      page: '', // Page number, default is 1
      ps: '', // Page size, default is 10
      sl: '', // Specifies the start index (number) in the collection from which the results should be returned
      sortBy: '',
      sortOrder: '',
      tag: '', // Filters the list of results by tag
    },
  },
  foldersList: {
    uri: '{ authType }/api/collections/feed',
    queryParams: {
      visibility: '', // Not an Optional param. Defines who has access to the files. set it to public
      includePath: '', // Specifies whether or not to return the <td:path> element that shows the path to the object
      includeTags: '', // Specifies whether or not the tags that are displayed on the file welcome page
      page: '', // Page number, default is 1
      ps: '', // Page size, default is 10
      sl: '', // Specifies the start index (number) in the collection from which the results should be returned
      since: '', // Returns entries that have file content that has been added or updated since the specified time
      sortBy: '',
      sortOrder: '',
      tag: '', // Filters the list of results by tag
      isExternal: '', // Shows also file marked public for external viewing
    },
  },
};
