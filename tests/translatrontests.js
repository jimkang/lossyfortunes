var assert = require('assert');
var translatron = require('../translatron');
var locales = require('../translationLocales');
var sinon = require('sinon');

describe('makeLossyRetranslation', function makeLossyRetranslationSuite() {
  var day25Locales = [locales[0], locales[2]]
  var day25Date = new Date(2014, 9, 25, 22, 15, 0, 0);

  var pickTranslationLocalesStub = sinon.stub();
  pickTranslationLocalesStub.returns(day25Locales);

  var translatorStub = sinon.stub();

  var translateChainStub = sinon.stub();
  translateChainStub.callsArgWith(3, null, 'Dr. Wiley is a friend bonus cat');

  it('should return text', function basicTest(testDone) {
    var targetText = 'Dr. Wily is a friend of Bonus Cat';
    var translatorStub = sinon.stub();

    var retranslationParams = {
      translateChain: translateChainStub,
      pickTranslationLocales: pickTranslationLocalesStub,
      translator: translatorStub,
      text: targetText,
      baseLocale: 'en',
      locales: locales,
      date: day25Date,
      done: checkRetranslationResult
    };

    translatron.makeLossyRetranslation(retranslationParams);

    function checkRetranslationResult(error, retranslation) {
      assert.ok(!error, error);

      assert.ok(pickTranslationLocalesStub.calledWith(day25Date, locales),
        'pickTranslationLocales not called.');

      assert.ok(translateChainStub.calledWith(
        translatorStub, targetText, day25Locales, checkRetranslationResult
      ), 'translateChain not called');

      assert.equal(retranslation, 'Dr. Wiley is a friend bonus cat');
      testDone();      
    }
  });

});

describe('translateChain', function translateChainSuite() {
  it('should call translate once for each locale',
    function testOne(testDone) {
      var translateCount = 0;
      function translatorStub(text, locale, translateDone) {
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
          console.log('Returning translation:', translation);
          translateDone(null, translation);
        },
        0);
      }

      var opts = {
        translator: translatorStub,
        text: 'Dr. Wily is a friend of Bonus Cat.',
        locales: ['zh-CHS', 'fi', 'en'],
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
      function translatorStub(text, locale, translateDone) {
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
            translateDone('Could not translate ' + text + ' to ' + locale);
          }
        },
        0);
      }

      var opts = {
        translator: translatorStub,
        text: 'Dr. Wily is a friend of Bonus Cat.',
        locales: ['zh-CHS', 'smidgeo', 'en'],
        done: checkTranslateChainResult
      };
      var translatorSpy = sinon.spy(opts, 'translator');

      translatron.translateChain(opts);

      function checkTranslateChainResult(error, finalTranslation) {
        assert.ok(error, 'Error should not be null');
        console.log('translatorSpy.callCount', translatorSpy.callCount);
        assert.ok(translatorSpy.calledTwice);
        assert.equal(finalTranslation, '威利博士是奖金猫的朋友。', 
          'Final translation sould be the last successful translation in the chain');
        testDone();
      }
    }
  );
});
