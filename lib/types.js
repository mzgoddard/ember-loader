const path = require('path');

const _ = require('lodash');

const config = require('./config');
const utils = require('./utils');

const titleCaseFromDashed = utils.titleCaseFromDashed;

const moduleRegex = /-module-(.*)/;
const componentRegex = /-component-(.*)/;

const typeOrder = [
  'external-components',
  'models',
  'templates',
  'init',
  'internal-components',
  'controllers',
  'routes',
  'views'
];

const typeNames = config.typeNames;

var types = module.exports = {
  _order: typeOrder,
  names: typeNames,
  _contextNames: typeNames,

  'external-components': transformExternalComponent,
  'internal-components': transformCommon,
  controllers: transformCommon,
  'init': transformCommon,
  models: transformModel,
  routes: transformCommon,
  templates: transformTemplate,
  views: transformCommon,

  transform: transform
};

function transform(module, name, fullpath, options) {
  return _.any(typeOrder, function(key) {
    return types[key](module, name, fullpath, options);
  });
}

function transformExternalComponent(module, name, fullpath, options) {
  var match = componentRegex.exec(name);
  if (match) {
    // eg ChildComponent
    var casedName = titleCaseFromDashed(match[1]) + 'Component';
    module[casedName] = fullpath;
    return module;
  }
}

function transformModel(module, name, fullpath, options) {
  if (/models\/[^\/]*$/.test(fullpath)) {
    var casedName = options.ModulePrefixTitleCased +
      titleCaseFromDashed(fullpath);
    module[casedName] = fullpath;
    return module;
  }
}

function transformTemplate(module, name, fullpath, options) {
  if (/templates\/[^\/]*$/.test(fullpath)) {
    var templatePathName =
      path.basename(/templates\/(.*)$/.exec(fullpath)[1], '.hbs');
    module.TEMPLATES = module.TEMPLATES || {};
    module.TEMPLATES[templatePathName] = fullpath;
    return module;
  }
}

function transformCommon(module, name, fullpath, options) {
  var dirname = path.basename(path.dirname(fullpath));
  var casedName =
    titleCaseFromDashed(_.last(name.split('/'))) +
    titleCaseFromDashed(dirname.substring(0, dirname.length - 1));
  module[casedName] = fullpath;
  return module;
}
