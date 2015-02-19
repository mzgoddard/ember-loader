const path = require('path');

const _ = require('lodash');
const loaderUtils = require('loader-utils');
const promise = require('bluebird');

const config = require('./lib/config');
const types = require('./lib/types');
const utils = require('./lib/utils');
const archetype = require('./lib/archetype');

const findComponentDeps = utils.findComponentDeps;
const findDepsInContext = utils.findDepsInContext;
const titleCaseFromDashed = utils.titleCaseFromDashed;

const ArchetypeArray = archetype.ArchetypeArray;

module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
  this.cacheable && this.cacheable();
  var done = this.async();
  var query = loaderUtils.parseQuery(this.query);
  var emberOptions = this.options.ember;
  var archetypes = ArchetypeArray.fromOptions(emberOptions, query);

  // FIXME: We need to peer at the file system to know what to load
  // inputFileSystem isn't directly exposed to us. This could break and
  // further investigation.
  this.inputFileSystem = this._compiler.inputFileSystem;
  var inputFileSystem = this.inputFileSystem;

  var lastRequestPart = _.last(remainingRequest.split('!'));
  var lastRequestPackage = path.resolve(lastRequestPart, '..');
  // TODO: We need a better way to determine the package name. It's likely that
  // we need to look up the directory hierarchy for a package.json file.
  if (path.basename(lastRequestPackage) === 'src') {
    lastRequestPackage = path.resolve(lastRequestPackage, '..');
  }

  // load components from external module directories
  var componentDirs = _.uniq(query.componentsDirectories || [])
    .concat(emberOptions && emberOptions.concatComponentsDirectories || []);
  if (componentDirs.length === 0) {
    componentDirs = ['node_modules'];
  }
  var componentDeps = promise.resolve(componentDirs)
    .bind(this)
    .map(function(dir) {
      return findComponentDeps.call(this, lastRequestPackage, dir);
    })
    .then(function(items) {
      return _.reduce(items, function(v, items) {
        return v.concat(items);
      }, []);
    });
  // look at contexts in given option
  var contextDeps = findDepsInContext
    .call(this, path.join(
      lastRequestPackage,
      query.src === undefined ? 'src' : query.src
    ));

  var extendCode = 'require(' +
    JSON.stringify('!!' + archetypes.extendUrl(this)) +
  ')\n';
  var targetCode = 'require(' + JSON.stringify('!!' + remainingRequest) + ')\n';

  // transform components/name/index.js into NameComponent etc
  promise.all([componentDeps, contextDeps])
    .bind(this)
    .reduce(function(v, deps) {return v.concat.apply(v, [deps]);}, [])
    .then(function(deps) {
      // Set context (folder) dependencies.
      deps
        .filter(function(dep) {return dep[2] && dep[2] === 'context';})
        .map(function(dep) {return dep[1];})
        .forEach(function(dep) {this.addContextDependency(dep);}, this);

      // Transform array of [key, value, depType] triplets into an object.
      return deps
        .filter(function(dep) {return !dep[2] || dep[2] === 'source';})
        .reduce(function(obj, dep) {
          return obj
            .tap(function(obj) {
              return promise.try(archetypes.store.bind(
                archetypes,
                obj,
                { name: dep[0], fullpath: dep[1] }
              ));
            });
        }, promise.resolve({}));
    })
    .catch(function(e) {console.error(e); throw e;})
    .then(function(obj) {
      var objCode = generateObj(obj);

      var result = 'module.exports =\n' +
        extendCode +
        '(' + objCode + ', ' + targetCode + ');\n';
      return result;
    })
    .then(function(v) {done(null, v);}, done);
};

var generateObj = function(obj, depth) {
  depth = depth || 0;
  var outerTab = _.times(depth).map(function() {return '\t';}).join('');
  var tab = _.times(depth + 1).map(function() {return '\t';}).join('');
  var isArray = Array.isArray(obj);

  var code = isArray ? '[\n' : '{\n';
  var keys = _.keys(obj);
  keys.forEach(function(key, index) {
    code += tab;
    if (!isArray) {
      code += JSON.stringify(key) + ': ';
    }
    if (_.isObject(obj[key])) {
      code += generateObj(obj[key], depth + 1);
    } else {
      code += 'require(' + JSON.stringify(obj[key]) + ')';
    }
    code += !isArray || isArray && index < keys.length - 1 ? ',' : '';
    code += '\n';
  });
  code += outerTab + (isArray ? ']' : '}');
  return code;
};
