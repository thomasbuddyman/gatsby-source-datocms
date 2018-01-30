'use strict';

var addDigestToNode = require('./addDigestToNode');
var faviconTagsBuilder = require('datocms-client/lib/utils/faviconTagsBuilder');

module.exports = function createFaviconMetaTagsNode(node, site, createNode) {
  var faviconNode = {
    id: node.id + 'FaviconMetaTags',
    parent: node.id,
    children: [],
    tags: faviconTagsBuilder(site),
    internal: {
      type: 'DatoCmsFaviconMetaTags'
    }
  };

  node.children = node.children.concat([faviconNode.id]);
  addDigestToNode(faviconNode);
  createNode(faviconNode);

  return faviconNode.id;
};