'use strict';

var SearchEngine = require('../assets/js/search-engine');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

describe('SearchEngine', function() {
  var searchEngine;

  beforeEach(function() {
    searchEngine = new SearchEngine();
  });

  it('should initialize with the default values', function() {
    searchEngine.queryParam.should.eql(SearchEngine.DEFAULTS.queryParam);
  });

  it('should initialize with optional values', function() {
    searchEngine = new SearchEngine({ queryParam: 'query' });
    searchEngine.queryParam.should.eql('query');
  });

  it('should parse the query string from the URL', function() {
    searchEngine.parseSearchQuery('/search?q=foo+bar+baz')
      .should.eql('foo bar baz');
  });

  it('should fetch the index from the test site', function() {
    return searchEngine.fetchIndex('data/search-index.json').should.be.fulfilled
      .then(function(index) {
        index.urlToDoc.should.eql({
          '/foo': { url: '/foo', title: 'Foo' },
          '/bar': { url: '/bar', title: 'Bar' },
          '/baz': { url: '/baz', title: 'Baz' }
        });
      });
  });

  it('should execute a successful search', function() {
    return searchEngine.executeSearch('data/search-index.json',
      '/?q=second+example')
      .should.be.fulfilled.then(function(results) {
        results.query.should.eql('second example');

        // Since "example" appears in all three documents, we'll expect all
        // three to be returned, but `/bar` should rank at the top.
        results.results.length.should.eql(3);
        results.results[0].ref.should.eql('/bar');
      });
  });
});
