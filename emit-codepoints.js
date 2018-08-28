var loaderUtils = require('loader-utils');
module.exports = {
  createArrayCodepointFiles(codepointFiles, elem) {
    const default_elem = { fileName: '[fontname].codepoints.js', type: 'web' };
    if (typeof(elem) === 'boolean') {
      codepointFiles.push(Object.assign({}, default_elem));
    }
		else if (typeof(elem) === 'string') {
      codepointFiles.push(Object.assign({}, default_elem, { fileName: elem }));
    }
    else if (Array.isArray(elem)) {
      elem.forEach(e => this.createArrayCodepointFiles(codepointFiles, e));
    }
    else if (typeof(elem) === 'object') {
      codepointFiles.push(Object.assign({}, default_elem, elem));
    }
  },
  emitFiles(loaderContext, emitCodepointsOptions, generatorOptions) {
    var codepointFiles = [];
    this.createArrayCodepointFiles(codepointFiles, emitCodepointsOptions);
    codepointFiles.forEach(emitOption => {
      var codepointsContent = JSON.stringify(generatorOptions.codepoints);
      switch (emitOption.type) {
        case 'commonjs': {
          codepointsContent = 'module.exports = ' + codepointsContent + ";";
          break;
        }
        case 'web': {
          codepointsContent = [
            'if (typeof webfontIconCodepoints === \'undefined\') {',
            '  webfontIconCodepoints = {};',
            '}',
            'webfontIconCodepoints[' + JSON.stringify(generatorOptions.fontName) + '] = ' + codepointsContent + ';'
          ].join('\n');
          break;
        }
        case 'json': {
          break;
        }
      }
      var codepointsFilename = emitOption.fileName;
      var chunkHash = codepointsFilename.indexOf('[chunkhash]') !== -1
            ? hashFiles(generatorOptions.files, options.hashLength) : '';
      codepointsFilename = codepointsFilename
                  .replace('[chunkhash]', chunkHash)
                  .replace('[fontname]', generatorOptions.fontName);
      codepointsFilename = loaderUtils.interpolateName(loaderContext,
        codepointsFilename,
        {
          context: loaderContext.rootContext || loaderContext.options.context || loaderContext.context,
          content: codepointsContent
        }
      );
      loaderContext.emitFile(codepointsFilename, codepointsContent);
    })
  }
};
