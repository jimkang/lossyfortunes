function postLossyFortune(opts) {
  opts.lossyFortuneMaker(postToTwitter);

  function postToTwitter(error, fortune) {
    if (error) {
      opts.logger.log(
        'Failed to post:', fortune, 'at:', opts.date, 'Error:', error
      );
      opts.done(error);
    }
    else {
      opts.logger.log(opts.date, 'Posting fortune:', fortune);

      opts.twit.post('statuses/update', {
          status: fortune
        },
        function recordTweetResult(error, reply) {
          opts.logger.log(
            new Date(), 'Posted fortune:', fortune, 'Twitter response:', 
            reply, 'error:', error
          );
          opts.done(error, reply);
        }
      );
    }
  }
}

module.exports = postLossyFortune;
