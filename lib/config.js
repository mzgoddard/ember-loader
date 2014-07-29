const _ = require('lodash');

exports.moduleRegex = /-module-(.*)/;
exports.packageJsonComponentFilter = /.*-component-(.*)/;
exports.typeNames = [
  'components',
  'controllers',
  'init',
  'models',
  'router.js',
  'routes',
  'templates',
  'views'
];
