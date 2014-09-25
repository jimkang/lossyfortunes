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

      assert.equal(value.translator, opts.translator, 
        errorPrefix + 'translator');
      assert.equal(value.text, targetText, errorPrefix + 'text');

      var localesIncludingBase = day25Locales.slice();
      localesIncludingBase.unshift('en');
      localesIncludingBase.push('en');
      assert.deepEqual(value.locales, localesIncludingBase);
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

  it('should not return text if translateChain returns the same text that ' +
    'was passed in',
    function redundantTranslationTest(testDone) {
      function translateChainStub(opts) {
        setTimeout(function mockDone() {
          opts.done(null, targetText);
        }, 
        0);
      }

      var opts = createMakeLossyRetranslationOpts({
        text: targetText,
        translateChain: translateChainStub,
        done: checkRetranslationResult
      });

      translatron.makeLossyRetranslation(opts);

      function checkRetranslationResult(error, retranslation) {
        assert.equal(error, 'translateChain returned the original text.');
        assert.equal(retranslation, undefined);
        testDone();
      }
    }
  );  
});

describe('translateChain', function translateChainSuite() {
  var translateCount;

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

  function createOpts() {
    return {
      translator: translatorStub,
      text: 'Dr. Wily is a friend of Bonus Cat.',
      locales: ['en', 'zh-CHS', 'fi', 'en']
    };
  }

  it('should call translate once for each locale',
    function testTranslateCalls(testDone) {
      translateCount = 0;      

      var opts = createOpts();
      opts.done = checkTranslateChainResult;

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

  it('should call log to report each locale it translates to',
    function testLogs(testDone) {
      translateCount = 0;      

      var opts = createOpts();
      opts.logger = {
        log: sinon.stub()
      };
      opts.done = checkTranslateChainResult;

      translatron.translateChain(opts);

      function checkTranslateChainResult(error, finalTranslation) {
        assert.ok(!error, error);

        assert.ok(opts.logger.log.calledWith(
          'From:', 'en', 'To:', 'zh-CHS', 'Translation:', '威利博士是奖金猫的朋友。'
        ));
        assert.ok(opts.logger.log.calledWith(
          'From:', 'zh-CHS', 'To:', 'fi', 'Translation:', 
          'Tohtori Wiley on bonus kissan ystävä.'
        ));
        assert.ok(opts.logger.log.calledWith(
          'From:', 'fi', 'To:', 'en', 'Translation:', 
          'Dr. Wiley is a bonus feline friend.'
        ));

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
        fortune: function mockFortune(done) {
          setTimeout(function callDone() {
            done(null, fortuneText);
          },
          0);
        }
      };

      var fortuneSpy = sinon.spy(mockFortuneMaker, 'fortune');

      function makeLossyRetranslationStub(opts) {
        assert.equal(opts.text, fortuneText);
        assert.equal(opts.done, checkLossyFortune);

        setTimeout(function callDone() {
          opts.done(null, lossyTranslation);
        },
        0);
      }

      var opts = {
        fortuneSource: mockFortuneMaker, 
        lossyTranslate: makeLossyRetranslationStub,
        done: checkLossyFortune
      };

      translatron.makeLossyFortune(opts);      

      function checkLossyFortune(error, lossyFortune) {
        assert.ok(!error, error);
        assert.ok(fortuneSpy.calledOnce);
        assert.equal(lossyFortune, lossyTranslation);
        testDone();
      }
    }
  );
});

