'use strict';

var Site = require('datocms-client/lib/local/Site');
var initNodeFromEntity = require('./initNodeFromEntity');
var addDigestToNode = require('./addDigestToNode');
var addEntityAttributes = require('./addEntityAttributes');
var i18n = require('datocms-client/lib/utils/i18n');
var createFaviconMetaTagsNode = require('./createFaviconMetaTagsNode');

module.exports = function (repo, createNode) {
  var siteEntity = repo.findEntitiesOfType('site')[0];
  var site = new Site(siteEntity);

  i18n.availableLocales = site.locales;

  site.locales.forEach(function (locale) {
    i18n.locale = locale;

    var node = initNodeFromEntity(siteEntity, locale);

    node = Object.assign(site.toMap(), node);

    delete node.favicon;
    delete node.faviconMetaTags;

    node.faviconMetaTags___NODE = createFaviconMetaTagsNode(node, site, createNode);

    node.locale = locale;

    addDigestToNode(node);
    createNode(node);
  });
};