var assert = require('assert');
var translationLocales = require('../translationLocales');
var pickTranslationLocales = require('../pickTranslationLocales');
var sinon = require('sinon');
var postLossyFortune = require('../postLossyFortune');

describe('postLossyFortune', function postLossyFortuneSuite() {
  var locales = translationLocales;

  it('should post a fortune and do all the associated things',
    function basicTest(testDone) {
      var translateChainResult = 'Dr. Wiley is a bonus feline friend.';

      var lossyFortuneMakerStub = sinon.stub()
        .callsArgWith(0, null, translateChainResult);
      // var lossyFortuneMakerSpy = sinon.spy(lossyFortuneMakerStub);

      var mockLogger = {
        log: sinon.stub()
      };

      var mockTwit = {
        post: sinon.stub().callsArgWith(2, null, 'posted!')
      };

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

        assert.ok(mockLogger.log.calledWith(
          opts.date, 'Posting fortune:', translateChainResult
        ));
        assert.ok(
          mockTwit.post.calledWith('statuses/update', {
            status: translateChainResult
          })
        );
        assert.ok(mockLogger.log.calledWith(sinon.match.date, 'Posted fortune:', 
          translateChainResult, 'Twitter response:', 'posted!', 'error:', null)
        );
        
        assert.equal(postResult, 'posted!');
        testDone();
      }
    }
  );

});
