'use strict';

var SearchUi = require('../assets/js/search-ui.js');
var chai = require('chai');
var expect = chai.expect;

chai.should();

describe('SearchUi', function() {
  var searchUi, doc, searchForm,
      searchInput, searchResults, // eslint-disable-line no-unused-vars
      makeElement, createdElements, createKeyboardShortcutEvent;

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

  // Per: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/
  //
  // Oddly, in Chrome, the only element set by the constructor is `code`.
  // Since `KeyboardEvent.code` is the "correct" way to detect the key
  // according to the latest standards, this is enough for the tests to pass
  // on Chrome.
  //
  // However, Safari honors the constructor, but _doesn't_ set `code`. Hence,
  // we need to force-override KeyboardEvent.keyCode as seen below.
  //
  // And PhantomJS currently doesn't support Event constructors at all:
  // https://github.com/ariya/phantomjs/issues/11289
  // Nor does it permit KeyboardEvent.keyCode to be redefined.
  //
  // What gives? It's just a stupid keydown event!
  createKeyboardShortcutEvent = function() {
    var keyboardEvent;

    if (global.window._phantom) {
      keyboardEvent = doc.createEvent('KeyboardEvent');
      keyboardEvent.initKeyboardEvent('keydown', true, true, global.window);
      keyboardEvent.code = SearchUi.GLOBAL_SHORTCUT_KEY_CODE;
      return keyboardEvent;
    }

    keyboardEvent = new global.window.KeyboardEvent('keydown', {
      code: SearchUi.GLOBAL_SHORTCUT_KEY_CODE
    });

    if (!keyboardEvent.code) {
      delete keyboardEvent.keyCode;
      Object.defineProperty(keyboardEvent, 'keyCode', {
        configurable: false,
        enumerable: true,
        value: SearchUi.GLOBAL_SHORTCUT_KEY_NUMERIC_CODE
      });
    }
    return keyboardEvent;
  };

  it('shouldn\'t respond to shortcut before registration', function() {
    var shortcutEvent = createKeyboardShortcutEvent();
    searchUi.inputElement.blur();
    searchUi.inputElement.value = 'foobar';
    doc.body.dispatchEvent(shortcutEvent);
    doc.activeElement.should.not.eql(searchUi.inputElement);
    doc.getSelection().toString().should.eql('');
  });

  it('should respond to global shortcut after registration', function() {
    var shortcutEvent = createKeyboardShortcutEvent();
    searchUi.enableGlobalShortcut();
    searchUi.inputElement.blur();
    searchUi.inputElement.value = 'foobar';
    doc.body.dispatchEvent(shortcutEvent);
    doc.activeElement.should.eql(searchUi.inputElement);
    doc.getSelection().toString().should.eql('foobar');
  });
});
