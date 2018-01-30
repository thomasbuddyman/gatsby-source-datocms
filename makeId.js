'use strict';

var makeType = require('./makeType');

module.exports = function makeId(entity) {
  var locale = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var id = makeType(entity);

  id += '-' + entity.id;

  if (locale) {
    id += '-' + locale;
  }

  return id;
};