var hashFiles = require('hash-files');

module.exports = {
  hashFiles: function (files, hashLength) {
    hashLength = hashLength && +hashLength >= 8 && +hashLength <= 32 ? +hashLength : 20;
    return hashFiles.sync({files: files}).slice(0, hashLength);
  }
};
