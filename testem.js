const foreverBin = 'node_modules/.bin/forever';
const webpackBin = __dirname + '/node_modules/.bin/webpack';

module.exports = {
  framework: 'mocha',
  src_files: ['test/tmp/*.js'],
  serve_files: ['test/tmp/*.js'],
  on_start:
    foreverBin + ' stop ' + webpackBin + ';\n' +
    webpackBin + ' --config test/webpack.config.js -d;\n' +
    foreverBin + ' start -c node ' + webpackBin +
    ' --watch --config test/webpack.config.js -d',
  on_exit:
    'node_modules/.bin/forever stop ' + __dirname +
    '/node_modules/.bin/webpack',
  routes: {
    '/mocha': 'node_modules/mocha',
    '/bundle.js': 'test/tmp/bundle.js',
    '/index.html': 'test/index.html'
  }
};
