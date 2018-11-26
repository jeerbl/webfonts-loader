# webfonts-loader

[![npm](https://img.shields.io/npm/v/webfonts-loader.svg?style=flat-square)](https://www.npmjs.com/package/webfonts-loader)
[![npm](https://img.shields.io/npm/dm/webfonts-loader.svg?style=flat-square)](https://www.npmjs.com/package/webfonts-loader)
[![Travis](https://img.shields.io/travis/jeerbl/webfonts-loader.svg?style=flat-square)](https://travis-ci.org/jeerbl/webfonts-loader)
[![license](https://img.shields.io/github/license/jeerbl/webfonts-loader.svg?style=flat-square)](https://github.com/jeerbl/webfonts-loader/blob/master/LICENSE)

A Webpack loader that generates fonts from your SVG icons and allows you to use your icons in your HTML.

`webfonts-loader` uses the [`webfonts-generator`](https://github.com/sunflowerdeath/webfonts-generator) plugin to create fonts in any format. It also generates CSS files so that you can use your icons directly in your HTML, using CSS classes.

## Installation

```
npm install webfonts-loader
```

## Usage

An example of usage can be found in the `test/` directory of this repository.

### Webpack rule

Add this rule to your Webpack config:

```javascript
{
  test: /\.font\.js/,
  use: [
    MiniCssExtractPlugin.loader,
    'css-loader',
    'webfonts-loader'
  ]
}
```

So that each font configuration file will be loaded using this rule.

#### Loader options

You can provide `options` objects to configure the loader behaviour:

```javascript
{
  test: /\.font\.js/,
  use: [
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: 'webfonts-loader',
      options: { ... }
    }
  ]
}
```

Available options are:

##### `publicPath`, String

This is the URL prefix for generated links (e.g. `/static/` or `https://cdn.project.net/`). Should typically match Webpack's `config.output.publicPath`.

##### Any font config option

If you pass `types`, `fileName` or any other font config option, it will be used as a default (unless overriden in font config file).

### The font configuration file

#### Description

The config file allows you to specify parameters for the loader to use. Here is an example configuration file:

```javascript
// myfont.font.js
module.exports = {
  'files': [
    './myfont/*.svg'
  ],
  'fontName': 'myfonticons',
  'classPrefix': 'myfonticon-',
  'baseSelector': '.myfonticon',
  'types': ['eot', 'woff', 'woff2', 'ttf', 'svg'],
  'fileName': 'app.[fontname].[hash].[ext]'
};
```

Then you have to require the configuration file:

```javascript
// entry.js
require('./myfont.font');
```

The loader will then generate:

* CSS with the base and class prefix
* Font files for the SVG icons

#### All font configuration options

##### `baseSelector`, String

The base CSS selector, under which each icon class is to be created.
See [webfonts-generator#templateoptions](https://github.com/sunflowerdeath/webfonts-generator#templateoptions)

##### `classPrefix`, String

The prefix to be used with each icon class.
See [webfonts-generator#templateoptions](https://github.com/sunflowerdeath/webfonts-generator#templateoptions)

##### `cssTemplate`, String

See [webfonts-generator#csstemplate](https://github.com/sunflowerdeath/webfonts-generator#csstemplate)

##### `embed`, Boolean

If true the font is encoded in base64 and embedded inside the `@font-face` declaration, otherwise font files are written to disk.
Default: `false`

##### `hashLength`, Number

Optional. The length of hash in `fileName`.
Min: 8
Max: 32
Default: 20

##### `fileName`, String

The generated font file names. These elements can be used:

* `[fontname]`: the value of the `fontName` parameter
* `[ext]`: the extension of the font file being generated (`eot`, ...)
* `[hash]`: the hash of the current compilation
* `[chunkhash]`: the hash of the SVG files

This option can be also configured globally in the webpack loader options.

##### `emitCodepoints`, Array (with shorthand versions of Boolean, String and Object)

Optional. The generated codepoints file names.

Examples:

* `emitCodepoints: true`: emits a javascript file named `[fontname].codepoints.js` in the `web` (default) format
* `emitCodepoints: '[fontname].codepoints.fonts.js'`: emits a javascript file named `[fontname].codepoints.fonts.js` in the `commonjs` format
* `emitCodepoints: { fileName: '[fontname].codepoints.json', type: 'json'] }`: emits a file named `[fontname].codepoints.json` in the `json` format
* `emitCodepoints: [{ fileName: '[fontname].codepoints.json', type: 'json'] }, { fileName: '[fontname].codepoints.js', type: 'web'] }, { fileName: '[fontname].codepoints.inc.js', type: 'web'] }]`: emits three files with their respective names and types

These are the existing formats:

* `web`: (default): generates a file containing the array of codepoints in a format suitable for inclusion in html pages.

Example (for a font named myfonticons):
```javascript
if (typeof webfontIconCodepoints === 'undefined') {
  webfontIconCodepoints = {};
}
webfontIconCodepoints["myfonticons"] = {"alert":61697,"arrow-down":61698,"arrow-left":61699};
```

* `commonjs`: generates a file containing the array of codepoints in the commonjs format, for use with `require`.
```javascript
module.exports = {"alert":61697,"arrow-down":61698,"arrow-left":61699}
```

* `json`: generates a file containing the array of codepoints in the JSON format.
```javascript
{"alert":61697,"arrow-down":61698,"arrow-left":61699,"arrow-right":61700,"arrow-small-down":61701}
```

These elements can be used in the filename:

* `[fontname]`: the value of the `fontName` parameter
* `[chunkhash]`: the hash of the SVG files

This option can be also configured globally in the webpack loader options.

##### `files`, Array

See [webfonts-generator#files](https://github.com/sunflowerdeath/webfonts-generator#files)

##### `fontName`, String

See [webfonts-generator#fontname](https://github.com/sunflowerdeath/webfonts-generator#fontname)

##### `formatOptions`, Object

See [webfonts-generator#formatoptions](https://github.com/sunflowerdeath/webfonts-generator#formatoptions)

##### `rename`, Function

See [webfonts-generator#rename](https://github.com/sunflowerdeath/webfonts-generator#rename)

##### `types`, Array<String>

See [webfonts-generator#types](https://github.com/sunflowerdeath/webfonts-generator#types)
