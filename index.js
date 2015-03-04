const path = require('path');

const _ = require('lodash');
const loaderUtils = require('loader-utils');
const promise = require('bluebird');

const utils = require('./lib/utils');
const archetype = require('./lib/archetype');

const findModuleDeps = utils.findModuleDeps;
const findDepsInContext = utils.findDepsInContext;
const titleCaseFromDashed = utils.titleCaseFromDashed;

const ArchetypeArray = archetype.ArchetypeArray;
const ArchetypeMatch = archetype.ArchetypeMatch;

module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
  this.cacheable && this.cacheable();
  var done = this.async();
  var query = loaderUtils.parseQuery(this.query);
  var emberOptions = this.options[query.optionKey || 'ember'] || {};
  var archetypes = this.archetypes =
    ArchetypeArray.fromOptions(this.options, emberOptions, query);

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

  var extendCode = 'require(' +
    JSON.stringify('!!' + archetypes.extendUrl(this)) +
  ')\n';
  var targetCode = 'require(' + JSON.stringify('!!' + remainingRequest) + ')\n';

  var allDeps = [];
  var depsLookup = query.depsLookup || ['modules', 'context'];
  if (_.contains(depsLookup, 'modules')) {
    // load components from external module directories
    // TODO 0.1: Remove query.componentsDirectories
    var componentDirs = (query.componentsDirectories || [])
      // TODO 0.1: Remove concatComponentsDirectories
      .concat(emberOptions.concatComponentsDirectories || [])
      .concat(emberOptions.modulesDirectories || []);
    componentDirs = _.uniq(componentDirs);
    if (componentDirs.length === 0) {
      componentDirs = ['node_modules'];
    }
    var packageDeps = promise.resolve(componentDirs)
      .bind(this)
      .map(function(dir) {
        return findModuleDeps.call(this, lastRequestPackage, dir);
      })
      .then(function(items) {
        return _.reduce(items, function(v, items) {
          return v.concat(items);
        }, []);
      });
    allDeps.push(packageDeps);
  }
  if (_.contains(depsLookup, 'context')) {
    // look at contexts in given option
    var contextDeps = findDepsInContext
      .call(this, path.join(
        lastRequestPackage,
        query.src === undefined ? 'src' : query.src
      ));
    allDeps.push(contextDeps);
  }

  // transform components/name/index.js into NameComponent etc
  promise.all(allDeps)
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
    .then(generateObj)
    .then(function(objCode) {
      var result = targetCode;
      var lines = [];

      if (query.ignoreOverrides) {
        result = '{}';
      }

      result = extendCode + '(' + objCode + ', ' + result + ')';

      if (query.application) {
        lines.push('var content = ' + extendCode + '(' +
          'require(' +
            JSON.stringify(__dirname).replace(/"$/g, '') + '?src=.!' +
            JSON.stringify(path.resolve(__dirname, 'lib/app')).substring(1) +
          '), ' +
          result +
        ');');
        lines.push('var Application = Ember.Application.extend(content);');
        lines.push('Object.keys(content.INITIALIZERS || {})' +
          '.forEach(function(key) {' +
            'Application.initializer(content.INITIALIZERS[key]);' +
          '});');
        result = 'Application';
      }

      lines.push('module.exports = ' + result + ';');

      return lines.join('\n');
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
  return promise.resolve(keys)
    .bind(this)
    .reduce(function(code, key, index) {
      code += tab;
      if (!isArray) {
        code += JSON.stringify(key) + ': ';
      }
      return promise.resolve()
        .bind(this)
        .then(function() {
          if (obj[key] instanceof ArchetypeMatch) {
            return this.archetypes.generate(obj[key], depth + 1);
          } else if (_.isObject(obj[key])) {
            return generateObj.call(this, obj[key], depth + 1);
          } else {
            return 'require(' + JSON.stringify(obj[key]) + ')';
          }
        })
        .then(function(generated) {
          return code + generated;
        })
        .then(function(code) {
          code += !isArray || isArray && index < keys.length - 1 ? ',' : '';
          code += '\n';
          return code;
        });
    }, code)
    .then(function(code) {
      return code + outerTab + (isArray ? ']' : '}');
    });
};
