const path = require('path');

const foreverBin = 'node_modules/.bin/forever';
const webpackBin = path.resolve(__dirname, 'node_modules/.bin/webpack');
const webpackConfig = ' --config test/webpack.config.js';

module.exports = {
  framework: 'mocha',
  src_files: ['test/tmp/*.js', 'test/**/*.js', '*.js', 'lib/*.js'],
  serve_files: ['test/tmp/*.js'],
  on_start:
    foreverBin + ' stop ' + webpackBin + ';\n' +
    webpackBin + webpackConfig + ' -d;\n' +
    foreverBin + ' start -c node ' + webpackBin + ' --watch -d' + webpackConfig,
  on_exit:
    foreverBin + ' stop ' + webpackBin,
  routes: {
    '/mocha': 'node_modules/mocha',
    '/bundle.js': 'test/tmp/bundle.js',
    '/index.html': 'test/index.html'
  }
};

if (process.platform === 'win32') {
  // forever doesn't currently seem to be able to work on windows due to path
  // issues and other things. For now windows will have to live with a larger
  // cycle for live development with testing. A benefit to this will be live of
  // the loader code and not just the test code.
  module.exports.on_start = '';
  module.exports.on_exit = '';
  module.exports.before_tests = webpackBin + webpackConfig + ' -d';
}
