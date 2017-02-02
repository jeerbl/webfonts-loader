var path = require('path');
var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');

var config = require('./webpack.config.js');

var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {
  contentBase: path.resolve(__dirname),
  publicPath: '/',
  stats: {
    colors: true
  }
});

server.listen(8012);
