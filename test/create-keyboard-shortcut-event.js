// Per: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/
//
// Oddly, in Chrome, the only element set by the constructor is `code`.  Since
// `KeyboardEvent.code` is the "correct" way to detect the key according to the
// latest standards, this is enough for the tests to pass on Chrome.
//
// However, Safari honors the constructor, but _doesn't_ set `code`.  Hence, we
// need to force-override KeyboardEvent.keyCode as seen below.
//
// And PhantomJS currently doesn't support Event constructors at all:
// https://github.com/ariya/phantomjs/issues/11289
// Nor does it permit KeyboardEvent.keyCode to be redefined.
//
// What gives? It's just a stupid keydown event!

'use strict';

var SearchUi = require('../assets/js/search-ui');

module.exports = function(targetWindow, targetDoc) {
  var keyboardEvent;

  if (global.window._phantom) {
    keyboardEvent = targetDoc.createEvent('KeyboardEvent');
    keyboardEvent.initKeyboardEvent('keydown', true, true, targetWindow);
    keyboardEvent.code = SearchUi.DEFAULTS.globalShortcutKeyCode;
    return keyboardEvent;
  }

  keyboardEvent = new targetWindow.KeyboardEvent('keydown', {
    code: SearchUi.DEFAULTS.globalShortcutKeyCode
  });

  if (!keyboardEvent.code) {
    delete keyboardEvent.keyCode;
    Object.defineProperty(keyboardEvent, 'keyCode', {
      configurable: false,
      enumerable: true,
      value: SearchUi.DEFAULTS.globalShortcutKeyNumericCode
    });
  }
  return keyboardEvent;
};
