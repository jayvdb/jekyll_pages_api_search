'use strict';

if (global.Promise === undefined) {
  require('es6-promise').polyfill();
}

require('./merge-options-test.js');
require('./search-engine-test.js');
require('./search-ui-test.js');
require('./integration-test.js');
