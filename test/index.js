require('script!jquery/dist/jquery');
require('script!handlebars/handlebars');
require('script!ember/ember');

const expect = require('chai').expect;

it('should load fixture empty', function() {
  var empty = require('!!../!./fixtures/empty');
});

it('should load fixture file-in-src', function() {
  require('!!../!./fixtures/file-in-src');
});

describe('single files', function() {

  it('should load fixture controller', function() {
    var controller = require('!!../!./fixtures/controller');
    expect(Object.keys(controller)).to.have.length.of(1);
    expect(controller.ControllerIndexController).to.exist;
  });

  it('should load the deep controller fixture', function() {
    var module = require('!!../!./fixtures/controller-deep');
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.DeepIndexController).to.exist;
  });

  it('should load the deeper controller fixture', function() {
    module = require('!!../!./fixtures/controller-deeper');
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.DeepDeeperDeepestIndexController).to.exist;
  });

  it('should load both the deep and deeper controller fixture', function() {
    module = require('!!../!./fixtures/controller-deep-and-deeper');
    expect(Object.keys(module)).to.have.length.of(2);
    expect(module.DeepIndexController).to.exist;
    expect(module.DeepDeeperIndexController).to.exist;
  });

  it('should load the init fixture', function() {
    var module = require('!!../!./fixtures/initializer');
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.INITIALIZERS).to.exist;
    expect(Object.keys(module.INITIALIZERS)).to.have.length.of(1);
    expect(module.INITIALIZERS['index']).to.exist;
  });

  it('should load fixture route', function() {
    var route = require('!!../!./fixtures/route');
    expect(Object.keys(route)).to.have.length.of(1);
    expect(route.RouteIndexRoute).to.exist;
  });

  it('should load fixture router', function() {
    var module = require('!!../!./fixtures/router');
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.ROUTING).to.exist;
  });

  it('should load the shallow template fixture', function() {
    var module = require('!!../!./fixtures/template-shallow');
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.TEMPLATES).to.exist;
    expect(Object.keys(module.TEMPLATES)).to.have.length.of(1);
    expect(module.TEMPLATES['shallow']).to.exist;
  });

  it('should load the deep template fixture', function() {
    var module = require('!!../!./fixtures/template-deep');
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.TEMPLATES).to.exist;
    expect(Object.keys(module.TEMPLATES)).to.have.length.of(1);
    expect(module.TEMPLATES['deep/deep']).to.exist;
  });

});

describe('components', function() {

  it('should load fixture component-inline', function() {
    var inline = require('!!../!./fixtures/component-inline');
    expect(Object.keys(inline)).to.have.length.of(1);
    expect(inline.ComponentInlineSimpleComponent).to.exist;
  });

  it('should load fixture component-simple', function() {
    var simple = require('!!../!./fixtures/component-simple');
    expect(Object.keys(simple)).to.have.length.of(1);
    expect(simple.ChildComponent).to.exist;
  });

  it('should load fixture component-deep', function() {
    var module = require('!!../!./fixtures/component-deep');
    expect(Object.keys(module)).to.have.length.of(2);
    expect(module.ShallowComponent).to.exist;
    expect(module.DeepComponent).to.exist;
  });

  it('should load fixture component-web-modules', function() {
    var module = require('!!../!./fixtures/component-web-modules');
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.ChildComponent).to.exist;
  });

  it('should load fixture component-other-modules', function() {
    var module = require(
      '!!../?componentsDirectories[]=other_modules!' +
      './fixtures/component-other-modules'
    );
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.ChildComponent).to.exist;
  });

});

describe('modules', function() {

  it('should load fixutre simple', function() {
    var simple = require('!!../!./fixtures/simple');
    expect(simple.SimpleIndexRoute).to.exist;
    expect(simple.SimpleIndexController).to.exist;
  });

  it('should load fixture full-module', function() {
    var module = require('!!../!./fixtures/full-module');
    expect(module).to.include.keys(
      'Post',
      'PostsController',
      'PostsRoute',
      'PostsView',
      'TestController',
      'TestRoute',
      'TestView',
      'INITIALIZERS',
      'TEMPLATES',
      'ROUTING'
    );
    expect(Object.keys(module)).to.have.length.of(10);
    expect(module.INITIALIZERS.test).to.exist;
    expect(Object.keys(module.INITIALIZERS)).to.have.length.of(2);
    expect(module.TEMPLATES.test).to.exist;
    expect(Object.keys(module.TEMPLATES)).to.have.length.of(2);
  });

  it('should load fixture pod', function() {
    var module = require('!!../!./fixtures/pod');
    expect(module).to.include.keys(
      'Application', // Model
      'ApplicationChildIndexRoute',
      'ApplicationController',
      'ApplicationRoute',
      'ApplicationView',
      'ApplicationIndexRoute',
      'PodItemComponent',
      'PodListComponent',
      'PodOverviewComponent',
      'PodPairComponent',
      'PodScoreComponent',
      'PodSuperComponent',
      'SmallModuleRoute'
    );
    expect(Object.keys(module)).to.have.length.of(14);
    expect(module.TEMPLATES).to.include.keys(
      'application',
      'application/index'
    );
    expect(module.TEMPLATES).to.not.include.keys(
      'pod/item/component'
    );
  });

  it('should load fixture pod-dash', function() {
    var module = require('!!../!./fixtures/pod-dash');
    expect(module).to.exist;
    expect(module.TEMPLATES).to.exist;
    expect(module).to.include.keys(
      'ChildIndexRoute',
      'IndexRoute'
    );
    expect(module.TEMPLATES).to.include.keys(
      'index'
    );
  });

});
