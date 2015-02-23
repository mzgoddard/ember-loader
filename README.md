# Ember Loader [![Build Status](https://travis-ci.org/mzgoddard/ember-loader.svg?branch=master)](https://travis-ci.org/mzgoddard/ember-loader) [![Build status](https://ci.appveyor.com/api/projects/status/8l28rlhvb1rmlxoj)](https://ci.appveyor.com/project/mzgoddard/ember-loader)

Enhance a modules object with contents of a folder following Ember naming patterns.

A project with the following structure:

```javascript
// index.js
module.exports = {
  ROUTERS: [
    function() {
      this.route('index');
    }
  ]
};

// src/index/controller.js
module.exports = Ember.Controller.extend({
  name: 'world'
});

// src/index/template.hbs
Hello {{name}}!
```

will return an object like:

```javascript
module.exports = {
  "IndexController": require('./src/controllers/index'),
  "TEMPLATES": {
    "index": require('./src/templates/index.hbs')
  },
  "ROUTERS": [
    function() {
      this.route('index');
    }
  ]
};
```

which can be used with:

```javascript
var module = require('ember!.');
Ember.TEMPLATES = module.TEMPLATES;

App = Ember.Application.create(module);
module.ROUTERS.forEach(function(router) {
  App.Router.map(router);
});
```

## Use

Make sure in your webpack configuration to have use ember-templates-loader or another loader to load ember handlebar templates.

### Configuration

`ember-loader` takes options from the webpack config at `emberOptions`. The following options are available.

#### `typeOrder`

`typeOrder` is an array of types and the order `ember-loader` considers them in when deciding if to automatically fill with a found file.

If you set `typeOrder` you need include all types you want `ember-loader` to consider, any defaults left out of the array are excluded.

```js
{
  emberOptions: {
    typeOrder: [
      'component',
      'model',
      'template',
      'initializer',
      'router',
      'controller',
      'route',
      'view'
    ]
  }
}
```

#### `types`

`types` defines how to consider a file for inclusion. If a type is defined in `typeOrder` but not defined in `types` there the default algorithm is used. To define some changes to a default type, such as templates, you must define any non-generated values that you want to keep. Templates as an example define a `store` and `extend` function so if you wanted to overwrite `store` and keep `extend` you will need to have an `extend` key with a value of `template`.

```js
{
  emberOptions: {
    types: {
      template: {
        store: function(module, params) {
          // Do something other than the normal templates store.
        },
        // Define extend as the custom one for template to keep it.
        extend: 'template'
      }
    }
  }
}
```

##### `groupName`

`groupName` is either a `string` or an `array of strings`. `groupName` is used in the default `store` implementation. If the first part of a file up to a separator (a hyphen, underscore, or slash) matches the value of groupName or a value in `groupName`, `store` will use that file. `groupName` by default generates a name from `typeOrder` suffixed with a `'s'` to cheaply try to pluralize the name.

##### `suffixName`

`suffixName` is either a `string` or an `array of strings`. `suffixName` is used in the default `store` implementation. If the last part of a file after a separator (a hyphen, underscore, or slash) matches the value of `suffixName` or a value in `suffixName`, `store` will use that file. `suffixName` by default generates a name from `typeOrder`.

##### `store`

`store` is a `string` or a `function`. As a string it may refer to an existing defined default type and use its custom `store` function. As a function it takes two arguments `module` and `params`. `params` is a object with two members `name` and `fullpath`. `name` is technically a relative path from the root of where `ember-loader` is auto filling from. `fullpath` is the full system filepath. The default store considers `name` against `groupName` and `suffixName` and title cases the file name storing it on `module` with `fullpath` as the value. The extend step generates an object in javascript that requires the `fullpath`, letting the webpack configuration apply auto loaders to the `fullpath` such as the `ember-templates-loader`.

The following defaults have custom `store` functions:

- components
- models
- initializers
- templates
- routers

##### `extend`

`extend` is a `string` or a `function`. As a string it may refer to an existing defined default type and use its custom `store` function. As a function it takes three arguments `merged`, `auto` and `manual`. `merged` is the output object. `auto` is the object created through finding files and `store`ing them. `manual` is the object defined in the base file.

`extend` is written to a constructed file that is included in the webpacked file. As such it can't make references outside of its function. You could require files, but that require statement needs to be inside the function.

`extend` by default does nothing. The "extend" step first merges the base `auto` and `manual` objects. The `extend` hook is used extend sub objects like `INITIALIZERS`, `TEMPLATES`, and `ROUTERS`.

The following defaults have custom `extend` functions:

- initializers
- templates
- routers
