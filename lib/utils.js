const path = require('path');

const _ = require('lodash');
const promise = require('bluebird');

const config = require('./config');

const packageJsonComponentFilter = config.packageJsonComponentFilter;
const typeNames = config.typeNames;

exports.findComponentDeps = function(request, packageJsonPath) {
  packageJsonPath = packageJsonPath || path.join(request, 'package.json');
  var readFile = promise
    .promisify(this.inputFileSystem.readFile, this.inputFileSystem);
  var resolve = promise.promisify(this.resolve, this);

  return readFile(packageJsonPath)
    .bind(this)
    .then(JSON.parse)
    .then(function(pkg) {
      return _.pairs(pkg.dependencies || {});
    })
    .filter(function(dep) {return packageJsonComponentFilter.test(dep[0]);})
    .reduce(function(v, dep) {
      var resolvedDep;
      return promise
        .all([
          resolve(request, dep[0]),
          resolve(request, path.join(dep[0], 'package.json'))
        ])
        .tap(function(_resolved) {
          resolvedDep = _resolved[0];
        })
        .bind(this)
        .spread(exports.findComponentDeps)
        .then(function(deps) {
          return v.concat([[dep[0], resolvedDep]]).concat(deps);
        });
    }, [])
    .then(function(result) {
      return result.concat([[request, packageJsonPath, 'file']]);
    })
    .catch(function(e) {
      if (
        e.code === 'ENOENT' ||
        (e.cause && e.cause.code === 'ENOENT') ||
        e.message.search('ENOENT')
      ) {
        return [[request, request, 'context']];
      } else {
        throw e;
      }
    });
};

exports.findDepsInContext = function(request) {
  var readFile = promise
    .promisify(this.inputFileSystem.readFile, this.inputFileSystem);
  var stat = promise
    .promisify(this.inputFileSystem.stat, this.inputFileSystem);
  var readdir = promise
    .promisify(this.inputFileSystem.readdir, this.inputFileSystem);
  var resolve = promise.promisify(this.resolve, this);

  return readdir(request)
    .bind(this)
    .filter(function(name) {return _.contains(typeNames, name);})
    .map(function(name) {return path.join(request, name);})
    .map(function(fullpath) {
      return promise.all([fullpath, readdir(fullpath)]);
    })
    .reduce(function(v, items) {return v.concat(items[1].map(function(item) {
      return [items[0], item];
    })).concat([[items[0], items[0], 'context']]);}, [])
    .map(function(item) {
      return promise
        .all([
          path.join(path.basename(item[0]), path.basename(item[1], '.js')),
          path.resolve(item[0], item[1]),
          item[2]
        ])
        .bind(this)
        .catch(function(e) {
          this.emitError(e);
        });
    })
    .filter(function(item) {return item !== undefined;})
    .then(function(result) {
      return result.concat([[request, request, 'context']]);
    })
    .catch(function(e) {
      if (
        e.code === 'ENOENT' ||
        (e.cause && e.cause.code === 'ENOENT') ||
        e.message.search('ENOENT')
      ) {
        return [['', path.join(request, '..'), 'context']];
      } else {
        throw e;
      }
    });
};

exports.titleCaseFromDashed = function(str) {
  return (
    str[0].toUpperCase() +
    str.substring(1).replace(/\-(.)/g, function(str) {
      return str[1].toUpperCase();
    })
  );
};
