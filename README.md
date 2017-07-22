# webfonts-loader
[![npm](https://img.shields.io/npm/v/webfonts-loader.svg?style=flat-square)](https://www.npmjs.com/package/webfonts-loader)
[![Travis](https://img.shields.io/travis/jeerbl/webfonts-loader.svg?style=flat-square)](https://travis-ci.org/jeerbl/webfonts-loader)
[![license](https://img.shields.io/github/license/jeerbl/webfonts-loader.svg?style=flat-square)](https://github.com/jeerbl/webfonts-loader/blob/master/LICENSE)

A loader that generates fonts from your SVG icons and allows you to use your icons in your HTML.

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
  loader: ExtractTextPlugin.extract({
    use: [
      'style-loader',
      'css-loader',
      'webfonts-loader'
    ]
  })
}
```
So that each font configuration file will be loaded using this rule.

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
* CSS with the base and class prefix.
* Font files for the SVG icons.

And there you are - your webfont is done. Now, here is one thing: You can use JavaScript too. A useful thing is, that there are two additional options that I did not mention:

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
