"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _templateObject = _taggedTemplateLiteral(["\n  fragment GatsbyDatoCmsResolutions on DatoCmsResolutions {\n    base64\n    width\n    height\n    src\n    srcSet\n  }\n"], ["\n  fragment GatsbyDatoCmsResolutions on DatoCmsResolutions {\n    base64\n    width\n    height\n    src\n    srcSet\n  }\n"]),
    _templateObject2 = _taggedTemplateLiteral(["\n  fragment GatsbyDatoCmsResolutions_noBase64 on DatoCmsResolutions {\n    width\n    height\n    src\n    srcSet\n  }\n"], ["\n  fragment GatsbyDatoCmsResolutions_noBase64 on DatoCmsResolutions {\n    width\n    height\n    src\n    srcSet\n  }\n"]),
    _templateObject3 = _taggedTemplateLiteral(["\n  fragment GatsbyDatoCmsSizes on DatoCmsSizes {\n    base64\n    aspectRatio\n    src\n    srcSet\n    sizes\n  }\n"], ["\n  fragment GatsbyDatoCmsSizes on DatoCmsSizes {\n    base64\n    aspectRatio\n    src\n    srcSet\n    sizes\n  }\n"]),
    _templateObject4 = _taggedTemplateLiteral(["\n  fragment GatsbyDatoCmsSizes_noBase64 on DatoCmsSizes {\n    aspectRatio\n    src\n    srcSet\n    sizes\n  }\n"], ["\n  fragment GatsbyDatoCmsSizes_noBase64 on DatoCmsSizes {\n    aspectRatio\n    src\n    srcSet\n    sizes\n  }\n"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var datoCmsAssetResolutions = exports.datoCmsAssetResolutions = graphql(_templateObject);

var datoCmsAssetResolutionsNoBase64 = exports.datoCmsAssetResolutionsNoBase64 = graphql(_templateObject2);

var datoCmsAssetSizes = exports.datoCmsAssetSizes = graphql(_templateObject3);

var datoCmsAssetSizesNoBase64 = exports.datoCmsAssetSizesNoBase64 = graphql(_templateObject4);