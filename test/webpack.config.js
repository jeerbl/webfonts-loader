const path = require('path');

module.exports = {
  entry: [
    './entry.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.font\.js/,
        use: [
          'style-loader',
          'css-loader',
          require.resolve('../')
        ]
      }
    ]
  },
  devServer: {
    compress: true,
    historyApiFallback: true,
    host: 'localhost',
    hot: true,
    https: true,
    inline: true,
    port: '8080'
  }
};
