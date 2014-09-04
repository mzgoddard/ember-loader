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

exports.podSuffixes = [
  'controller',
  'model',
  'template.hbs',
  'view',
  'route',
  'router'
];
