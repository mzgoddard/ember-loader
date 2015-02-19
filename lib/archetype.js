const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const _ = require('lodash');
const loaderUtils = require('loader-utils');
const promise = require('bluebird');

const config = require('./config');
const utils = require('./utils');

const titleCaseFromDashed = utils.titleCaseFromDashed;
const titleCaseFromPath = utils.titleCaseFromPath;

const typeOrderDefault = [
  // TODO 0.1: Remove external components. The mechanism for them to be possible
  // should be there but direct default support is uncertain since details are
  // easily project specific.
  'external_component',
  'component',
  'model',
  'template',
  'initializer',
  'router',
  'controller',
  'route',
  'view'
];

const typeDefaultOptions = {

  // TODO 0.1: Remove external components.
  external_component: {
    store: function(module, params) {
      // External Components.
      var match = /-component-(.*)/.exec(params.name);
      if (match) {
        // eg ChildComponent
        var casedName = titleCaseFromDashed(match[1]) + 'Component';
        module[casedName] = params.fullpath;
        return module;
      }
    },
  },

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
      // TODO 0.1: Don't hide things in a component.
      } else if (/^components\/|component\/[^/]*$/.test(params.name)) {
        // It's any other file in a component. Leave it to the component to best
        // expose it.
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
    // TODO 0.1: Remove and only support the normal 'initializers'.
    groupName: ['init', 'initializers'],
    store: function(module, params) {
      var match = /^init\/(.*)$/.exec(params.name);
      if (match) {
        module.INITIALIZERS = module.INITIALIZERS || {};
        module.INITIALIZERS[match[1]] = params.fullpath;
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
      var match = /^router$/.exec(params.name);
      if (match) {
        if (module.ROUTERS) {
          module.ROUTERS.push(params.fullpath);
        } else {
          module.ROUTERS = [params.fullpath];
        }
        // TODO 0.1: Remove ROUTING member.
        module.ROUTING = params.fullpath;
        return module;
      }
    },

    extend: function(merged, auto, manual) {
      if (manual.ROUTERS) {
        var MERGED_ROUTERS = merged.ROUTERS = {};
        var AUTO_ROUTERS = auto.ROUTERS;
        var ROUTERS = manual.ROUTERS;
        var key;
        for (key in AUTO_ROUTERS) {
          MERGED_ROUTERS[key] = AUTO_ROUTERS[key];
        }
        for (key in ROUTERS) {
          MERGED_ROUTERS[key] = ROUTERS[key];
        }
      }
    },
  },

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

Archetype.prototype.extend = function() {};

Archetype.prototype.defaults = Archetype.defaults = typeDefaultOptions;

Archetype.fromOptions = function(name, typeOptions) {
  var archetype = new Archetype();

  archetype.name = name;

  if (name in typeDefaultOptions && !typeOptions) {
    typeOptions = typeDefaultOptions[name];
  } else {
    typeOptions = {};
  }

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

  if (typeOptions.store) {
    if (typeof typeOptions.store === 'string') {
      archetype.store = typeDefaultOptions[typeStoreOptions.store].store;
    } else {
      archetype.store = typeOptions.store;
    }
  }

  if (typeOptions.extend) {
    archetype.extend = typeOptions.extend;
  }

  return archetype;
};

function ArchetypeArray() {}

ArchetypeArray.fromOptions = function(emberOptions, queryOptions) {
  var archetypes = new ArchetypeArray();

  archetypes._emberOptions = emberOptions;
  archetypes._queryOptions = queryOptions;
  archetypes.order = emberOptions.typeOrder || typeOrderDefault;
  archetypes.types = {};

  archetypes.order.forEach(function(archetypeName) {
    archetypes.types[archetypeName] = Archetype.fromOptions(
      archetypeName,
      (emberOptions.types || {})[archetypeName]
    );
  });

  return archetypes;
};

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

ArchetypeArray.prototype.store = function(module, params) {
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

ArchetypeArray.prototype.extendUrl = function(loader) {
  if (this._extendUrl || this._emberOptions._extendUrl) {
    return this._extendUrl || this._emberOptions._extendUrl;
  }

  var lines = [
    'var types = [];',
    '',
    'module.exports = function extend(_dest, src) {',
    '  src = src || {};',
    '  var dest = {};',
    '  var key;',
    '  for (key in _dest) {',
    '    dest[key] = _dest[key];',
    '  }',
    '  for (key in src) {',
    '    dest[key] = src[key];',
    '  }',
    '',
    '  types.forEach(function(extendType) {',
    '    dest = extendType(dest, _dest, src);',
    '  });',
    '',
    '  return dest;',
    '};'
  ];

  this.each(function(archetype) {
    var extendLines = archetype.extend.toString().split('\n');

    lines.push('');
    lines = lines.concat(['types.' + archetype.name + ' = '], extendLines);
  });

  content = lines.join('\n');

  var urlTemplate = "ember-loader-extend.[hash].js";
  var extendUrl = loaderUtils.interpolateName(loader, urlTemplate, {
    context: loader.options.context,
    content: content,
  });
  extendUrl = path.join(require('os').tmpdir(), extendUrl);

  this._extendUrl = this._emberOptions._extendUrl = extendUrl;

  fs.writeFileSync(this._extendUrl, content);

  return this._extendUrl;
};

module.exports = {
  Archetype: Archetype,
  ArchetypeArray: ArchetypeArray,
};
