var test = require('ava');
var glob = require('glob').sync;
var hashFiles = require('../utils').hashFiles;

test('check consistency of files hash without hash length option', function (t) {
  var files = glob('./test/test-svg/*.svg');
  var expected = 'da39a3ee5e6b4b0d3255';

  t.is(hashFiles(files), expected);
});

test('check consistency of files hash with min hash length option', function (t) {
  var files = glob('./test/test-svg/*.svg');
  var expected = 'da39a3ee';
  var minHashLength = 8;

  t.is(hashFiles(files, minHashLength), expected);
});

test('check consistency of files hash with max hash length option', function (t) {
  var files = glob('./test/test-svg/*.svg');
  var expected = 'da39a3ee5e6b4b0d3255bfef95601890';
  var maxHashLength = 32;

  t.is(hashFiles(files, maxHashLength), expected);
});
