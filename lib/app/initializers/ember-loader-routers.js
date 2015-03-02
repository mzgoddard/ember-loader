exports.name = 'ember-loader-routers';
exports.initialize = function(container, application) {
  Object.keys(application.ROUTERS || []).forEach(function(key) {
    application.Router.map(application.ROUTERS[key]);
  });
};
