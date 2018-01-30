'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('graphql');

var GraphQLInputObjectType = _require.GraphQLInputObjectType;
var GraphQLObjectType = _require.GraphQLObjectType;
var GraphQLBoolean = _require.GraphQLBoolean;
var GraphQLString = _require.GraphQLString;
var GraphQLInt = _require.GraphQLInt;
var GraphQLFloat = _require.GraphQLFloat;
var GraphQLEnumType = _require.GraphQLEnumType;

var GraphQLJSONType = require('graphql-type-json');
var base64Img = require('base64-img');
var queryString = require('query-string');
var md5 = require('md5');
var path = require('path');
var imgixParams = require('imgix-url-params/dist/parameters');

var _require2 = require('humps');

var decamelizeKeys = _require2.decamelizeKeys;
var camelize = _require2.camelize;
var pascalize = _require2.pascalize;

var fs = require('fs');
var Queue = require('promise-queue');

var isImage = function isImage(_ref) {
  var format = _ref.format;
  var width = _ref.width;
  var height = _ref.height;
  return ['png', 'jpg', 'jpeg', 'gif'].includes(format) && width && height;
};

var createUrl = function createUrl() {
  var image = arguments[0];
  var options = decamelizeKeys(Object.assign.apply(null, [{}].concat(Array.prototype.slice.call(arguments, 1))), { separator: '-' });

  return image.url + '?' + queryString.stringify(options);
};

var queue = new Queue(3, Infinity);

var getBase64Image = function getBase64Image(image, cacheDir) {
  var requestUrl = image.url + '?w=20';
  var cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    var body = fs.readFileSync(cacheFile, 'utf8');
    return Promise.resolve(body);
  }

  return queue.add(function () {
    return new Promise(function (resolve, reject) {
      base64Img.requestBase64(requestUrl, function (err, res, body) {
        if (err) {
          reject(err);
        } else {
          fs.writeFileSync(cacheFile, body, 'utf8');
          resolve(body);
        }
      });
    });
  });
};

var getBase64ImageAndBasicMeasurements = function getBase64ImageAndBasicMeasurements(image, args, cacheDir) {
  return getBase64Image(image, cacheDir).then(function (base64Str) {
    var aspectRatio = void 0;

    if (args.imgixParams && args.imgixParams.rect) {
      var _args$imgixParams$rec = args.imgixParams.rect.split(/\s*,\s*/);

      var _args$imgixParams$rec2 = _slicedToArray(_args$imgixParams$rec, 4);

      var x = _args$imgixParams$rec2[0];
      var y = _args$imgixParams$rec2[1];
      var width = _args$imgixParams$rec2[2];
      var height = _args$imgixParams$rec2[3];

      aspectRatio = width / height;
    } else if (args.width && args.height) {
      aspectRatio = args.width / args.height;
    } else {
      aspectRatio = image.width / image.height;
    }

    return {
      base64Str: base64Str,
      aspectRatio: aspectRatio,
      width: image.width,
      height: image.height
    };
  });
};

var resolveResolution = function resolveResolution(image, options, cacheDir) {
  if (!isImage(image)) return null;

  return getBase64ImageAndBasicMeasurements(image, options, cacheDir).then(function (_ref2) {
    var base64Str = _ref2.base64Str;
    var width = _ref2.width;
    var height = _ref2.height;
    var aspectRatio = _ref2.aspectRatio;

    var desiredAspectRatio = aspectRatio;

    // If we're cropping, calculate the specified aspect ratio.
    if (options.height) {
      desiredAspectRatio = options.width / options.height;
    }

    if (options.height) {
      if (!options.imgixParams || !options.imgixParams.fit) {
        options.imgixParams = Object.assign(options.imgixParams || {}, { fit: 'crop' });
      }
    }

    // Create sizes (in width) for the image. If the width of the
    // image is 800px, the sizes would then be: 800, 1200, 1600,
    // 2400.
    //
    // This is enough sizes to provide close to the optimal image size for every
    // device size / screen resolution
    var sizes = [];
    sizes.push(options.width);
    sizes.push(options.width * 1.5);
    sizes.push(options.width * 2);
    sizes.push(options.width * 3);
    sizes = sizes.map(Math.round);

    // Create the srcSet
    var srcSet = sizes.filter(function (size) {
      return size < width;
    }).map(function (size, i) {
      var resolution = void 0;
      switch (i) {
        case 0:
          resolution = '1x';
          break;
        case 1:
          resolution = '1.5x';
          break;
        case 2:
          resolution = '2x';
          break;
        case 3:
          resolution = '3x';
          break;
        default:
      }
      var h = Math.round(size / desiredAspectRatio);
      var url = createUrl(image, options.imgixParams, { w: size, h: h });
      return url + ' ' + resolution;
    }).join(',\n');

    var pickedHeight = void 0;

    if (options.height) {
      pickedHeight = options.height;
    } else {
      pickedHeight = options.width / desiredAspectRatio;
    }

    return {
      base64: base64Str,
      aspectRatio: aspectRatio,
      width: Math.round(options.width),
      height: Math.round(pickedHeight),
      src: createUrl(image, options.imgixParams, { w: options.width }),
      srcSet: srcSet
    };
  });
};

var resolveSizes = function resolveSizes(image, options, cacheDir) {
  if (!isImage(image)) return null;

  return getBase64ImageAndBasicMeasurements(image, options, cacheDir).then(function (_ref3) {
    var base64Str = _ref3.base64Str;
    var width = _ref3.width;
    var height = _ref3.height;
    var aspectRatio = _ref3.aspectRatio;

    var desiredAspectRatio = aspectRatio;

    // If we're cropping, calculate the specified aspect ratio.
    if (options.maxHeight) {
      desiredAspectRatio = options.maxWidth / options.maxHeight;
    }

    // If the users didn't set a default sizes, we'll make one.
    if (!options.sizes) {
      options.sizes = '(max-width: ' + options.maxWidth + 'px) 100vw, ' + options.maxWidth + 'px';
    }

    // Create sizes (in width) for the image. If the max width of the container
    // for the rendered markdown file is 800px, the sizes would then be: 200,
    // 400, 800, 1200, 1600, 2400.
    //
    // This is enough sizes to provide close to the optimal image size for every
    // device size / screen resolution
    var sizes = [];
    sizes.push(options.maxWidth / 4);
    sizes.push(options.maxWidth / 2);
    sizes.push(options.maxWidth);
    sizes.push(options.maxWidth * 1.5);
    sizes.push(options.maxWidth * 2);
    sizes.push(options.maxWidth * 3);
    sizes = sizes.map(Math.round);

    // Filter out sizes larger than the image's maxWidth.
    var filteredSizes = sizes.filter(function (size) {
      return size < width;
    });

    // Add the original image to ensure the largest image possible
    // is available for small images.
    filteredSizes.push(width);

    // Create the srcSet.
    var srcSet = filteredSizes.map(function (width) {
      var h = Math.round(width / desiredAspectRatio);
      var url = createUrl(image, options.imgixParams, { w: width, h: h });
      return url + ' ' + Math.round(width) + 'w';
    }).join(',\n');

    return {
      base64: base64Str,
      aspectRatio: aspectRatio,
      src: createUrl(image, options.imgixParams, { w: options.maxWidth, h: options.maxHeight }),
      srcSet: srcSet,
      sizes: options.sizes
    };
  });
};

var resolveResize = function resolveResize(image, options, cacheDir) {
  if (!isImage(image)) return null;

  return getBase64ImageAndBasicMeasurements(image, options, cacheDir).then(function (_ref4) {
    var base64Str = _ref4.base64Str;
    var width = _ref4.width;
    var height = _ref4.height;
    var aspectRatio = _ref4.aspectRatio;


    // If the user selected a height (so cropping) and fit option
    // is not set, we'll set our defaults
    if (options.height) {
      if (!options.imgixParams || !options.imgixParams.fit) {
        options.imgixParams = Object.assign(options.imgixParams || {}, { fit: 'crop' });
      }
    }

    if (options.base64) {
      return base64Str;
    }

    var pickedWidth = options.width;
    var pickedHeight = void 0;

    if (options.height) {
      pickedHeight = options.height;
    } else {
      pickedHeight = Math.round(pickedWidth / aspectRatio);
    }

    return {
      src: createUrl(image, options.imgixParams, { w: pickedWidth, h: pickedHeight }),
      width: pickedWidth,
      height: pickedHeight,
      aspectRatio: aspectRatio,
      base64: base64Str
    };
  });
};

module.exports = function extendAssetNode(_ref5) {
  var cacheDir = _ref5.cacheDir;


  var fields = {};
  var mappings = {
    boolean: GraphQLBoolean,
    hex_color: GraphQLString,
    integer: GraphQLInt,
    list: GraphQLString,
    number: GraphQLFloat,
    path: GraphQLString,
    string: GraphQLString,
    timestamp: GraphQLString,
    unit_scalar: GraphQLFloat,
    url: GraphQLString
  };

  Object.entries(imgixParams.parameters).forEach(function (_ref6) {
    var _ref7 = _slicedToArray(_ref6, 2);

    var param = _ref7[0];
    var doc = _ref7[1];

    fields[camelize(param)] = {
      type: doc.expects.length === 1 ? mappings[doc.expects[0].type] : GraphQLString,
      description: doc.short_description + ' (' + doc.url + ')'
    };
  });

  var ImgixParamsType = new GraphQLInputObjectType({
    name: 'DatoCmsImgixParams',
    fields: fields
  });

  return {
    resolutions: {
      type: new GraphQLObjectType({
        name: 'DatoCmsResolutions',
        fields: {
          base64: { type: GraphQLString },
          aspectRatio: { type: GraphQLFloat },
          width: { type: GraphQLFloat },
          height: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString }
        }
      }),
      args: {
        width: {
          type: GraphQLInt,
          defaultValue: 400
        },
        height: {
          type: GraphQLInt
        },
        imgixParams: {
          type: ImgixParamsType
        }
      },
      resolve: function resolve(image, options, context) {
        return resolveResolution(image, options, cacheDir);
      }
    },
    sizes: {
      type: new GraphQLObjectType({
        name: 'DatoCmsSizes',
        fields: {
          base64: { type: GraphQLString },
          aspectRatio: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
          sizes: { type: GraphQLString }
        }
      }),
      args: {
        maxWidth: {
          type: GraphQLInt,
          defaultValue: 800
        },
        maxHeight: {
          type: GraphQLInt
        },
        sizes: {
          type: GraphQLString
        },
        imgixParams: {
          type: ImgixParamsType
        }
      },
      resolve: function resolve(image, options, context) {
        return resolveSizes(image, options, cacheDir);
      }
    },
    resize: {
      type: new GraphQLObjectType({
        name: 'DatoCmsResize',
        fields: {
          src: { type: GraphQLString },
          width: { type: GraphQLInt },
          height: { type: GraphQLInt },
          aspectRatio: { type: GraphQLFloat }
        }
      }),
      args: {
        width: {
          type: GraphQLInt,
          defaultValue: 400
        },
        height: {
          type: GraphQLInt
        },
        base64: {
          type: GraphQLBoolean,
          defaultValue: false
        },
        imgixParams: {
          type: ImgixParamsType
        }
      },
      resolve: function resolve(image, options, context) {
        return resolveResize(image, options, cacheDir);
      }
    }
  };
};