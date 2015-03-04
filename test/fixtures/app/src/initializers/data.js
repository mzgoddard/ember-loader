exports.name = 'data';
exports.initialize = function(container, application) {
  var data = Object.create({
    name: 'world'
  });

  application.register('data:main', data, {instantiate: false});
  application.inject('controller', 'data', 'data:main');
};
