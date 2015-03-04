const path = require('path');

module.exports = {
  context: __dirname,
  entry: __dirname + '/index.js',
  output: {
    path: __dirname + '/tmp',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.hbs$/, loader: 'ember-templates' }
    ]
  },
  resolve: {
    modulesDirectories: [
      './bower_components', './node_modules', './web_modules'
    ],
  },

  ember: {
    concatComponentsDirectories: [
      'bower_components', 'node_modules', 'web_modules'
    ],
    modulesDirectories: [
      'bower_components', 'node_modules', 'web_modules'
    ],
  },

  emberWithDefaults: {
    typeOrder: 'default',
    types: 'default',
  },

  emberWithDefaultString: {
    typeOrder: [
      'component'
    ],
    types: {
      component: 'default',
    },
  },

  emberWithDefaultTypes: {
    typeOrder: [
      'component'
    ],
    types: {
      component: {
        store: 'default',
        generate: 'default',
        extend: 'default',
      },
    },
  },

  emberWithNamedDefault: {
    typeOrder: [
      'component'
    ],
    types: {
      component: {
        store: 'component',
        generate: 'component',
        extend: 'component',
      },
    },
  },

  emberWithDottedDefault: {
    typeOrder: [
      'component'
    ],
    types: {
      component: {
        store: 'default.component',
        generate: 'default.component',
        extend: 'default.component',
      },
    },
  },

  emberWithDottedReference: {
    typeOrder: [
      'component'
    ],
    types: {
      component: {
        store: 'emberWithDottedDefault.types.component.store',
        generate: 'emberWithDottedDefault.types.component.generate',
        extend: 'emberWithDottedDefault.types.component.extend',
      },
    },
  },

  emberWithDottedDoubleReference: {
    typeOrder: [
      'component'
    ],
    types: {
      component: 'emberWithDottedReference.types.component',
    },
  },

  // TODO 0.1: Remove this comment. This duplicates external_component in
  // archetype to demonstrate the ability since at that time as a default it'll
  // be removed.
  //
  // Demonstrate including module deps.
  emberWithExternalComponents: {
    modulesDirectories: [
      'bower_components', 'node_modules', 'web_modules'
    ],

    typeOrder: [
      'external_component'
    ],
    types: {
      external_component: {
        store: function(module, params) {
          // External Components.
          var match = /^module_directory\/.*-component-(.*)/.exec(params.name);
          if (match) {
            // eg ChildComponent
            var casedName = this.titleCaseFromDashed(match[1]) + 'Component';
            module.EXTERNAL_COMPONENTS = module.EXTERNAL_COMPONENTS || {};
            module.EXTERNAL_COMPONENTS[casedName] = this.storeMatch({
              name: casedName,
              fullpath: params.fullpath,
            });
            return module;
          }
        },

        generate: function(match, depth) {
          var tab0 = this.genTab(depth);
          var tab1 = this.genTab(depth + 1);
          var emberLoader = path.join(__dirname, '..');
          return [
            '{',
            tab1 + '"component": require(' +
              JSON.stringify(match.fullpath) + '),',
            tab1 + '"package": require("!!' +
              JSON.stringify(emberLoader).replace(/^"|"$/g, '') +
              '?ignoreOverrides&depsLookup[]=modules!' +
              JSON.stringify(match.fullpath).substring(1) + ')',
            tab0 + '}'
          ].join('\n');
        },

        extend: function(merged, auto, manual) {
          var key;
          for (key in merged.EXTERNAL_COMPONENTS) {
            var value = merged.EXTERNAL_COMPONENTS[key];
            var subkey;
            for (subkey in value.package) {
              if (!merged[subkey]) {
                merged[subkey] = value.package[subkey];
              }
            }
            if (!merged[key]) {
              merged[key] = value.component;
            }
          }
          delete merged.EXTERNAL_COMPONENTS;
        },
      },
    },
  },

};
