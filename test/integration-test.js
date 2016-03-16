/* eslint-env browser, node */

'use strict';

var SearchUi = require('../assets/js/search-ui');
var createKeyboardShortcutEvent = require('./create-keyboard-shortcut-event');
var chai = require('chai');
var expect = chai.expect;

chai.should();

describe('Integration test', function() {
  var testFrame, frameDoc, shortcutEvent, searchInput, loadPageInFrame,
      searchResults;

  beforeEach(function() {
    testFrame = global.document.createElement('iframe');
    global.document.body.appendChild(testFrame);
  });

  afterEach(function() {
    global.document.body.removeChild(testFrame);
  });

  loadPageInFrame = function(pageNameAndQuery) {
    return new Promise(function(resolve) {
      testFrame.addEventListener('load', function() {
        var observer;

        frameDoc = testFrame.contentWindow.document;
        shortcutEvent = createKeyboardShortcutEvent(
          testFrame.contentWindow, frameDoc);
        searchInput = frameDoc.getElementById(
          SearchUi.DEFAULTS.inputElementId);
        searchResults = frameDoc.getElementById(
          SearchUi.DEFAULTS.searchResultsId);

        // Set observer to fire after the search logic has loaded the index,
        // executed the search, and updated the search results element.
        //
        // PhantomJS does all this before this point, hence the childNodes
        // check and pass-through to resolve() in the else clause.
        if (searchResults !== null && searchResults.childNodes.length === 0) {
          observer = new MutationObserver(function() {
            resolve(searchResults.childNodes);
          });
          observer.observe(searchResults, { childList: true });
        } else {
          resolve(searchResults ? searchResults.childNodes : []);
        }
      });
      testFrame.src = pageNameAndQuery;
    });
  };

  it('should load the bundle but not show results', function() {
    return loadPageInFrame('no-results-element.html?q=document')
      .then(function(searchResultNodes) {
        // There should be no search results at all, since the search results
        // element isn't present.
        expect(searchInput).to.not.be.null;
        expect(searchResults).to.be.null;
        expect(searchResultNodes).to.be.empty;

        // The global '/' shortcut should still work, though. The query text
        // won't get added to the search box, however.
        frameDoc.body.dispatchEvent(shortcutEvent);
        expect(frameDoc.activeElement).to.eql(searchInput);
        frameDoc.getSelection().toString().should.eql('');
      });
  });

  it('should load the bundle and show results', function() {
    return loadPageInFrame('with-results-element.html?q=document')
      .then(function(searchResultNodes) {
        // Expect the search results element to be present.
        expect(searchInput).to.not.be.null;
        expect(searchResults).to.not.be.null;

        // First make sure there are three search results and the anchor of
        // the first result received focus.
        searchResultNodes.length.should.eql(3);
        expect(frameDoc.activeElement).to.eql(
          searchResultNodes[0].childNodes[0]);

        // Now ensure the keypress puts the focus on the search box and
        // selects the pre-filled query text.
        frameDoc.body.dispatchEvent(shortcutEvent);
        expect(frameDoc.activeElement).to.eql(searchInput);
        frameDoc.getSelection().toString().should.eql('document');
      });
  });
});
