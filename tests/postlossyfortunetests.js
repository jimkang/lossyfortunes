var assert = require('assert');
var translationLocales = require('../translationLocales');
var pickTranslationLocales = require('../pickTranslationLocales');
var sinon = require('sinon');
var postLossyFortune = require('../postLossyFortune');

describe('postLossyFortune', function postLossyFortuneSuite() {
  var locales = translationLocales;

  it('should post a fortune and do all the associated things',
    function basicTest(testDone) {
      var fortuneText = 'Dr. Wily is a friend of Bonus Cat';
      var translateChainResult = 'Dr. Wiley is a bonus feline friend.';

      var lossyFortuneMakerStub = sinon.stub()
        .callsArgWith(0, null, translateChainResult);
      var lossyFortuneMakerSpy = sinon.spy(lossyFortuneMakerStub);

      var mockLogger = {
        log: sinon.stub()
      };
      var logSpy = sinon.spy(mockLogger.log);

      var mockTwit = {
        post: sinon.stub().returns('OK')
      };
      var twitPostSpy = sinon.spy(mockTwit.post);

      var opts = {
        lossyFortuneMaker: lossyFortuneMakerStub,
        twit: mockTwit,
        logger: mockLogger,
        date: new Date(2014, 9, 1, 22, 15, 0, 0),
        done: checkResult
      };

      postLossyFortune(opts);

      function checkResult(error, postResult) {
        assert.ok(!error, error);

        assert.ok(lossyFortuneMakerSpy.called);
        assert.ok(
          logSpy.calledWith(date, baseLocale, locales, translateChainResult)
        );
        assert.ok(
          twitPostSpy.calledWith('statuses/update', translateChainResult)
        );
        assert.ok(logSpy.calledWith(translateChainResult, sinon.match.date));
        
        assert.equal('postResult', 'OK');
        testDone();
      }
    }
  );

});
