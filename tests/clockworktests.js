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
