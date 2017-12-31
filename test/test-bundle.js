/* This file gets browserified into test/index.js by `npm test`.
 */

'use strict';

// PhantomJS doesn't natively support Promises as of 2.1.1.
if (global.Promise === undefined) {
  require('es6-promise').polyfill();
}

require('./merge-options-test.js');
require('./search-engine-test.js');
require('./search-ui-test.js');
require('./integration-test.js');
