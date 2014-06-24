const _ = require('lodash');

exports.moduleRegex = /-module-(.*)/;
exports.packageJsonComponentFilter = /.*-component-(.*)/;
exports.typeNames = [
  'components',
  'controllers',
  'init',
  'models',
  'routes',
  'templates',
  'views'
];
