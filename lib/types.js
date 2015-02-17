const path = require('path');

const _ = require('lodash');

const config = require('./config');
const utils = require('./utils');

const titleCaseFromDashed = utils.titleCaseFromDashed;
const titleCaseFromPath = utils.titleCaseFromPath;

const moduleRegex = /-module-(.*)/;
const componentRegex = /-component-(.*)/;

const typeOrder = [
  'external-components',
  'internal-components',
  'models',
  'templates',
  'init',
  'router',
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
  'init': transformInitializer,
  models: transformModel,
  router: transformRouter,
  routes: transformCommon,
  templates: transformTemplate,
  views: transformCommon,

  transform: transform
};

function transform(module, name, fullpath, options) {
  // Normalize to *nix paths.
  name = name.replace(/\\/g, '/');
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
  var match = /(.*)\/model$/.exec(name);
  if (!match) {
    match = /models\/(.*)$/.exec(name);
  }

  if (match) {
    module[titleCaseFromPath(match[1])] = fullpath;
    return module;
  }
}

function transformTemplate(module, name, fullpath, options) {
  var match = /^templates\/((?:[^/]*\/)*(?:[^/]*))\.hbs$/.exec(name);
  var templatePathName;
  if (match) {
    templatePathName = match[1];
  }
  match = /(.*)[-_/]template.hbs$/.exec(name);
  if (match) {
    templatePathName = match[1];
  }

  if (templatePathName) {
    module.TEMPLATES = module.TEMPLATES || {};
    module.TEMPLATES[templatePathName] = fullpath;
    return module;
  }
}

function transformInitializer(module, name, fullpath, options) {
  var match = /^init\/(.*)$/.exec(name);
  if (match) {
    module.INITIALIZERS = module.INITIALIZERS || {};
    module.INITIALIZERS[match[1]] = fullpath;
    return module;
  }
}

function transformRouter(module, name, fullpath, options) {
  var match = /^router$/.exec(name);
  if (match) {
    module.ROUTING = fullpath;
    return module;
  }
}

function transformCommon(module, name, fullpath, options) {
  var match = /^(.*)[-_/]([^/]*)$/.exec(name);
  var dirname, basename;
  if (match && _.contains(config.podSuffixes, match[2])) {
    dirname = match[2];
    basename = match[1];
  } else {
    match = /^([^/]*)\/(.*)$/.exec(name);
    dirname = match[1];
    dirname = dirname.substring(0, dirname.length - 1);
    basename = match[2];
  }
  var casedName = titleCaseFromPath(basename) + titleCaseFromPath(dirname);
  module[casedName] = fullpath;
  return module;
}
