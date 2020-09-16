var crypto = require('crypto');
var fs = require('fs');

module.exports = {
  hashFiles: function (files, hashLength) {
    // FIXME: For compatibility with the hash-files package, this
    // function just sorts by filename and hashes the concatenation of
    // the file contents. This algorithm will not detect certain
    // changes where files are renamed or chunks are moved across
    // file boundaries (https://github.com/mac-/hash-files/issues/4).

    hashLength = hashLength && +hashLength >= 8 && +hashLength <= 32 ? +hashLength : 20;
    var hash = crypto.createHash('sha1');
    Array.from(new Set(files)).sort().forEach(function (file) {
      hash.update(fs.readFileSync(file));
    });
    return hash.digest('hex').slice(0, hashLength);
  }
};
