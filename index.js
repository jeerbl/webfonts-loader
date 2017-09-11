var loaderUtils = require('loader-utils');
var webfontsGenerator = require('webfonts-generator');
var path = require('path');
var glob = require('glob');
var isUrl = require('is-url');
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
    var globOptions = {cwd: context};

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
  var params = loaderUtils.getOptions(this) || {};
  var config;
  try {
    config = JSON.parse(content);
  } catch (ex) {
    config = this.exec(content, this.resourcePath);
  }

  var filesAndDeps = getFilesAndDeps(config.files, this.context);
  filesAndDeps.dependencies.files.forEach(this.addDependency.bind(this));
  filesAndDeps.dependencies.directories.forEach(this.addContextDependency.bind(this));
  config.files = filesAndDeps.files;

  // With everything set up, let's make an ACTUAL config.
  var formats = config.types || ['eot', 'woff', 'woff2', 'ttf', 'svg'];
  if (formats.constructor !== Array) {
    formats = [formats];
  }

  var generatorConfiguration = {
    files: config.files,
    fontName: config.fontName,
    types: formats,
    order: formats,
    fontHeight: config.fontHeight || 1000, // Fixes conversion issues with small svgs,
    codepoints: config.codepoints || {},
    templateOptions: {
      baseSelector: config.baseSelector || '.icon',
      classPrefix: 'classPrefix' in config ? config.classPrefix : 'icon-'
    },
    dest: '',
    writeFiles: false,
    embed: config.embed || false,
    formatOptions: config.formatOptions || {}
  };

  // Try to get additional options from webpack query string or font config file
  Object.assign(generatorConfiguration, wpGetOptions(this));
  Object.assign(generatorConfiguration, config);

  // This originally was in the object notation itself.
  // Unfortunately that actually broke my editor's syntax-highlighting...
  // ... what a shame.
  if (typeof config.rename === 'function') {
    generatorConfiguration.rename = config.rename;
  } else {
    generatorConfiguration.rename = function (f) {
      return path.basename(f, '.svg');
    };
  }

  if (config.cssTemplate) {
    generatorConfiguration.cssTemplate = path.resolve(this.context, config.cssTemplate);
  }

  if (config.cssFontsPath) {
    generatorConfiguration.cssFontsPath = path.resolve(this.context, config.cssFontsPath);
  }

  for (var option in config.templateOptions) {
    if (config.templateOptions.hasOwnProperty(option)) {
      generatorConfiguration.templateOptions[option] = config.templateOptions[option];
    }
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
    if (typeof config[keys[x]] !== 'undefined') {
      generatorConfiguration[keys[x]] = config[keys[x]];
    }
  }

  var cb = this.async();

  // Generate destination path for font files, dest option from options takes precedence
  var opts = this.options || {};

  var pub = (
    generatorConfiguration.dest || (opts.output && opts.output.publicPath) || '/'
  );

  var embed = !!generatorConfiguration.embed;

  if (generatorConfiguration.cssTemplate) {
    this.addDependency(generatorConfiguration.cssTemplate);
  }

  if (generatorConfiguration.cssFontsPath) {
    this.addDependency(generatorConfiguration.cssFontsPath);
  }

  webfontsGenerator(generatorConfiguration, (err, res) => {
    if (err) {
      return cb(err);
    }
    var urls = {};

    for (var i in formats) {
      var format = formats[i],
          filename = config.fileName || params.fileName || '[chunkhash]-[fontname].[ext]',

          chunkHash = filename.indexOf('[chunkhash]') !== -1 ?
            hashFiles(generatorConfiguration.files, params.hashLength) : '';

      filename = filename
                  .replace('[chunkhash]', chunkHash)
                  .replace('[fontname]', generatorConfiguration.fontName)
                  .replace('[ext]', format);

      var formatUrl = loaderUtils.interpolateName(this,
        filename,
        {
          context: this.options.context || this.context,
          content: res[format]
        }
      );

      if (generatorConfiguration.dest) {
        this.emitFile(urls[format], res[format]);
      } else {
        this.emitFile(formatUrl, res[format]);
      }

      if (!embed) {

        if (isUrl(pub)) {
          urls[format] = url.resolve(pub, formatUrl);
        } else {
          urls[format] = path.join(pub, formatUrl);
        }
        urls[format] = urls[format].replace(/\\/g, '/');

      } else {

        urls[format] = 'data:' +
        mimeTypes[format] +
        ';charset=utf-8;base64,' +
        (Buffer.from(res[format]).toString('base64'));

      }

    }

    cb(null, res.generateCss(urls));
  });
};
