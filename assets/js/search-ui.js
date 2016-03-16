'use strict';

module.exports = SearchUi;

// eslint-disable-next-line
// based on https://github.com/angular/angular.js/blob/54ddca537/docs/app/src/search.js#L198-L206
function SearchUi(doc, options) {
  var opts = options || {};

  this.doc = doc;
  this.inputElement = doc.getElementById(
    opts.inputElementId || SearchUi.DEFAULTS.inputElementId);
  this.resultsElement = doc.getElementById(
    opts.searchResultsId || SearchUi.DEFAULTS.searchResultsId);
  this.emptyResultsMessagePrefix = opts.emptyResultsMessagePrefix ||
    SearchUi.DEFAULTS.emptyResultsMessagePrefix;
  this.emptyResultsElementType = opts.emptyResultsElementType ||
    SearchUi.DEFAULTS.emptyResultsElementType;
  this.emptyResultsElementClass = opts.emptyResultsElementClass ||
    SearchUi.DEFAULTS.emptyResultsElementClass;
  this.globalShortcutKey = opts.globalShortcutKey ||
    SearchUi.DEFAULTS.globalShortcutKey;
  this.globalShortcutKeyCode = opts.globalShortcutKeyCode ||
    SearchUi.DEFAULTS.globalShortcutKeyCode;
  this.globalShortcutKeyNumericCode = opts.globalShortcutKeyNumericCode ||
    SearchUi.DEFAULTS.globalShortcutKeyNumericCode;
}

SearchUi.DEFAULTS = {
  inputElementId: 'search-input',
  searchResultsId: 'search-results',
  emptyResultsMessagePrefix: 'No results found for',
  emptyResultsElementType: 'p',
  emptyResultsElementClass: 'search-empty',

  // Note that if any of these change, they must all change. It's the
  // responsibility of the caller to ensure they remain correct and in-sync.
  globalShortcutKey: '/',
  globalShortcutKeyCode: 'Slash',
  globalShortcutKeyNumericCode: 191
};

SearchUi.prototype.isForwardSlash = function(keyEvent) {
  // The former condition is more conformant; the latter for backward
  // compatibility (i.e. Safari).
  return keyEvent.code === this.globalShortcutKeyCode ||
    keyEvent.keyCode === this.globalShortcutKeyNumericCode;
};

function isInput(element) {
  return element.tagName.toLowerCase() === 'input';
}

SearchUi.prototype.enableGlobalShortcut = function() {
  var searchUi = this,
      doc = this.doc,
      inputElement = this.inputElement;

  doc.body.addEventListener('keydown', function(e) {
    if (searchUi.isForwardSlash(e) && !isInput(doc.activeElement)) {
      e.stopPropagation();
      e.preventDefault();
      inputElement.focus();
      inputElement.select();
    }
  }, false);
};

SearchUi.prototype.renderResults = function(query, results, renderResults) {
  if (!query) {
    return;
  }
  this.inputElement.value = query;

  if (results.length === 0) {
    this.createEmptyResultsMessage(query);
    this.inputElement.focus();
    return;
  }
  renderResults(query, results, this.doc, this.resultsElement);
};

SearchUi.prototype.createEmptyResultsMessage = function(query) {
  var item = this.doc.createElement(this.emptyResultsElementType),
      message = this.doc.createTextNode(
        this.emptyResultsMessagePrefix + ' "' + query + '".'),
      parentItem = this.resultsElement.parentElement;

  item.style.className = this.emptyResultsElementClass;
  item.appendChild(message);
  parentItem.insertBefore(item, this.resultsElement);
};
