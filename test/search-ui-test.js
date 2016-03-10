'use strict';

var SearchUi = require('../assets/js/search-ui.js');
var chai = require('chai');
var expect = chai.expect;

chai.should();

describe('SearchUi', function() {
  var searchUi, doc, searchForm,
      searchInput, searchResults, // eslint-disable-line no-unused-vars
      makeElement, createdElements;

  beforeEach(function() {
    doc = global.document;
    createdElements = [];

    searchForm = makeElement('form', 'search-form', doc.body);
    searchInput = makeElement('input', SearchUi.DEFAULT_SEARCH_INPUT_ID,
      searchForm);
    searchResults = makeElement('ol', SearchUi.DEFAULT_SEARCH_RESULTS_ID,
      doc.body);

    searchUi = new SearchUi(global.document);
  });

  afterEach(function() {
    createdElements.forEach(function(element) {
      element.parentNode.removeChild(element);
    });
  });

  makeElement = function(elementType, elementId, parentElement) {
    var element = doc.createElement(elementType);
    element.setAttribute('id', elementId);
    parentElement.appendChild(element);
    createdElements.push(element);
    return element;
  };

  it('should initialize with the default values', function() {
    doc.should.not.be.undefined;
    searchUi.doc.should.eql(global.document);
    expect(searchUi.inputElement).to.be.searchInput;
    expect(searchUi.resultsElement).to.be.searchResults;
    searchUi.emptyResultsMessagePrefix.should.eql(
      SearchUi.DEFAULT_EMPTY_RESULTS_MESSAGE_PREFIX);
    searchUi.emptyResultsElementType.should.eql(
      SearchUi.DEFAULT_EMPTY_RESULTS_ELEMENT_TYPE);
    searchUi.emptyResultsElementClass.should.eql(
      SearchUi.DEFAULT_EMPTY_RESULTS_ELEMENT_CLASS);
  });

  it('should initialize with optional values', function() {
    var altInput, altResults;  // eslint-disable-line no-unused-vars

    altInput = makeElement('input', 'alt-input', searchForm),
    altResults = makeElement('div', 'alt-results', doc.body);

    searchUi = new SearchUi(doc, {
      inputElementId: 'alt-input',
      searchResultsId: 'alt-results',
      emptyResultsMessagePrefix: 'Zero results for:',
      emptyResultsElementType: 'div',
      emptyResultsElementClass: 'empty-results'
    });

    expect(searchUi.inputElement).to.be.altInput;
    expect(searchUi.resultsElement).to.be.altResults;
    searchUi.emptyResultsMessagePrefix.should.eql('Zero results for:');
    searchUi.emptyResultsElementType.should.eql('div');
    searchUi.emptyResultsElementClass.should.eql('empty-results');
  });
});
