const path = require('path');

const _ = require('lodash');
const promise = require('bluebird');

const config = require('./config');

const packageJsonComponentFilter = config.packageJsonComponentFilter;
const typeNames = config.typeNames;

exports.findComponentDeps = function(request, subdir) {
  var readFile = promise
    .promisify(this.inputFileSystem.readFile, this.inputFileSystem);
  var stat = promise
    .promisify(this.inputFileSystem.stat, this.inputFileSystem);
  var readdir = promise
    .promisify(this.inputFileSystem.readdir, this.inputFileSystem);
  var resolve = promise.promisify(this.resolve, this);

  return readdir(path.resolve(request, subdir))
    .bind(this)
    .map(function(name) {return [name];})
    .filter(function(dep) {return packageJsonComponentFilter.test(dep[0]);})
    .reduce(function(v, dep) {
      return promise.resolve([path.resolve(request, subdir, dep[0]), subdir])
        .bind(this)
        .spread(exports.findComponentDeps)
        .then(function(deps) {
          return v
            .concat([[dep[0], path.resolve(request, subdir, dep[0])]])
            .concat(deps);
        });
    }, [])
    .then(function(result) {
      var combinedPath = path.resolve(request, subdir);
      return result.concat([
        [request, request, 'context'],
        [combinedPath, combinedPath, 'context']
      ]);
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
    .map(function(name) {
      return walk(stat, readdir, path.join(request, name));
    })
    .reduce(function(v, items) {
      return v.concat(items);
    }, [])
    .reduce(function(v, items) {
      return v
        .concat(items[1].map(function(item) {
          return [items[0], item];
        }))
        .concat([[items[0], items[0], 'context']]);
    }, [])
    .map(function(item) {
      return promise
        .all([
          path.relative(
            request, path.join(item[0], path.basename(item[1], '.js'))
          ),
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

var titleCaseFromDashed = exports.titleCaseFromDashed = function(str) {
  str = str[0].toUpperCase() + str.substring(1);
  return str.replace(/\-(.)/g, function(str) {
    return str[1].toUpperCase();
  });
};

var titleCaseFromSlashed = exports.titleCaseFromSlashed = function(str) {
  str = str[0].toUpperCase() + str.substring(1);
  return str.replace(/[\/\\](.)/g, function(str) {
    return str[1].toUpperCase();
  });
};

exports.titleCaseFromPath = function(str) {
  return titleCaseFromSlashed(titleCaseFromDashed(str));
};

var walk = function(stat, readdir, request) {
  return readdir(request)
    .map(function(name) {
      var fullpath = path.join(request, name);
      return promise.props({
        name: name,
        path: fullpath,
        stat: stat(fullpath)
      });
    })
    .map(function(item) {
      if (item.stat.isDirectory()) {
        return walk(stat, readdir, item.path)
          .reduce(function(v, items) {
            return v.concat(items);
          }, []);
      }
      return [request, [item.name]];
    })
    .then(function(items) {
      return items.concat([[request, []]]);
    })
    .reduce(function(v, item) {
      var index = _.findIndex(v, function(_item) {
        return _item[0] === item[0];
      });
      if (index !== -1) {
        v[index][1].push.apply(v[index][1], item[1]);
      } else {
        v.push(item);
      }
      return v;
    }, []);
};
