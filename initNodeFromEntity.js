'use strict';

var mId = require('./makeId');
var makeType = require('./makeType');

module.exports = function initNodeFromEntity(entity) {
  var locale = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  return {
    id: mId(entity, locale),
    parent: null,
    children: [],
    internal: {
      type: makeType(entity)
    }
  };
};