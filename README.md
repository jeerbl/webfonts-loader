### __This repository has been dumped from [DragonsInn/fontgen-loader](https://github.com/DragonsInn/fontgen-loader) since it wasn't updated since March 2016.__


# `webfonts-loader` - Bam, easy webfonts!

[![js-semistandard-style](https://cdn.rawgit.com/flet/semistandard/master/badge.svg)](https://github.com/Flet/semistandard)

[![npm](https://img.shields.io/npm/v/webfonts-loader.svg?style=flat-square)](https://www.npmjs.com/package/webfonts-loader)
[![Travis](https://img.shields.io/travis/jeerbl/webfonts-loader.svg?style=flat-square)](https://travis-ci.org/jeerbl/webfonts-loader)

Have you faced this? You have 4 icons from FontAwesome, and 19 from Glyphicons, and maybe you are eying at another webfont's icons and wishing to use them?

What a mess! Okay okay, so what do we do? We make our own. And how? ...good question. In fact, this question comes up just so often... So I decided to write a little thing to help out.

## How `webfonts-loader` works.
There is a tool that lets us generate fonts automaticaly by a configuration. The font is created by putting several SVG icons together and generating the proper file(s). That includes:

- A font file for WOF, EOT, TTF and WOFF2. Also SVG, if you want. But there is a trend of removal within browsers - you can see more on [caniuse](http://caniuse.com).
- A CSS has your font configured. That means, it's a proper `@font-face` declaration inclusive icon classes.
- If you want, a HTML demo page.

In order to use this loader, you need to be aware that this is a "trigger loader". That means, it can not just be added to your `webpack.config.js` like any other loader, you need to be aware of what it does in the long run.

## configuration

```javascript
module.exports = {
  resolve: {
    loaders: [
      {
        test: /\.font\.(js|json)$/,
        loader: "style!css!webfonts"
      }
    ]
  }
}
```

This loader returns CSS. Therefore, you have to pipe it through the proper loaders. You should be able to use this with the `extract-text-plugin` as well.

However, there are more configurations. you could also specify a custom template to use, to return different kinds of source. A LESS or SCSS version, for instance? Up to you.

## Usage

Now that we have the loader configured, it's about time we give this a go. First, you want to load your font like so, within your entry code:

```javascript
// main.js
require("./Awesomecons.font"); // .js or .json does not matter if you used the config above.
```

Now, the loader will load in the font from the given configuration, and the CSS is added to your webpack project, properly rendered and prepared. Now, this is what a configuration should look like. The following is an example, and I am using JSON here, since I know that my code is more static, but you may have a varying requirement, which is why JS will be allowed. Make sure the configuration ends up being the contents of `module.exports`.

Example:

module style
```javascript
module.exports = {
  "files": [
    "icon/my.svg",
    "icon/awesome.svg",
    "icon/stuff.svg",
    "icon/special/*.svg" // glob style
  ],
  "fontName": "Awesomecons",
  "classPrefix": "ai-",
  "baseClass": "ai",
  "fixedWidth": true,
  "types": ["eot", "woff", "ttf", "svg"] // this is the default
}
```

or .json (content should be an object)
```json
{
  "files": []
}
```



Now, the loader will pick up this config, pull it through the generator and:

- Generate CSS with the base and class prefix.
- Font files for the three SVG icons.

And there you are - your webfont is done. Now, here is one thing: You can use JavaScript too. A useful thing is, that there are two additional options that I did not mention:

In addition, you also have these options:

- `.rename`: This should be a function that returns the icon's name based on the input (filename).
- `.log`: You can log stuff here.
- `.formatOptions`: An object containing options to their specific transformers. See [this PR](https://github.com/sunflowerdeath/webfonts-generator/pull/6) and [this README entry](https://github.com/sunflowerdeath/webfonts-generator#formatoptions) to learn more.

You also can use a module like `glob` to pick up a variable set of icons, too. Mix and match and mind the various licenses - and make your own webfont!


# Configuration
## Loader parameters

- `embed`, Boolean
Should the fonts be embedded in the CSS? By default the fonts are written to disk. If `embed` is specified the font is base64 encoded and embedded inside the `@font-face` declaration. Example configuration: `loader: "style!css!webfonts?embed&types=woff"`.

## Font configuration (`*.font.js` or `*.font.json`)

- `baseClass`, String
The base class, under which each icon class is to be crated.

- `classPrefix`, String
The prefix to be used with each icon class.

- `cssTemplate`, String
Which template to use? By default, a CSS one is used. The template is to be processed by Handlebars. See [webfonts-generator](https://github.com/sunflowerdeath/webfonts-generator)'s README itself for more info.

- `files`, Array
An array of SVG icon files. Supports glob

- `fontName`, String
Name of your font.

- `types`, Array
Possible values are: `["svg", "eot", "wof", "ttf"]`.

For additional options, see the [webfonts-generator](https://github.com/sunflowerdeath/webfonts-generator)'s README file.

### Special configuration
There is one special configuration optin that exists in both, the actual font configuration and as a query parameter: `fileName`. This one decides the output of the font filenames. You can create a filename template with these elements (will likely become more in the future):

- `[fontname]`: The name of the font. I.e. "Awesomefont".
- `[ext]`: The extension. I.e.: `.woff`.
- `[hash]`: The hash of your current compilation.
