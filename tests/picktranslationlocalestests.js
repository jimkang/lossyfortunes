var assert = require('assert');
var translationLocales = require('../translationLocales');
var pickTranslationLocales = require('../pickTranslationLocales');

describe('pickTranslationLocales', function pickTranslationLocalesSuite() {
  // An array of 24 elements.
  var locales = translationLocales;
  assert.equal(locales.length, 24);

  it('on day 1 should return an array with locales 0 and 1', function test1() {
    assert.deepEqual(
      pickTranslationLocales(new Date(2014, 9, 1, 2, 15, 0, 0), locales, 1),
      [locales[0], locales[1]]
    );
  });
  it('on day 2 should return an array with locales 1 and 2', function test2() {
    assert.deepEqual(
      pickTranslationLocales(new Date(2014, 9, 2, 22, 15, 0, 0), locales, 1),
      [locales[1], locales[2]]
    );
  });
  it('on day 24 should return an array with locales 23 and 0', function test24() {
    debugger;
    assert.deepEqual(
      pickTranslationLocales(new Date(2014, 9, 24, 8, 15, 0, 0), locales, 1),
      [locales[23], locales[2]]
    );
  });
  it('on day 25 should return an array with locales 0 and 2', function test25() {
    assert.deepEqual(
      pickTranslationLocales(new Date(2014, 9, 25, 22, 15, 0, 0), locales, 1),
      [locales[0], locales[2]]
    );
  });
  it('on day 26 should return an array with locales 1 and 3', function test26() {
    assert.deepEqual(
      pickTranslationLocales(new Date(2014, 9, 26, 11, 15, 0, 0), locales, 1),
      [locales[1], locales[3]]
    );
  });

});
