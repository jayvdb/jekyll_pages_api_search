'use strict';

var SearchUi = require('../assets/js/search-ui');
var createKeyboardShortcutEvent = require('./create-keyboard-shortcut-event');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

chai.should();

describe('SearchUi', function() {
  var searchUi, doc, searchForm,
      searchInput, searchResults, // eslint-disable-line no-unused-vars
      makeElement, createdElements, getSelection;

  beforeEach(function() {
    doc = global.document;
    createdElements = [];

    searchForm = makeElement('form', 'search-form', doc.body);
    searchInput = makeElement('input', SearchUi.DEFAULTS.inputElementId,
      searchForm);
    searchResults = makeElement('ol', SearchUi.DEFAULTS.searchResultsId,
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
    expect(searchUi.inputElement).to.equal(searchInput);
    expect(searchUi.resultsElement).to.equal(searchResults);
    searchUi.emptyResultsMessagePrefix.should.eql(
      SearchUi.DEFAULTS.emptyResultsMessagePrefix);
    searchUi.emptyResultsElementType.should.eql(
      SearchUi.DEFAULTS.emptyResultsElementType);
    searchUi.emptyResultsElementClass.should.eql(
      SearchUi.DEFAULTS.emptyResultsElementClass);
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

    expect(searchUi.inputElement).to.equal(altInput);
    expect(searchUi.resultsElement).to.equal(altResults);
    searchUi.emptyResultsMessagePrefix.should.eql('Zero results for:');
    searchUi.emptyResultsElementType.should.eql('div');
    searchUi.emptyResultsElementClass.should.eql('empty-results');
  });

  getSelection = function() {
    var elem = doc.activeElement;
    return elem.value ?
      elem.value.substring(elem.selectionStart, elem.selectionEnd) : '';
  };

  describe('enableGlobalShortcut', function() {
    beforeEach(function() {
      searchUi.inputElement.blur();
      searchUi.inputElement.value = 'foobar';
    });

    it('shouldn\'t respond to shortcut before registration', function() {
      var shortcutEvent = createKeyboardShortcutEvent(global.window, doc);
      doc.body.dispatchEvent(shortcutEvent);
      doc.activeElement.should.not.eql(searchUi.inputElement);
      getSelection().should.eql('');
    });

    it('should respond to global shortcut after registration', function() {
      var shortcutEvent = createKeyboardShortcutEvent(global.window, doc);
      searchUi.enableGlobalShortcut();
      doc.body.dispatchEvent(shortcutEvent);
      doc.activeElement.should.eql(searchUi.inputElement);
      getSelection().should.eql('foobar');
    });
  });

  describe('renderResults', function() {
    var renderResults, getEmptyResultsElement;

    beforeEach(function() {
      searchUi.inputElement.blur();
      searchUi.inputElement.value = 'foobar';
      renderResults = sinon.spy();
    });

    getEmptyResultsElement = function() {
      var elems = doc.getElementsByClassName(searchUi.emptyResultsElementClass),
          results = [],
          i;

      if (elems.length === 1) {
        return elems[0];
      }
      for (i = 0; i !== elems.length; ++i) {
        results[i] = elems[i];
      }
      return results;
    };

    it('should not render anything if the query is not present', function() {
      var searchResults = [];

      searchUi.renderResults('', searchResults, renderResults);
      getEmptyResultsElement().should.eql([]);
      doc.activeElement.should.not.eql(searchUi.inputElement);
      getSelection().should.eql('');
      renderResults.called.should.be.false;
    });

    it('should render the empty message if results are empty', function() {
      var searchResults = [],
          emptyResultsElement;

      searchUi.renderResults('foobar', searchResults, renderResults);

      emptyResultsElement = getEmptyResultsElement();
      emptyResultsElement.should.not.eql([]);
      createdElements.push(emptyResultsElement);
      emptyResultsElement.nodeName.should.eql('P');
      emptyResultsElement.childNodes[0].nodeValue.should.eql(
        searchUi.emptyResultsMessagePrefix + ' "foobar".');

      doc.activeElement.should.eql(searchUi.inputElement);
      getSelection().should.eql('foobar');
      renderResults.called.should.be.false;
    });

    it('should render the search results if present', function() {
      var searchResults = ['some', 'fake', 'results'];

      searchUi.renderResults('foobar', searchResults, renderResults);
      getEmptyResultsElement().should.eql([]);
      doc.activeElement.should.not.eql(searchUi.inputElement);
      getSelection().should.eql('');
      renderResults.called.should.be.true;
      renderResults.args.should.eql([
        ['foobar', searchResults, searchUi.doc, searchUi.resultsElement]
      ]);
    });
  });
});
