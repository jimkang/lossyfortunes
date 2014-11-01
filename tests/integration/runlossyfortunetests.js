var assert = require('assert');
var translationLocales = require('../../translationLocales');
var pickTranslationLocales = require('../../pickTranslationLocales');
var sinon = require('sinon');
var translatron = require('../../translatron');
var fortune = require('fortune-tweetable');
var lossyfortune = require('../../lossyfortune');
var Twit = require('twit');
var _ = require('lodash');
var MSTranslator = require('mstranslator');
var boss = require('../../behaviors/boss');

describe('runLossyFortune', function runLossyFortuneSuite() {

  it('should build a fortune maker and use it to call postLossyFortune',
    function basicTest(testDone) {
      var translateChainResult = 'Dr. Wiley is a bonus feline friend.';

      // Not specifying every opts so that runLossyFortune can fill in some 
      // of them with defaults.
      var opts = {
        twit: {},
        // translator: sinon.stub(),
        // logger: {},
        locales: translationLocales,
        date: new Date(2014, 9, 1, 22, 15, 0, 0),
        config: require('../../configs/config')
      };

      var lossyTranslateStub = sinon.stub();
      var fortuneMakerStub = sinon.stub();

      opts.masala = sinon.stub();
      opts.masala.onCall(0).returns(lossyTranslateStub)
      opts.masala.onCall(1).returns(fortuneMakerStub);

      var postLossyFortuneStub = sinon.stub(lossyfortune, 'postLossyFortune');

      boss.$.lossyfortune.runLossyFortune({
        context: opts,
        params: opts
      });

      function checkMakeLossyRetranslationOpts(value) {
        // runLossyFortune should fill in unspecified `translator` with a 
        // default.
        return typeof value.translateChain === 'function' &&
          typeof value.pickTranslationLocales === 'function' &&
          typeof value.translator === 'function' &&
          value.baseLocale === 'en' &&
          _.isEqual(value.locales, translationLocales) &&
          value.date === opts.date;
      }

      function checkMakeLossyFortuneOpts(value) {
        return typeof value.fortuneSource === 'object' &&
          'fortune' in value.fortuneSource &&
          value.lossyTranslate === lossyTranslateStub;
      }

      function checkPostLossyFortuneOpts(value) {
        var errorPrefix = 'postLossyFortune called with incorrect ';

        assert.deepEqual(value.lossyFortuneMaker, fortuneMakerStub, 
          errorPrefix + 'lossyFortuneMaker');
        assert.deepEqual(value.twit, opts.twit, errorPrefix + 'twit');
        assert.deepEqual(typeof value.logger, 'object', errorPrefix + 'logger');
        assert.deepEqual(typeof value.logger.log, 'function', errorPrefix + 
          'logger');
        assert.ok(value.date instanceof Date);
      }

      setTimeout(function checkSpies() {
        assert.ok(
          opts.masala.calledWith(translatron.makeLossyRetranslation, 
            sinon.match(checkMakeLossyRetranslationOpts)),
          'masala was not called correctly for makeLossyRetranslation:\n' + 
            opts.masala.getCall(0)
        );

        assert.ok(
          opts.masala.calledWith(translatron.makeLossyFortune, 
            sinon.match(checkMakeLossyFortuneOpts)),
          'masala was not called correctly for makeLossyFortune:\n' + 
            JSON.stringify(opts.masala.getCall(1).args)
        );

        assert.ok(postLossyFortuneStub.called, 'postLossyFortune not called!');
        checkPostLossyFortuneOpts(postLossyFortuneStub.getCall(0).args[0]);

        postLossyFortuneStub.restore();
        testDone();
      },
      100);
    }
  );

  it('should call done',
    function doneTest(testDone) {
      var opts = {
        twit: {
          post: function postStub(path, opts, twitDone) {
            setTimeout(function callTwitDone() {
              twitDone(null, 'Mock post done.');
            });
          }
        },
        locales: translationLocales,
        date: new Date(2014, 9, 1, 22, 15, 0, 0),
        config: require('../../configs/config'),
        done: runLossyFortuneDone
      };

      opts.masala = sinon.stub();
      opts.masala.onCall(1).returns(function mockLossyFortuneMaker(opts) {
        setTimeout(function callDone() {
          opts.done(null, 'Your test will pass.');
        },
        0);
      });

      boss.$.lossyfortune.runLossyFortune({
        context: opts,
        params: opts
      });

      function runLossyFortuneDone(error) {
        assert.ok(!error, 'done should not have been called with an error.');
        testDone();
      }
    }
  );

  it('should use a fortune maker with a custom fortuneSource',
    function fortuneSourceTest(testDone) {
      var customSource = {
        fortune: sinon.stub()
      };

      var opts = {
        twit: {},
        locales: translationLocales,
        date: new Date(2014, 9, 1, 22, 15, 0, 0),
        fortuneSource: customSource,
        config: require('../../configs/config')
      };

      opts.masala = sinon.stub();
      opts.masala.onCall(1).returns(sinon.stub());

      boss.$.lossyfortune.runLossyFortune({
        context: opts, 
        params: opts
      });

      function checkMakeLossyFortuneOpts(value) {
        return value.fortuneSource === customSource;
      }

      setTimeout(function checkSpies() {
        assert.ok(
          opts.masala.calledWith(translatron.makeLossyFortune, 
            sinon.match(checkMakeLossyFortuneOpts)),
          'masala was not called correctly for makeLossyFortune:\n' + 
            JSON.stringify(opts.masala.getCall(1).args)
        );
        testDone();
      },
      100);
    }
  );

});
