const path = require('path');

const _ = require('lodash');
const promise = require('bluebird');

exports.findModuleDeps = function(request, subdir) {
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
    .reduce(function(v, dep) {
      return v.concat([[
        'module_directory/' + dep[0],
        path.resolve(request, subdir, dep[0])
      ]]);
    }, [])
    .then(function(v) {
      return v.concat([[subdir, path.resolve(request, subdir), 'context']]);
    })
    .catch(squelchENOENT);
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
    .map(function(name) {
      var fullpath = path.join(request, name);
      return stat(fullpath)
        .then(function(_stat) {
          if (_stat.isDirectory()) {
            return walk(stat, readdir, fullpath);
          } else {
            return [[request, [name]]];
          }
        });
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
      var pathToResolve = item[2] === 'context' ?
        item[1] :
        path.basename(item[1], '.js');

      return promise
        .all([
          path.relative(
            request, path.resolve(item[0], pathToResolve)
          ) || '.',
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
      if (!_.find(result, function(entry) { return entry[1] === request; })) {
        return result.concat([[request, request, 'context']]);
      } else {
        return result;
      }
    })
    .catch(squelchENOENT);
};

var titleCaseFromDashed = exports.titleCaseFromDashed = function(str) {
  str = str[0].toUpperCase() + str.substring(1);
  return str.replace(/[-_](.)/g, function(str) {
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
      var v = [].concat(items.reduce(function(v, items) {
        for (var i = 0, l = items.length; i < l; i += 2) {
          v.push(items.slice(i, i + 2));
        }
        return v;
      }, []));
      return v.concat([[request, []]]);
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

var squelchENOENT = function(e) {
  if (
    e.code === 'ENOENT' ||
    (e.cause && e.cause.code === 'ENOENT') ||
    e.message.search('ENOENT')
  ) {
    return [];
  } else {
    throw e;
  }
};
