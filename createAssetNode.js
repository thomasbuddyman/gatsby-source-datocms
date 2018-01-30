'use strict';

var addDigestToNode = require('./addDigestToNode');
var build = require('datocms-client/lib/local/fields/build');

module.exports = function createAssetNode(parent, field, value, itemsRepo, createNode) {
  if (!value) {
    return null;
  }

  var node = Object.assign({
    id: value.path,
    parent: parent.id,
    children: [],
    internal: {
      type: 'DatoCmsAsset'
    }
  }, build('image', value, itemsRepo).toMap());

  parent.children = node.children.concat([node.id]);
  addDigestToNode(node);
  createNode(node);

  return node.id;
};