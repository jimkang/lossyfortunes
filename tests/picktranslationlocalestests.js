var assert = require('assert');
var translationLocales = require('../translationLocales');
var pickTranslationLocales = require('../pickTranslationLocales');

describe('pickTranslationLocales', function pickTranslationLocalesSuite() {
  var locales = translationLocales;
  var localeCount = locales.length;
  assert.ok(localeCount >= 3, 
    'This suite cannot handle a locale list that is shorter than three locales.'
  );

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
  it('on day last day should return an array with last and first locales', function test24() {
    debugger;
    assert.deepEqual(
      pickTranslationLocales(new Date(2014, 9, localeCount, 8, 15, 0, 0), locales, 1),
      [locales[localeCount - 1], locales[0]]
    );
  });
  it('on the day after the total number of locales, should return an array with locales 0 and 2', function test25() {
    assert.deepEqual(
      pickTranslationLocales(new Date(2014, 9, localeCount + 1, 22, 15, 0, 0), locales, 1),
      [locales[0], locales[2]]
    );
  });
  it('two days after the total number of locales, should return an array with locales 1 and 3', function test26() {
    assert.deepEqual(
      pickTranslationLocales(new Date(2014, 9, localeCount + 2, 11, 15, 0, 0), locales, 1),
      [locales[1], locales[3]]
    );
  });

});
