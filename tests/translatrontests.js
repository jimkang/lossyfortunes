var assert = require('assert');
var translatron = require('../translatron');
var locales = require('../translationLocales');
var sinon = require('sinon');
var _ = require('lodash');

describe('makeLossyRetranslation', function makeLossyRetranslationSuite() {
  var targetText = 'Dr. Wily is a friend of Bonus Cat';
  var day25Locales = [locales[0], locales[2]]
  var day25Date = new Date(2014, 9, 25, 22, 15, 0, 0);

  function createMakeLossyRetranslationOpts(overrides) {
    var pickTranslationLocalesStub = sinon.stub();
    pickTranslationLocalesStub.returns(day25Locales);

    var translatorStub = sinon.stub();

    return _.defaults(overrides ? overrides : {}, {
      pickTranslationLocales: pickTranslationLocalesStub,
      translator: translatorStub,
      text: targetText,
      baseLocale: 'en',
      locales: locales,
      date: day25Date
    });
  }

  it('should return text', function basicTest(testDone) {
    function translateChainStub(opts) {
      checkTranslateChainOpts(opts);

      setTimeout(function mockDone() {
        opts.done(null, 'Dr. Wiley is a friend bonus cat');
      }, 
      0);
    }

    var opts = createMakeLossyRetranslationOpts({
      translateChain: translateChainStub,
      done: checkRetranslationResult
    });

    translatron.makeLossyRetranslation(opts);

    function checkTranslateChainOpts(value) {
      var errorPrefix = 'translateChain called with incorrect ';

      assert.equal(value.translator, opts.translator, errorPrefix + 'translator');
      assert.equal(value.text, targetText, errorPrefix + 'text');
      assert.deepEqual(value.locales, day25Locales, errorPrefix + 'locales');
    }

    function checkRetranslationResult(error, retranslation) {
      assert.ok(!error, error);

      assert.ok(opts.pickTranslationLocales.calledWith(opts.date, locales),
        'pickTranslationLocales not called.');

      assert.equal(retranslation, 'Dr. Wiley is a friend bonus cat');
      testDone();      
    }
  });

  it('should not return text if there was a translateChain failure',
    function translateChainFailureTest(testDone) {
      function translateChainStub(opts) {
        setTimeout(function mockDone() {
          opts.done('There was an error in the chain', 'PI PI PI');
        }, 
        0);
      }

      var opts = createMakeLossyRetranslationOpts({
        translateChain: translateChainStub,
        done: checkRetranslationResult
      });

      translatron.makeLossyRetranslation(opts);

      function checkRetranslationResult(error, retranslation) {
        assert.ok(error, 'There should have been an error.');
        assert.equal(retranslation, undefined);
        testDone();
      }
    }
  );
});

describe('translateChain', function translateChainSuite() {
  it('should call translate once for each locale',
    function testOne(testDone) {
      var translateCount = 0;
      function translatorStub(params, translateDone) {
        assert.equal(typeof params.text, 'string');
        assert.equal(typeof params.from, 'string');
        assert.equal(typeof params.to, 'string');

        var translation;
        if (translateCount === 0) {
          translation = '威利博士是奖金猫的朋友。';
        }
        else if (translateCount === 1) {
          translation = 'Tohtori Wiley on bonus kissan ystävä.';
        }
        else {
          translation = 'Dr. Wiley is a bonus feline friend.';
        }

        translateCount += 1;

        setTimeout(function callDone() {
          // console.log('Returning translation:', translation);
          translateDone(null, translation);
        },
        0);
      }

      var opts = {
        translator: translatorStub,
        text: 'Dr. Wily is a friend of Bonus Cat.',
        locales: ['en', 'zh-CHS', 'fi', 'en'],
        done: checkTranslateChainResult
      };

      var translatorSpy = sinon.spy(opts, 'translator');

      translatron.translateChain(opts);

      function checkTranslateChainResult(error, finalTranslation) {
        assert.ok(!error, error);
        assert.ok(translatorSpy.calledThrice);
        assert.equal(finalTranslation, 'Dr. Wiley is a bonus feline friend.');
        testDone();
      }
    }
  );

  it('should not return a translation if one of the locales is invalid',
    function testInvalid(testDone) {
      var translateCount = 0;
      function translatorStub(params, translateDone) {
        var translation;
        if (translateCount === 0) {
          translation = '威利博士是奖金猫的朋友。';
        }
        else if (translateCount === 1) {
          translation = undefined;
        }
        else {
          translation = 'Dr. Wiley is a bonus feline friend.';
        }
        
        translateCount += 1;

        setTimeout(function callDone() {
          if (translation) {
            translateDone(null, translation);
          }
          else {
            translateDone('Could not translate ' + params.text + ' to ' + 
              params.to);
          }
        },
        0);
      }

      var opts = {
        translator: translatorStub,
        text: 'Dr. Wily is a friend of Bonus Cat.',
        locales: ['en', 'zh-CHS', 'smidgeo', 'en'],
        done: checkTranslateChainResult
      };
      var translatorSpy = sinon.spy(opts, 'translator');
      translatron.translateChain(opts);

      function checkTranslateChainResult(error, finalTranslation) {
        assert.ok(error, 'Error should not be null');
        assert.ok(translatorSpy.calledTwice);
        assert.equal(finalTranslation, '威利博士是奖金猫的朋友。', 
          'Final translation should be the last successful translation in the chain');
        testDone();
      }
    }
  );
});

describe('makeLossyFortune', function makeLossyFortuneSuite() {
  it('should generate a lossy fortune',
    function basicTest(testDone) {
      var fortuneText = 'If it don\'t make dollars, it don\'t make sense!';
      var lossyTranslation = 'If you do not make dollars, it does not make any sense!'

      var mockFortuneMaker = {
        fortune: function mockFortune() {
          return fortuneText;
        }
      };

      var fortuneSpy = sinon.spy(mockFortuneMaker, 'fortune');
      var makeLossyRetranslationStub = sinon.stub();
      makeLossyRetranslationStub.callsArgWith(1, null, lossyTranslation);

      var opts = {
        fortuneSource: mockFortuneMaker, 
        lossyTranslate: makeLossyRetranslationStub,
        done: checkLossyFortune
      };

      translatron.makeLossyFortune(opts);      

      function checkLossyFortune(error, lossyFortune) {
        assert.ok(!error, error);
        assert.ok(fortuneSpy.calledOnce);
        assert.ok(
          makeLossyRetranslationStub.calledWith(fortuneText, checkLossyFortune)
        );
        assert.equal(lossyFortune, lossyTranslation);
        testDone();
      }
    }
  );
});

