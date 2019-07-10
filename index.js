var loaderUtils = require('loader-utils');
var webfontsGenerator = require('@vusion/webfonts-generator');
var path = require('path');
var glob = require('glob');
var url = require('url');
var hashFiles = require('./utils').hashFiles;

var mimeTypes = {
  'eot': 'application/vnd.ms-fontobject',
  'svg': 'image/svg+xml',
  'ttf': 'application/x-font-ttf',
  'woff': 'application/font-woff',
  'woff2': 'font/woff2'
};

function getFilesAndDeps (patterns, context) {
  var files = [];
  var filesDeps = [];
  var directoryDeps = [];

  function addFile (file) {
    filesDeps.push(file);
    files.push(path.resolve(context, file));
  }

  function addByGlob (globExp) {
    var globOptions = {
      cwd: context
    };

    var foundFiles = glob.sync(globExp, globOptions);
    files = files.concat(foundFiles.map(file => {
      return path.resolve(context, file);
    }));

    var globDirs = glob.sync(path.dirname(globExp) + '/', globOptions);
    directoryDeps = directoryDeps.concat(globDirs.map(file => {
      return path.resolve(context, file);
    }));
  }

  // Re-work the files array.
  patterns.forEach(function (pattern) {
    if (glob.hasMagic(pattern)) {
      addByGlob(pattern);
    } else {
      addFile(pattern);
    }
  });

  return {
    files: files,
    dependencies: {
      directories: directoryDeps,
      files: filesDeps
    }
  };
}

// Futureproof webpack option parsing
function wpGetOptions (context) {
  if (typeof context.query === 'string') return loaderUtils.getOptions(context);
  return context.query;
}

module.exports = function (content) {
  this.cacheable();

  var webpackOptions = this.options || {}; // only makes sense in Webpack 1.x, or when LoaderOptionsPlugin is used
  var options = wpGetOptions(this) || {};
  var rawFontConfig;
  try {
    rawFontConfig = JSON.parse(content);
  } catch (ex) {
    rawFontConfig = this.exec(content, this.resourcePath);
  }
  var fontConfig = Object.assign({}, options, rawFontConfig);

  var filesAndDeps = getFilesAndDeps(fontConfig.files, this.context);
  filesAndDeps.dependencies.files.forEach(this.addDependency.bind(this));
  filesAndDeps.dependencies.directories.forEach(this.addContextDependency.bind(this));
  fontConfig.files = filesAndDeps.files;

  // With everything set up, let's make an ACTUAL config.
  var formats = fontConfig.types || ['eot', 'woff', 'woff2', 'ttf', 'svg'];
  if (formats.constructor !== Array) {
    formats = [formats];
  }

  var generatorOptions = {
    files: fontConfig.files,
    fontName: fontConfig.fontName,
    types: formats,
    order: formats,
    fontHeight: fontConfig.fontHeight || 1000, // Fixes conversion issues with small svgs,
    codepoints: fontConfig.codepoints || {},
    templateOptions: {
      baseSelector: fontConfig.baseSelector || '.icon',
      classPrefix: 'classPrefix' in fontConfig ? fontConfig.classPrefix : 'icon-'
    },
    scssFile: fontConfig.scssFile || false,
    dest: fontConfig.dest || '',
    html: fontConfig.html || false,
    htmlDest: fontConfig.htmlDest || undefined,
    writeFiles: fontConfig.writeFiles || false,
    cssFontsUrl: fontConfig.cssFontsUrl || '',
    embed: fontConfig.embed || false,
    formatOptions: fontConfig.formatOptions || {}
  };

  // Add key only if it exists in config object to avoid fs errors
  if ('htmlTemplate' in fontConfig) {
    generatorOptions.htmlTemplate = fontConfig.htmlTemplate;
  }

  // This originally was in the object notation itself.
  // Unfortunately that actually broke my editor's syntax-highlighting...
  // ... what a shame.
  if (typeof fontConfig.rename === 'function') {
    generatorOptions.rename = fontConfig.rename;
  } else {
    generatorOptions.rename = function (f) {
      return path.basename(f, '.svg');
    };
  }

  if (fontConfig.cssTemplate) {
    generatorOptions.cssTemplate = path.resolve(this.context, fontConfig.cssTemplate);
  }

  if (fontConfig.cssFontsUrl) {
    generatorOptions.cssFontsUrl = path.resolve(this.context, fontConfig.cssFontsUrl);
  }

  if (fontConfig.htmlTemplate) {
    generatorOptions.htmlTemplate = path.resolve(this.context, fontConfig.htmlTemplate);
  }

  if (fontConfig.htmlDest) {
    generatorOptions.htmlDest = path.resolve(this.context, fontConfig.htmlDest);
  }

  if (fontConfig.dest) {
    generatorOptions.dest = path.resolve(this.context, fontConfig.dest);
  }

  // Spit out SCSS file to same path as CSS file to easily use mixins (scssFile must be true)
  if (fontConfig.scssFile === true) {
    generatorOptions.cssDest = path.resolve(this.context, fontConfig.dest, fontConfig.fontName + '.scss');
  }

  // svgicons2svgfont stuff
  var keys = [
    'fixedWidth',
    'centerHorizontally',
    'normalize',
    'fontHeight',
    'round',
    'descent'
  ];
  for (var x in keys) {
    if (typeof fontConfig[keys[x]] !== 'undefined') {
      generatorOptions[keys[x]] = fontConfig[keys[x]];
    }
  }

  var cb = this.async();

  const publicPath = typeof options.publicPath === 'string'
  ? options.publicPath === '' || options.publicPath.endsWith('/')
  ? options.publicPath
  : `${options.publicPath}/`
  : typeof options.publicPath === 'function'
  ? options.publicPath(this.resourcePath, this.rootContext)
  : this._compilation.outputOptions.publicPath;

  var embed = !!generatorOptions.embed;

  if (generatorOptions.cssTemplate) {
    this.addDependency(generatorOptions.cssTemplate);
  }

  if (generatorOptions.cssFontsUrl) {
    this.addDependency(generatorOptions.cssFontsUrl);
  }

  webfontsGenerator(generatorOptions, (err, res) => {
    if (err) {
      return cb(err);
    }
    var urls = {};
    for (var i in formats) {
      var format = formats[i];
      var filename = fontConfig.fileName || options.fileName || '[chunkhash]-[fontname].[ext]';
      var chunkHash = filename.indexOf('[chunkhash]') !== -1
        ? hashFiles(generatorOptions.files, options.hashLength) : '';

      filename = fontConfig.dest.concat(filename);
      filename = filename
        .replace('[chunkhash]', chunkHash)
        .replace('[fontname]', generatorOptions.fontName)
        .replace('[ext]', format);

      if (!embed) {
        var formatFilename = loaderUtils.interpolateName(this,
          filename,
          {
            context: this.rootContext || this.options.context || this.context,
            content: res[format]
          }
        );
        urls[format] = url.resolve(publicPath, formatFilename.replace(/\\/g, '/'));
        this.emitFile(formatFilename, res[format]);
      } else {
        urls[format] = 'data:' +
        mimeTypes[format] +
        ';charset=utf-8;base64,' +
        (Buffer.from(res[format]).toString('base64'));
      }
    }
    var emitCodepointsOptions = fontConfig.emitCodepoints || options.emitCodepoints || null;
    if (emitCodepointsOptions) {
      const emitCodepoints = require('./emit-codepoints');
      emitCodepoints.emitFiles(this, emitCodepointsOptions, generatorOptions, options);
    }

    cb(null, res.generateCss(urls));
  });
};
