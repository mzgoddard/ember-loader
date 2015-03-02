exports.name = 'ember-loader-templates';
exports.initialize = function(container, application) {
  Ember.TEMPLATES = application.TEMPLATES;
};
