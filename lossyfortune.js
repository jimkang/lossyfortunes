var translatron = require('./translatron');
var _ = require('lodash');
var Twit = require('twit');

function postLossyFortune(opts) {
  // lossyFortuneMaker should be a curried makeLossyFortune that already has 
  // `fortune` and `lossyTranslate` defined. 
  opts.lossyFortuneMaker({
    done: postToTwitter
  });

  function postToTwitter(error, fortune) {
    if (typeof fortune !== 'string' || fortune.length < 1) {
      opts.logger.log(
        'Failed to post:', fortune, 'at:', opts.date, 'Error:', error
      );
      opts.done(error);
    }
    else {
      opts.logger.log(opts.date, 'Posting fortune:', fortune, 'error:', error);

      function runTwit() {
        opts.twit.post('statuses/update', {
            status: fortune
          },
          function recordTweetResult(error, reply) {
            opts.logger.log(
              new Date(), 'Twitter response:', 
              _.pick(reply, 'created_at', 'id', 'text', 'truncated'), 
              'error:', error
            );
            opts.done(error, reply);
          }
        );     
      }

      var delay = 0;
      if (opts.config && opts.config.twitter && 
        opts.config.twitter.twitterDelay) {
        
        delay = opts.config.twitter.twitterDelay;
      }

      setTimeout(runTwit, delay);
    }
  }
}

function runLossyFortune(opts) {
  var lossyFortuneMaker = opts.masala(translatron.makeLossyFortune, {
    fortuneSource: opts.fortuneSource,
    lossyTranslate: opts.lossyTranslate
  });

  var postFortuneOpts = _.defaults(
    _.pick(opts, 'twit', 'logger', 'date', 'done', 'config'), 
    {
      lossyFortuneMaker: lossyFortuneMaker,
      twit: new Twit(opts.config.twitter),
      logger: console,
      date: new Date(),
      done: function noOp() {}
    }
  );

  module.exports.postLossyFortune(postFortuneOpts);
}

module.exports = {
  runLossyFortune: runLossyFortune,
  postLossyFortune: postLossyFortune
};
