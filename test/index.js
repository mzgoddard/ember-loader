require('script!jquery/dist/jquery');
require('script!handlebars/handlebars');
require('script!ember/ember');
require('script!ember-mocha-adapter/adapter');

const expect = require('chai').expect;

it('should load fixture empty', function() {
  var empty = require('!!../!./fixtures/empty');
});

it('should load fixture file-in-src', function() {
  require('!!../!./fixtures/file-in-src');
});

describe('single type', function() {

  it('should load fixture controller', function() {
    var controller = require('!!../!./fixtures/controller');
    expect(Object.keys(controller)).to.have.length.of(1);
    expect(controller.ControllerIndexController).to.exist;
  });

  it('should load fixture controller-suffix', function() {
    var controller = require('!!../!./fixtures/controller-suffix');
    expect(Object.keys(controller)).to.have.length.of(1);
    expect(controller.IndexController).to.exist;
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

  it('should load the initializer fixture', function() {
    var module = require('!!../!./fixtures/initializer-new');
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.INITIALIZERS).to.exist;
    expect(Object.keys(module.INITIALIZERS)).to.have.length.of(1);
    expect(module.INITIALIZERS['index']).to.exist;
  });

  it('should load the initializer-suffix fixture', function() {
    var module = require('!!../!./fixtures/initializer-suffix');
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.INITIALIZERS).to.exist;
    expect(Object.keys(module.INITIALIZERS)).to.have.length.of(2);
    expect(module.INITIALIZERS).to.include.keys('index', 'application');
  });

  it('should load fixture route', function() {
    var route = require('!!../!./fixtures/route');
    expect(Object.keys(route)).to.have.length.of(1);
    expect(route.RouteIndexRoute).to.exist;
  });

  it('should load fixture route-suffix', function() {
    var route = require('!!../!./fixtures/route-suffix');
    expect(Object.keys(route)).to.have.length.of(1);
    expect(route.IndexRoute).to.exist;
  });

  it('should load fixture router', function() {
    var module = require('!!../!./fixtures/router');
    expect(Object.keys(module)).to.have.length.of(2);
    expect(module.ROUTERS).to.exist;
    expect(module.ROUTING).to.exist;
  });

  it('should load fixture router-multiple', function() {
    var module = require('!!../!./fixtures/router-multiple');
    expect(Object.keys(module)).to.have.length.of(2);
    expect(module.ROUTERS).to.exist;
    expect(module.ROUTERS).to.have.length(2);
    expect(module.ROUTING).to.exist;
    expect(module.ROUTING).to.be.a('function');
  });

  it('should load the shallow template fixture', function() {
    var module = require('!!../!./fixtures/template-shallow');
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.TEMPLATES).to.exist;
    expect(Object.keys(module.TEMPLATES)).to.have.length.of(1);
    expect(module.TEMPLATES['shallow']).to.exist;
  });

  it('should load the template-suffix fixture', function() {
    var module = require('!!../!./fixtures/template-suffix');
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

  it('should load fixture component-suffix', function() {
    var inline = require('!!../!./fixtures/component-suffix');
    expect(Object.keys(inline)).to.have.length.of(1);
    expect(inline.InlineComponent).to.exist;
  });

  it('should load fixture component-simple', function() {
    var simple = require('!!../!./fixtures/component-simple');
    expect(Object.keys(simple)).to.have.length.of(1);
    expect(simple.ChildComponent).to.exist;
  });

  it('should load fixture component-simple', function() {
    var simple = require(
      '!!..?optionKey=emberWithExternalComponents' +
        '!./fixtures/component-simple'
    );
    expect(Object.keys(simple)).to.have.length.of(1);
    expect(simple.ChildComponent).to.exist;
  });

  it('should load fixture component-deep', function() {
    var module = require('!!../!./fixtures/component-deep');
    expect(Object.keys(module)).to.have.length.of(2);
    expect(module.ShallowComponent).to.exist;
    expect(module.DeepComponent).to.exist;
  });

  it('should load fixture component-deep', function() {
    var module = require(
      '!!..?optionKey=emberWithExternalComponents!./fixtures/component-deep'
    );
    expect(Object.keys(module)).to.have.length.of(2);
    expect(module.ShallowComponent).to.exist;
    expect(module.DeepComponent).to.exist;
  });

  it('should load fixture component-web-modules', function() {
    var module = require('!!../!./fixtures/component-web-modules');
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.ChildComponent).to.exist;
  });

  it('should load fixture component-web-modules', function() {
    var module = require(
      '!!..?optionKey=emberWithExternalComponents' +
        '!./fixtures/component-web-modules'
    );
    expect(Object.keys(module)).to.have.length.of(1);
    expect(module.ChildComponent).to.exist;
  });

  // TODO 0.1: Drop this test as we will drop componentsDirectories support.
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
      'ROUTERS',
      'ROUTING'
    );
    expect(Object.keys(module)).to.have.length.of(11);
    expect(module.INITIALIZERS.test).to.exist;
    expect(Object.keys(module.INITIALIZERS)).to.have.length.of(2);
    expect(module.TEMPLATES.test).to.exist;
    expect(Object.keys(module.TEMPLATES)).to.have.length.of(2);
    expect(module.ROUTERS).to.have.length.of(1);
  });

  it('should load fixture pod', function() {
    var module = require('!!../!./fixtures/pod');
    expect(module).to.include.keys(
      // Model
      'Application',
      'ApplicationChildIndexRoute',
      'ApplicationController',
      'ApplicationIndexRoute',
      'ApplicationRoute',
      'ApplicationView',
      'INITIALIZERS',
      'PodItemComponent',
      'PodListComponent',
      'PodOverviewComponent',
      'PodPairComponent',
      'PodScoreComponent',
      'PodSuperComponent',
      'SmallModuleRoute'
    );
    expect(Object.keys(module)).to.have.length.of(15);
    expect(module.TEMPLATES).to.include.keys(
      'application',
      'application/index'
    );
    expect(module.TEMPLATES).to.not.include.keys(
      'pod/item/component'
    );
  });

  it('should load fixture pod with explicit defaults', function() {
    var module = require('!!..?optionKey=emberWithDefaults!./fixtures/pod');
    expect(module).to.include.keys(
      // Model
      'Application',
      'ApplicationChildIndexRoute',
      'ApplicationController',
      'ApplicationIndexRoute',
      'ApplicationRoute',
      'ApplicationView',
      'INITIALIZERS',
      'PodItemComponent',
      'PodListComponent',
      'PodOverviewComponent',
      'PodPairComponent',
      'PodScoreComponent',
      'PodSuperComponent',
      'SmallModuleRoute'
    );
  });

  it('should load fixture pod with only components', function() {
    var module = require(
      '!!..?optionKey=emberWithDefaultString!./fixtures/pod'
    );
    expect(module).to.include.keys(
      'PodItemComponent',
      'PodListComponent',
      'PodOverviewComponent',
      'PodPairComponent',
      'PodScoreComponent',
      'PodSuperComponent'
    );
  });

  it('should load fixture pod with only components', function() {
    var module = require(
      '!!..?optionKey=emberWithDefaultTypes!./fixtures/pod'
    );
    expect(module).to.include.keys(
      'PodItemComponent',
      'PodListComponent',
      'PodOverviewComponent',
      'PodPairComponent',
      'PodScoreComponent',
      'PodSuperComponent'
    );
  });

  it('should load fixture pod with only components', function() {
    var module = require(
      '!!..?optionKey=emberWithNamedDefault!./fixtures/pod'
    );
    expect(module).to.include.keys(
      'PodItemComponent',
      'PodListComponent',
      'PodOverviewComponent',
      'PodPairComponent',
      'PodScoreComponent',
      'PodSuperComponent'
    );
  });

  it('should load fixture pod with only components', function() {
    var module = require(
      '!!..?optionKey=emberWithDottedDefault!./fixtures/pod'
    );
    expect(module).to.include.keys(
      'PodItemComponent',
      'PodListComponent',
      'PodOverviewComponent',
      'PodPairComponent',
      'PodScoreComponent',
      'PodSuperComponent'
    );
  });

  it('should load fixture pod with only components', function() {
    var module = require(
      '!!..?optionKey=emberWithDottedReference!./fixtures/pod'
    );
    expect(module).to.include.keys(
      'PodItemComponent',
      'PodListComponent',
      'PodOverviewComponent',
      'PodPairComponent',
      'PodScoreComponent',
      'PodSuperComponent'
    );
  });

  it('should load fixture pod with only components', function() {
    var module = require(
      '!!..?optionKey=emberWithDottedDoubleReference!./fixtures/pod'
    );
    expect(module).to.include.keys(
      'PodItemComponent',
      'PodListComponent',
      'PodOverviewComponent',
      'PodPairComponent',
      'PodScoreComponent',
      'PodSuperComponent'
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

describe('application', function() {

  it('returns an Ember.Application', function() {
    var AppFactory = require('!!..?application!./fixtures/empty');
    expect(AppFactory.proto()).to.be.an
      .instanceof(Ember.Application.proto().constructor);
  });

  var app;
  before(function() {
    if ($('#ember-testing').length === 0) {
      $(document.body).append('<div id="ember-testing"></div>');
    }

    var AppFactory = require('!!..?application!./fixtures/app');
    app = AppFactory.create({
      rootElement: '#ember-testing'
    });

    app.setupForTesting();
    app.injectTestHelpers();
  });

  afterEach(function() {
    app.reset();
  });

  it('bootstraps initializers', function() {
    wait();
    andThen(function() {
      expect(app.__container__.lookup('data:main')).to.exist;
    });
  });

  it('bootstraps routers', function() {
    visit('greetings');
    andThen(function() {
      expect(currentRouteName()).to.eql('greetings');
    });
  });

  it('bootstraps templates', function() {
    expect(Ember.TEMPLATES).to.include.keys(
      'greetings',
      'index'
    );
    expect(Object.keys(Ember.TEMPLATES)).to.have.length(2);
  });

  it('renders a template', function() {
    visit('greetings');
    andThen(function() {
      expect(find('.greetings').text()).to.eql('Hello world!');
    });
  });

});
