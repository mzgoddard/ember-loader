const path = require('path');

const _ = require('lodash');
const loaderUtils = require('loader-utils');
const promise = require('bluebird');

const config = require('./lib/config');
const types = require('./lib/types');
const utils = require('./lib/utils');

const findComponentDeps = utils.findComponentDeps;
const findDepsInContext = utils.findDepsInContext;
const titleCaseFromDashed = utils.titleCaseFromDashed;

module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
  this.cacheable && this.cacheable();
  var done = this.async();
  var query = loaderUtils.parseQuery(this.query);

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

  // load package json for components
  var componentDeps = findComponentDeps.call(this, lastRequestPackage);
  // look at contexts in given option
  var contextDeps = findDepsInContext
    .call(this, path.join(
      lastRequestPackage,
      query.src === undefined ? 'src' : query.src
    ));

  var extendCode = 'require(' +
    JSON.stringify('!!' + path.join(__dirname, 'lib', 'extend.js')) +
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

      // Set file dependencies.
      deps
        .filter(function(dep) {return !dep[2] || dep[2] !== 'context';})
        .map(function(dep) {return dep[1];})
        .forEach(function(dep) {this.addDependency(dep);}, this);

      // Transform array of [key, value, depType] triplets into an object.
      return deps
        .filter(function(dep) {return !dep[2] || dep[2] === 'source';})
        .reduce(function(obj, dep) {
          console.log(dep[0], path.relative(__dirname, dep[1]));
          try {
            types.transform(obj, dep[0], dep[1]);
          } catch(e) {console.error(e);}
          return obj;
        }, {});
    })
    .catch(function(e) {console.error(e); throw e;})
    .then(function(obj) {
      var objCode = '{\n';
      _.keys(obj).forEach(function(key) {
        objCode += '\t' +
          JSON.stringify(key) + ': ' +
          'require(' + JSON.stringify(obj[key]) + '),\n';
      });
      objCode += '}';

      var result = 'module.exports =\n' +
        extendCode +
        '(' + objCode + ', ' + targetCode + ');\n';
      return result;
    })
    .then(function(v) {done(null, v);}, done);
};
