'use strict';

var mergeOptions = require('../assets/js/merge-options');
var chai = require('chai');
var expect = chai.expect;

chai.should();

describe('mergeOptions', function() {
  var defaults, options, result;

  before(function() {
    defaults = { foo: 1, bar: 2, baz: 3 };
  });

  beforeEach(function() {
    result = {};
  });

  it('should merge if all property names are known', function() {
    options = { foo: 4, bar: undefined, baz: null };
    mergeOptions(defaults, options, result);
    result.should.eql({ foo: 4, bar: 2, baz: null });
  });

  it('should throw if property names are unknown', function() {
    options = { foo: 4, quux: 0, baz: 5, xyzzy: 0 };
    expect(function() { mergeOptions(defaults, options, result); }).to.throw(
      'options object contains unknown properties:\n  quux\n  xyzzy');
  });
});
