var glob = require('glob').sync;

module.exports = {
  fontName: 'Octicons',
  files: glob('./octicons/svg/*.svg'),
  baseClass: 'octicon',
  classPrefix: 'octicon-'
};
