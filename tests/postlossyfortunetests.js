var assert = require('assert');
var translationLocales = require('../translationLocales');
var pickTranslationLocales = require('../pickTranslationLocales');
var sinon = require('sinon');
var lossyfortune = require('../lossyfortune');
var _ = require('lodash');

describe('postLossyFortune', function postLossyFortuneSuite() {
  var locales = translationLocales;
  var translateChainResult = 'Dr. Wiley is a bonus feline friend.';

  function createPostLossyFortuneOpts(overrides) {
    return _.defaults(overrides ? overrides : {}, {
      lossyFortuneMaker: sinon.stub().callsArgWith(0, null, translateChainResult),
      twit: {
        post: sinon.stub().callsArgWith(2, null, 'posted!')
      },
      logger: {
       log: sinon.stub()
      },
      date: new Date(2014, 9, 1, 22, 15, 0, 0)
    });
  }

  it('should create a fortune, post it, and log it',
    function basicTest(testDone) {
      var opts = createPostLossyFortuneOpts({
        done: checkResult
      });

      lossyfortune.postLossyFortune(opts);

      function checkResult(error, postResult) {
        assert.ok(!error, error);

        assert.ok(opts.logger.log.calledWith(
          opts.date, 'Posting fortune:', translateChainResult
        ));
        assert.ok(
          opts.twit.post.calledWith('statuses/update', {
            status: translateChainResult
          })
        );
        assert.ok(opts.logger.log.calledWith(sinon.match.date, 'Posted fortune:', 
          translateChainResult, 'Twitter response:', 'posted!', 'error:', null)
        );
        
        assert.equal(postResult, 'posted!');
        testDone();
      }
    }
  );

  it('should post and log a fortune even if there was an error creating it',
    function fortuneCreatedWithErrorTest(testDone) {
      var translateError = 'Could not translate "Dr. Wily is a friend of Bonus Cat." to locale Smidgeo';
      var opts = createPostLossyFortuneOpts({
        lossyFortuneMaker: sinon.stub()
          .callsArgWith(0, translateError, translateChainResult),
        done: checkResult
      });

      lossyfortune.postLossyFortune(opts);

      function checkResult(error, postResult) {
        assert.ok(!error, error);

        assert.ok(opts.logger.log.calledWith(
          opts.date, 'Posting fortune:', translateChainResult, 
          'error:', translateError
        ));
        assert.ok(
          opts.twit.post.calledWith('statuses/update', {
            status: translateChainResult
          })
        );
        assert.ok(opts.logger.log.calledWith(sinon.match.date, 'Posted fortune:', 
          translateChainResult, 'Twitter response:', 'posted!', 'error:', null)
        );

        assert.equal(postResult, 'posted!');
        testDone();
      }
    }
  );

  it('should not post if lossyFortuneMaker failed to create a fortune');
});
