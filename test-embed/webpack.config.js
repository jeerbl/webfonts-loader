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
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.font\.json/,
        type: 'javascript/auto',
        use: [
          'style-loader',
          'css-loader',
          require.resolve('../') // Replace this line with require('webfonts-loader')
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
