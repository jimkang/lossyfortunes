var assert = require('assert');
var clockworkPair = require('../clockworkPair');

describe('clockworkPair', function clockworkPairSuite() {
  describe('upperLimit 8', function upperLimit8Suite() {
    it('for seed 0 should return [0, 1]', function test0() {
      assert.deepEqual(clockworkPair(8, 0), [0, 1]);
    });

    it('for seed 1 should return [1, 2]', function test1() {
      assert.deepEqual(clockworkPair(8, 0), [0, 1]);
    });

    it('for seed 6 should return [6, 7]', function test6() {
      assert.deepEqual(clockworkPair(8, 6), [6, 7]);
    });

    it('for seed 7 should return [7, 0]', function test7() {
      assert.deepEqual(clockworkPair(8, 7), [7, 0]);
    });

    it('for seed 8 should return [0, 2]', function test7() {
      assert.deepEqual(clockworkPair(8, 8), [0, 2]);
    });

    it('for seed 13 should return [5, 7]', function test13() {
      assert.deepEqual(clockworkPair(8, 13), [5, 7]);
    });

    it('for seed 15 should return [7, 1]', function test15() {
      assert.deepEqual(clockworkPair(8, 15), [7, 1]);
    });

    it('for seed 54 should return [6, 5]', function test54() {
      assert.deepEqual(clockworkPair(8, 54), [6, 5]);
    });

    it('for seed 55 should return [7, 6]', function test55() {
      assert.deepEqual(clockworkPair(8, 55), [7, 6]);
    });

    it('for seed 56 should return [0, 0]', function test56() {
      assert.deepEqual(clockworkPair(8, 56), [0, 0]);
    });

    it('for seed 101 should return [5, 10]', function test101() {
      // base: 5
      // gap: 12 + 1 => 5
      assert.deepEqual(clockworkPair(8, 101), [5, 10]);
    });
  });

  describe('upperLimit 31', function upperLimit31Suite() {
    it('for seed 0 should return [0, 1]', function test0() {
      assert.deepEqual(clockworkPair(31, 0), [0, 1]);
    });

    it('for seed 1 should return [1, 2]', function test1() {
      assert.deepEqual(clockworkPair(31, 0), [0, 1]);
    });

    it('for seed 6 should return [6, 7]', function test6() {
      assert.deepEqual(clockworkPair(31, 6), [6, 7]);
    });

    it('for seed 7 should return [7, 8]', function test7() {
      assert.deepEqual(clockworkPair(31, 7), [7, 8]);
    });

    it('for seed 13 should return [13, 14]', function test13() {
      assert.deepEqual(clockworkPair(31, 13), [13, 14]);
    });

    it('for seed 15 should return [15, 16]', function test15() {
      assert.deepEqual(clockworkPair(31, 15), [15, 16]);
    });

    it('for seed 54 should return [23, 25]', function test54() {
      assert.deepEqual(clockworkPair(31, 54), [23, 25]);
    });

    it('for seed 55 should return [24, 26]', function test55() {
      assert.deepEqual(clockworkPair(31, 55), [24, 26]);
    });

    it('for seed 101 should return [8, 4]', function test101() {
      // base: 8
      // gap: 3 + 1
      assert.deepEqual(clockworkPair(31, 101), [8, 12]);
    });
  });

});

describe('pickTranslationLocales', function pickTranslationLocalesSuite() {
  // An array of 24 elements.
  var locales = [
    'ar', // Arabic
    'zh-CHS', //Chinese Simplified
    'nl', // Dutch
    'fi', // Finnish
    'fr', // French
    'de', // German
    'el', // Greek
    'ht', // Haitian Creole
    'he', // Hebrew
    'hi', // Hindi
    'mww', //Hmong Daw
    'id', // Indonesian
    'ja', // Japanese
    'ko', // Korean
    'ms', // Malay
    'fa', // Persian
    'pl', // Polish
    'ro', // Romanian
    'ru', // Russian
    'es', // Spanish
    'sv', // Swedish
    'th', // Thai
    'tr', // Turkish
    'ur', // Urdu
  ];

  describe('AM', function amSuite() {
    it('on day 1 should return an array with locale 1', function test1() {
      assert.deepEqual(
        pickTranslationLocales(new Date(2014, 9, 1, 8, 30, 0, 0), locales),
        [locales[0]]
      );
    });
    it('on day 2 should return an array with locale 2', function test2() {
      assert.deepEqual(
        pickTranslationLocales(new Date(2014, 9, 2, 8, 30, 0, 0), locales),
        [locales[1]]
      );
    });
    it('on day 24 should return an array with locale 24', function test24() {
      assert.deepEqual(
        pickTranslationLocales(new Date(2014, 9, 24, 8, 30, 0, 0), locales),
        [locales[23]]
      );
    });
    it('on day 25 should return an array with locale 1', function test25() {
      assert.deepEqual(
        pickTranslationLocales(new Date(2014, 9, 25, 8, 30, 0, 0), locales),
        [locales[24]]
      );
    });
    it('on day 26 should return an array with locale 2', function test26() {
      assert.deepEqual(
        pickTranslationLocales(new Date(2014, 9, 26, 8, 30, 0, 0), locales),
        [locales[25]]
      );
    });
  });

  describe('PM', function pmSuite() {
    it('on day 1 should return an array with locales 1 and 2', function test1() {
      assert.deepEqual(
        pickTranslationLocales(new Date(2014, 9, 1, 22, 15, 0, 0), locales),
        [locales[0], locales[1]]
      );
    });
    it('on day 2 should return an array with locales 2 and 3', function test2() {
      assert.deepEqual(
        pickTranslationLocales(new Date(2014, 9, 2, 22, 15, 0, 0), locales)
        [locales[1], locales[2]]
      );
    });
    it('on day 24 should return an array with locales 24 and 1', function test24() {
      assert.deepEqual(
        pickTranslationLocales(new Date(2014, 9, 24, 22, 15, 0, 0), locales)
        [locales[23], locales[0]]
      );
    });
    it('on day 25 should return an array with locales 1 and 3', function test25() {
      assert.deepEqual(
        pickTranslationLocales(new Date(2014, 9, 25, 22, 15, 0, 0), locales)
        [locales[0], locales[2]]
      );
    });
    it('on day 26 should return an array with locales 2 and 4', function test26() {
      assert.deepEqual(
        pickTranslationLocales(new Date(2014, 9, 26, 22, 15, 0, 0), locales)
        [locales[1], locales[3]]
      );
    });
  });

});
