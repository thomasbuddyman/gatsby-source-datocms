'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var React = require('react');
var Helmet = require('react-helmet').default;

var HelmetDatoCms = function HelmetDatoCms(_ref) {
  var seo = _ref.seo;
  var favicon = _ref.favicon;

  return React.createElement(Helmet, null, (seo ? seo.tags : []).concat(favicon ? favicon.tags : []).map(function (item, i) {
    return React.createElement(item.tagName, Object.assign({ key: i }, Object.entries(item.attributes || {}).reduce(function (acc, _ref2) {
      var _ref3 = _slicedToArray(_ref2, 2);

      var name = _ref3[0];
      var value = _ref3[1];

      if (value) {
        acc[name] = value;
      }
      return acc;
    }, {})), item.content);
  }));
};

module.exports = { HelmetDatoCms: HelmetDatoCms };