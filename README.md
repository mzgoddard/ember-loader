# Ember Loader [![Build Status](https://travis-ci.org/mzgoddard/ember-loader.svg?branch=master)](https://travis-ci.org/mzgoddard/ember-loader)

Enhance a modules object with contents of a folder following Ember naming patterns.

A project with the following structure:

```javascript
// index.js
module.exports = {
  ROUTING: function() {
    this.route('index');
  }
};

// src/controllers/index.js
module.exports = Ember.Controller.extend({
  name: 'world'
});

// src/templates/index.hbs
Hello {{name}}!
```

will return an object like:

```javascript
module.exports = {
  IndexController: require('./src/controllers/index'),
  TEMPLATES: {
    index: require('./src/templates/index.hbs')
  },
  ROUTING: function() {
    this.route('index');
  }
};
```

which can be used with:

```javascript
var module = require('ember!.');
Ember.TEMPLATES = module.TEMPLATES;

App = Ember.Application.create(module);
App.Router.map(module.ROUTING);
```

## Use

Make sure in your webpack configuration to have use ember-templates-loader or another loader to load ember handlebar templates.
