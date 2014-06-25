require('script!jquery/dist/jquery');
require('script!handlebars/handlebars');
require('script!ember/ember');
require('script!ember-data/ember-data');

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

  it('should load fixture route', function() {
    var route = require('!!../!./fixtures/route');
    expect(Object.keys(route)).to.have.length.of(1);
    expect(route.RouteIndexRoute).to.exist;
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

});

describe('apps', function() {

  it('should load fixutre simple', function() {
    var simple = require('!!../!./fixtures/simple');
    expect(simple.SimpleIndexRoute).to.exist;
  });

});
