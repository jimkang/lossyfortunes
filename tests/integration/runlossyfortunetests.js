var assert = require('assert');
var translationLocales = require('../../translationLocales');
var pickTranslationLocales = require('../../pickTranslationLocales');
var sinon = require('sinon');
var runLossyFortune = require('../../runLossyFortune');
var translatron = require('../../translatron');
var fortune = require('fortune-tweetable');
var postLossyFortune = require('../../postlossyfortune');

describe('runLossyFortune', function runLossyFortuneSuite() {

  it('should build a fortune maker and use it to call postLossyFortune',
    function basicTest(testDone) {
      var fortuneText = 'Dr. Wily is a friend of Bonus Cat';
      var translateChainResult = 'Dr. Wiley is a bonus feline friend.';

      var opts = {
        postLossyFortune: sinon.stub(),
        twit: {},
        translator: sinon.stub(),
        logger: {},
        locales: translationLocales,
        date: new Date(2014, 9, 1, 22, 15, 0, 0)
      };

      var lossyTranslateStub = sinon.stub();
      var fortuneMakerStub = sinon.stub();

      opts.masala = sinon.stub();
      opts.masala.onCall(0).returns(lossyTranslateStub)
      opts.masala.onCall(1).returns(fortuneMakerStub);

      runLossyFortune(opts);

      function checkMakeLossyRetranslationOpts(value) {
        return typeof value.translateChain === 'function' &&
          typeof value.pickTranslationLocales === 'function' &&
          value.translator === opts.translator //&&
          value.baseLocale === 'en' //&&
          _.isEqual(value.locales, translationLocales) &&
          value.date === opts.date;
      }

      function checkMakeLossyFortuneOpts(value) {
        return typeof value.fortuneSource === 'object' &&
          'fortune' in value.fortuneSource &&
          value.lossyTranslate === lossyTranslateStub;
      }

      setTimeout(function checkSpies() {
        assert.ok(
          opts.masala.calledWith(translatron.makeLossyRetranslation, 
            sinon.match(checkMakeLossyRetranslationOpts)),
          'masala was not called correctly for makeLossyRetranslation:\n' + 
            opts.masala.getCall(0)
        );

        assert.ok(
          opts.masala.calledWith(fortune, lossyTranslateStub),
          'masala was not called correctly for makeLossyFortune:' + 
            opts.masala.getCall(1)
        );

        assert.ok(opts.postLossyFortune.called, 
          'postLossyFortune was not called.'
        );

        testDone();
      },
      100);

    }
  );

});
