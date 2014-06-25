const path = require('path');

const _ = require('lodash');

const config = require('./config');
const utils = require('./utils');

const titleCaseFromDashed = utils.titleCaseFromDashed;

const moduleRegex = /-module-(.*)/;
const componentRegex = /-component-(.*)/;

const typeOrder = [
  'external-components',
  'internal-components',
  'models',
  'templates',
  'init',
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
  'internal-components': transformInternalComponent,
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

function transformInternalComponent(module, name, fullpath, options) {
  var match = /^components\/((?:[^/]*\/)*(?:[^/]*))\/index$/.exec(name);
  if (match) {
    var casedName = titleCaseFromDashed(match[1]) + 'Component';
    module[casedName] = fullpath;
    return module;
  } else if (/^components\//.test(name)) {
    // It's any other file in a component. Leave it to the component to best
    // expose it.
    return module;
  }
}

function transformModel(module, name, fullpath, options) {
  if (/^models\/[^\/]*$/.test(fullpath)) {
    var casedName = options.ModulePrefixTitleCased +
      titleCaseFromDashed(fullpath);
    module[casedName] = fullpath;
    return module;
  }
}

function transformTemplate(module, name, fullpath, options) {
  var match = /^templates\/((?:[^/]*\/)*(?:[^/]*))\.hbs$/.exec(name);
  if (match) {
    var templatePathName = match[1];
    module.TEMPLATES = module.TEMPLATES || {};
    module.TEMPLATES[templatePathName] = fullpath;
    return module;
  }
}

function transformCommon(module, name, fullpath, options) {
  var match = /^([^/]*)\/(.*)$/.exec(name);
  var dirname = match[1];
  var basename = match[2];
  var casedName =
    titleCaseFromDashed(basename) +
    titleCaseFromDashed(dirname.substring(0, dirname.length - 1));
  module[casedName] = fullpath;
  return module;
}
