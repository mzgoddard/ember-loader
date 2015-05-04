const path = require('path');

const webpackBin = path.resolve(__dirname, 'node_modules/.bin/webpack');
const webpackConfig = ' --config test/webpack.config.js';

module.exports = {
  framework: 'mocha',
  src_files: ['test/tmp/*.js', 'test/**/*.js', '*.js', 'lib/*.js'],
  serve_files: ['test/tmp/*.js'],
  on_start: {
    command: webpackBin + ' --watch -d' + webpackConfig,
    wait_for_text: '[emitted]',
  },
  routes: {
    '/mocha': 'node_modules/mocha',
    '/bundle.js': 'test/tmp/bundle.js',
    '/index.html': 'test/index.html'
  }
};
