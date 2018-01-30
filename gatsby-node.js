'use strict';

var _require = require('datocms-client');

var SiteClient = _require.SiteClient;

var SiteChangeWatcher = require('datocms-client/lib/dump/SiteChangeWatcher');
var fs = require('fs-extra');
var path = require('path');

var fetch = require('./fetch');
var createItemTypeNodes = require('./createItemTypeNodes');
var createItemNodes = require('./createItemNodes');
var createSiteNode = require('./createSiteNode');
var extendAssetNode = require('./extendAssetNode');

exports.sourceNodes = async function (_ref, _ref2) {
  var boundActionCreators = _ref.boundActionCreators;
  var getNodes = _ref.getNodes;
  var hasNodeChanged = _ref.hasNodeChanged;
  var store = _ref.store;
  var reporter = _ref.reporter;
  var apiToken = _ref2.apiToken;
  var createNode = boundActionCreators.createNode;
  var deleteNodes = boundActionCreators.deleteNodes;
  var touchNode = boundActionCreators.touchNode;
  var setPluginStatus = boundActionCreators.setPluginStatus;


  var client = new SiteClient(apiToken, {
    'X-Reason': 'dump',
    'X-SSG': 'gatsby'
  });

  var sync = async function sync() {
    if (store.getState().status.plugins && store.getState().status.plugins['gatsby-source-datocms']) {
      var oldNodeIds = store.getState().status.plugins['gatsby-source-datocms'].nodeIds;
      deleteNodes(oldNodeIds);
    }

    var nodeIds = [];
    var createNodeWrapper = function createNodeWrapper(node) {
      nodeIds.push(node.id);
      createNode(node);
    };

    var repo = await fetch(client);
    var itemTypes = repo.findEntitiesOfType('item_type');
    var site = repo.findEntitiesOfType('site')[0];

    createItemTypeNodes(itemTypes, createNodeWrapper);
    createItemNodes(repo, createNodeWrapper);
    createSiteNode(repo, createNodeWrapper);

    setPluginStatus({ nodeIds: nodeIds });

    return site.id;
  };

  var siteId = await sync();

  var watcher = new SiteChangeWatcher(siteId);
  watcher.connect(function () {
    reporter.info('Detected DatoCMS data change!');
    sync();
  });
};

exports.onPreExtractQueries = async function (_ref3) {
  var store = _ref3.store;
  var getNodes = _ref3.getNodes;

  var program = store.getState().program;
  var nodes = getNodes();

  if (nodes.some(function (n) {
    return n.internal.type === 'DatoCmsAsset';
  })) {
    await fs.copy(path.join(__dirname, 'src', 'assetFragments.js'), program.directory + '/.cache/fragments/datocms-asset-fragments.js');
  }

  if (nodes.some(function (n) {
    return n.internal.type === 'DatoCmsSeoMetaTags';
  })) {
    await fs.copy(path.join(__dirname, 'src', 'seoFragments.js'), program.directory + '/.cache/fragments/datocms-seo-fragments.js');
  }

  if (nodes.some(function (n) {
    return n.internal.type === 'DatoCmsFaviconMetaTags';
  })) {
    await fs.copy(path.join(__dirname, 'src', 'faviconFragments.js'), program.directory + '/.cache/fragments/datocms-favicon-fragments.js');
  }
};

exports.setFieldsOnGraphQLNodeType = function (_ref4) {
  var type = _ref4.type;
  var store = _ref4.store;

  if (type.name !== 'DatoCmsAsset') {
    return {};
  }

  var program = store.getState().program;
  var cacheDir = program.directory + '/.cache/datocms-assets';

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }

  return extendAssetNode({ cacheDir: cacheDir });
};