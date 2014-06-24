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
  }
};
