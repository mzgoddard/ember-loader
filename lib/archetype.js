const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const _ = require('lodash');
const loaderUtils = require('loader-utils');
const promise = require('bluebird');

const utils = require('./utils');

const titleCaseFromDashed = utils.titleCaseFromDashed;
const titleCaseFromPath = utils.titleCaseFromPath;

const typeOrderDefault = [
  'component',
  'model',
  'template',
  'initializer',
  'router',
  'controller',
  'route',
  'view',
  'style',
  'css',
  'less',
  'sass',
  'stylus'
];

const typeDefaultOptions = {

  component: {
    store: function(module, params) {
      // Internal Components.
      match = new RegExp(
        /^components\/((?:[^/]*\/)*(?:[^/]*))\/index$|/.source +
        /((?:[^/]*\/)*(?:[^/]*))[-_/]component(?:\/index)?$/.source
      ).exec(params.name);
      if (match) {
        var casedName = titleCaseFromPath(match[1] || match[2]) + 'Component';
        module[casedName] = params.fullpath;
        return module;
      }
    },
  },

  model: {
    store: function(module, params) {
      var match = /(.*)\/model$/.exec(params.name);
      if (!match) {
        match = /models\/(.*)$/.exec(params.name);
      }

      if (match) {
        module[titleCaseFromPath(match[1])] = params.fullpath;
        return module;
      }
    },
  },

  template: {
    store: function(module, params) {
      var match = /^templates\/((?:[^/]*\/)*(?:[^/]*))\.hbs$/.exec(params.name);
      var templatePathName;
      if (match) {
        templatePathName = match[1];
      }
      match = /(.*)[-_/]template.hbs$/.exec(params.name);
      if (match) {
        templatePathName = match[1];
      }

      if (templatePathName) {
        module.TEMPLATES = module.TEMPLATES || {};
        module.TEMPLATES[templatePathName] = params.fullpath;
        return module;
      }
    },

    extend: function(merged, auto, manual) {
      if (manual.TEMPLATES) {
        var MERGED_TEMPLATES = merged.TEMPLATES = {};
        var AUTO_TEMPLATES = auto.TEMPLATES;
        var TEMPLATES = manual.TEMPLATES;
        var key;
        for (key in AUTO_TEMPLATES) {
          MERGED_TEMPLATES[key] = AUTO_TEMPLATES[key];
        }
        for (key in TEMPLATES) {
          MERGED_TEMPLATES[key] = TEMPLATES[key];
        }
      }
    },
  },

  initializer: {
    store: function(module, params) {
      var match = new RegExp(
        /^initializers\/(.*)$|/.source +
        /^(.*)[-_/]initializer$/.source
      ).exec(params.name);
      if (match) {
        module.INITIALIZERS = module.INITIALIZERS || {};
        module.INITIALIZERS[match[1] || match[2]] = params.fullpath;
        return module;
      }
    },

    extend: function(merged, auto, manual) {
      if (manual.INITIALIZERS) {
        var MERGED_INITIALIZERS = merged.INITIALIZERS = {};
        var AUTO_INITIALIZERS = auto.INITIALIZERS;
        var INITIALIZERS = manual.INITIALIZERS;
        var key;
        for (key in AUTO_INITIALIZERS) {
          MERGED_INITIALIZERS[key] = AUTO_INITIALIZERS[key];
        }
        for (key in INITIALIZERS) {
          MERGED_INITIALIZERS[key] = INITIALIZERS[key];
        }
      }
    },
  },

  router: {
    store: function(module, params) {
      var match = /^(?:[^/]*\/)*router$/.exec(params.name);
      if (match) {
        if (module.ROUTERS) {
          module.ROUTERS.push(params.fullpath);
        } else {
          module.ROUTERS = [params.fullpath];
        }
        return module;
      }
    },

    extend: function(merged, auto, manual) {
      if (manual.ROUTERS) {
        var MERGED_ROUTERS = [];
        var AUTO_ROUTERS = auto.ROUTERS || [];
        var ROUTERS = manual.ROUTERS;
        var key;
        MERGED_ROUTERS = MERGED_ROUTERS
          .concat(AUTO_ROUTERS, ROUTERS)
          .filter(function(router, index, array) {
            return !array.slice(0, index).reduce(function(carry, _router) {
              return carry || _router === router;
            }, false);
          });
        merged.ROUTERS = MERGED_ROUTERS;
      }
    },
  },

  style: {
    store: function() {},
    extend: function(merged, auto, manual) {
      if (manual.STYLES) {
        var MERGED_STYLES = merged.STYLES = {};
        var AUTO_STYLES = auto.STYLES;
        var STYLES = manual.STYLES;
        var key;
        for (key in AUTO_STYLES) {
          MERGED_STYLES[key] = AUTO_STYLES[key];
        }
        for (key in STYLES) {
          MERGED_STYLES[key] = STYLES[key];
        }
      }
    },
  },

  css: {
    store: function(module, params) {
      var match = /(.*)[-_/]style.css$|^styles\/(.*).css/.exec(params.name);
      if (match) {
        module.STYLES = module.STYLES || {};
        module.STYLES[match[1] || match[2]] = this.storeMatch({
          name: (match[1] || match[2]) + '.css',
          fullpath: params.fullpath
        });
        return module;
      }
    },
  },

  less: {
    store: function(module, params) {
      var match = /(.*)[-_/]style.less$|^styles\/(.*).less/.exec(params.name);
      if (match) {
        module.STYLES = module.STYLES || {};
        module.STYLES[match[1] || match[2]] = this.storeMatch({
          name: (match[1] || match[2]) + '.less',
          fullpath: params.fullpath
        });
        return module;
      }
    },
  },

  sass: {
    store: function(module, params) {
      var match = new RegExp(
        /(.*)[-_/]style.(sass|scss)$|/.source +
        /^styles\/(.*).(sass|scss)/.source
      ).exec(params.name);
      if (match) {
        module.STYLES = module.STYLES || {};
        module.STYLES[match[1] || match[3]] = this.storeMatch({
          name: (match[1] || match[3]) + '.' + (match[2] || match[4]),
          fullpath: params.fullpath
        });
        return module;
      }
    },
  },

  stylus: {
    store: function(module, params) {
      var match = /(.*)[-_/]style.styl$|^styles\/(.*).styl/.exec(params.name);
      if (match) {
        module.STYLES = module.STYLES || {};
        module.STYLES[match[1] || match[2]] = this.storeMatch({
          name: (match[1] || match[2]) + '.styl',
          fullpath: params.fullpath
        });
        return module;
      }
    },
  },

};

function ArchetypeMatch(type, params) {
  this.type = type;
  this.params = params;
}

ArchetypeMatch.prototype.generate = function(depth) {
  return this.type.generate(this.params, depth);
};

function Archetype() {}

Archetype.prototype.store = function(module, params) {
  var name = params.name;
  var match = /^(.*)[-_/]([^/]*)$/.exec(name);
  var basename;

  // Suffix pod style.
  if (match && _.contains([].concat(this.suffixName), match[2])) {
    basename = match[1];
  // Prefix grouped style.
  } else {
    match = /^([^/]*)\/(.*)$/.exec(name);
    if (match && _.contains([].concat(this.groupName), match[1])) {
      basename = match[2];
    }
  }

  if (basename) {
    var casedName = titleCaseFromPath(basename) + titleCaseFromPath(this.name);
    module[casedName] = params.fullpath;

    return module;
  }
};

Archetype.prototype.generate = function(match) {
  return 'require(' + JSON.stringify(match.fullpath) + ')';
};

Archetype.prototype.extend = function() {};

Archetype.prototype.storeMatch = function(params) {
  return new ArchetypeMatch(this, params);
};

Archetype.prototype.genTab = function(depth) {
  return _.times(depth).map(function() {return '\t';}).join('');
};

Archetype.prototype.titleCaseFromDashed = titleCaseFromDashed;
Archetype.prototype.titleCaseFromPath = titleCaseFromPath;

Archetype.prototype.defaults = Archetype.defaults = typeDefaultOptions;

Archetype.fromOptions = function(webpackOptions, name, typeOptions) {
  var archetype = new Archetype();

  archetype.name = name;

  if (name in typeDefaultOptions && !typeOptions) {
    typeOptions = typeDefaultOptions[name];
  } else if (typeof typeOptions === 'string') {
    typeOptions = Archetype.getObject(typeOptions, name, webpackOptions);
  } else if (!typeOptions) {
    typeOptions = {};
  }

  archetype.options = typeOptions;

  if (typeOptions.groupName) {
    archetype.groupName = typeOptions.groupName;
  } else {
    archetype.groupName = name + 's';
  }

  if (typeOptions.suffixName) {
    archetype.suffixName = typeOptions.suffixName;
  } else {
    archetype.suffixName = name;
  }

  Archetype.setFunction(
    archetype, 'store', typeOptions.store, name, webpackOptions
  );

  Archetype.setFunction(
    archetype, 'generate', typeOptions.generate, name, webpackOptions
  );

  Archetype.setFunction(
    archetype, 'extend', typeOptions.extend, name, webpackOptions
  );

  return archetype;
};

Archetype.getObject = function(value, name, webpackOptions) {
  var result;
  if (value === 'default') {
    result = typeDefaultOptions[name];
  } else if (_.contains(typeOrderDefault, value)) {
    result = typeDefaultOptions[value];
  } else if (value.match(/^default\./)) {
    result = utils.get(
      typeDefaultOptions, value.substring('default.'.length)
    );
  } else {
    result = utils.get(webpackOptions, value);
  }

  if (typeof result === 'string') {
    result = Archetype.getObject(result, name, webpackOptions);
  }

  return result;
};

Archetype.setFunction = function(obj, key, value, name, webpackOptions) {
  if (value) {
    var result;
    if (typeof value === 'string') {
      result = Archetype.getObject(value, name, webpackOptions);

      if (result) {
        result = result[key];
      }
    } else {
      result = value;
    }

    if (result) {
      obj[key] = result;
    }
  }
};

function ArchetypeArray() {}

ArchetypeArray.fromOptions = function(
  webpackOptions, emberOptions, queryOptions
) {
  var archetypes = new ArchetypeArray();

  archetypes._emberOptions = emberOptions;
  archetypes._queryOptions = queryOptions;
  archetypes.order = emberOptions.typeOrder || typeOrderDefault;
  archetypes.types = {};

  if (typeof archetypes.order === 'string') {
    if (archetypes.order === 'default') {
      archetypes.order = typeOrderDefault;
    } else {
      archetypes.order = utils.get(webpackOptions, archetypes.order).typeOrder;
    }
  }

  var types = emberOptions.types || {};
  if (typeof types === 'string') {
    if (types === 'default') {
      types = typeDefaultOptions;
    } else {
      types = utils.get(webpackOptions, types).types;
    }
  }

  archetypes.order.forEach(function(archetypeName) {
    archetypes.types[archetypeName] = Archetype.fromOptions(
      webpackOptions,
      archetypeName,
      types[archetypeName]
    );
  });

  return archetypes;
};

ArchetypeArray.orderDefaults = typeDefaultOptions;

ArchetypeArray.prototype.get = function(archetypeName) {
  return this.types[archetypeName];
};

ArchetypeArray.prototype.each = function(fn, ctx) {
  this.order.forEach(function(archetypeName) {
    var archetype = this.get(archetypeName);
    fn.call(ctx || this, archetype);
  }, this);
};

ArchetypeArray.prototype.reduce = function(fn, initial) {
  var _this = this;
  return _this.order.reduce(function(carry, archetypeName) {
    return fn.call(_this, carry, _this.get(archetypeName));
  }, initial);
};

ArchetypeArray.prototype.store = function(module, _params) {
  var params = {
    // Normalize to *nix paths.
    name: _params.name.replace(/\\/g, '/'),
    fullpath: _params.fullpath,
  };

  return this.reduce(function(value, archetype) {
    return value
      .then(function(carry) {
        if (carry) {
          return carry;
        }

        return promise.try(archetype.store.bind(archetype, module, params));
      });
  }, promise.resolve());
};

ArchetypeArray.prototype.generate = function(match, depth) {
  return match.generate(depth);
};

ArchetypeArray.prototype.extendUrl = function(loader) {
  if (this._extendUrl || this._emberOptions._extendUrl) {
    return this._extendUrl || this._emberOptions._extendUrl;
  }

  var lines = [
    'var types = [];',
    '',
    'module.exports = function extend(auto, manual) {',
    '  var merged = {};',
    '  manual = manual || {};',
    '  var key;',
    '  for (key in auto) {',
    '    merged[key] = auto[key];',
    '  }',
    '  for (key in manual) {',
    '    merged[key] = manual[key];',
    '  }',
    '',
    '  types.forEach(function(extendType) {',
    '    merged = extendType(merged, auto, manual) || merged;',
    '  });',
    '',
    '  return merged;',
    '};'
  ];

  this.each(function(archetype) {
    var extendLines = archetype.extend.toString().split('\n');

    lines.push('');
    lines = lines.concat(
      ['types.push(', '// ' + archetype.name],
      extendLines,
      [');']
    );
  });

  content = lines.join('\n');

  var urlTemplate = "ember-loader-extend.[hash].js";
  var extendUrl = loaderUtils.interpolateName(loader, urlTemplate, {
    context: loader.options.context,
    content: content,
  });
  extendUrl = path.join(require('os').tmpdir(), extendUrl);

  this._extendUrl = this._emberOptions._extendUrl = extendUrl;

  try {
    if (fs.readFileSync(this._extendUrl, 'utf8') !== content) {
      fs.writeFileSync(this._extendUrl, content);
    }
  } catch (e) {
    fs.writeFileSync(this._extendUrl, content);
  }

  return this._extendUrl;
};

module.exports = {
  Archetype: Archetype,
  ArchetypeArray: ArchetypeArray,
  ArchetypeMatch: ArchetypeMatch,
};
