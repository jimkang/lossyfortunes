var assert = require('assert');
var translationLocales = require('../translationLocales');
var pickTranslationLocales = require('../pickTranslationLocales');
// var masala = require('masala');
var sinon = require('sinon');
var postLossyFortune = require('../postLossyFortune');

describe('postLossyFortune', function postLossyFortuneSuite() {
  var locales = translationLocales;

  it('should post a fortune and do all the associated things',
    function basicTest(testDone) {
      var fortuneText = 'Dr. Wily is a friend of Bonus Cat';
      var translateChainResult = 'Dr. Wiley is a bonus feline friend.';

      var lossyTranslateStub = sinon.stub();
      var lossyTranslateSpy = sinon.spy(lossyTranslateStub);

      var masalaStub = sinon.stub().returns(lossyTranslateStub);
      var masalaSpy = sinon.spy(masalaStub);

      var makeLossyRetranslationStub = sinon.stub();
      var makeLossyRetranslationSpy = sinon.spy(makeLossyRetranslationStub);

      var fortuneSourceStub = sinon.stub().returns(fortuneText);

      var mockLogger = {
        log: sinon.stub()
      };
      var logSpy = sinon.spy(mockLogger.log);

      var mockTwit = {
        post: sinon.stub().returns('OK')
      };
      var twitPostSpy = sinon.spy(mockTwit.post);

      var opts = {
        config: null,
        date: new Date(2014, 9, 1, 22, 15, 0, 0),
        makeLossyFortune: sinon.stub().returns(translateChainResult),
        twit: mockTwit,
        logger: mockLogger,
        done: checkResult
      };

      postLossyFortune(opts);

      function checkResult(error, postResult) {
        assert.ok(!error, error);
        assert.ok(masalaSpy.calledWith(makeLossyRetranslationStub));
        assert.ok(lossyTranslateSpy.calledWith(
          fortuneSourceStub, lossyTranslateStub
        ));
        assert.ok(
          twitPostSpy.calledWith('statuses/update', translateChainResult)
        );
        assert.ok(logSpy.calledWith(date, baseLocale, locales, fortuneText));

        assert.equal('postResult', 'OK');
        testDone();
      }
    }
  );

});
