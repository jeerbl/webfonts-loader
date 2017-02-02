var path = require('path');
module.exports = {
  context: path.resolve(__dirname),
  entry: './entry.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'build')
  },
  module: {
    loaders: [
      {
        test: /\.font\.(js|json)$/,
        loader: 'style!css!' + require.resolve('../')
      }, {
        test: /\.(woff|eot|ttf|svg)$/,
        loader: 'url'
      }
    ]
  }
};
