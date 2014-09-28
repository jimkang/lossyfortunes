var translatron = require('./translatron');
var pickTranslationLocales = require('./pickTranslationLocales');
var _ = require('lodash');
var Twit = require('twit');
var config = require('./config');
var fortune = require('fortune-tweetable');
var MSTranslator = require('mstranslator');
var masala = require('masala');

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
  }
}

function runLossyFortune(opts) {
  if (opts.config) {
    config = require('./' + opts.config);
  }

  var curryOpts = {
    translateChain: translatron.translateChain,
    pickTranslationLocales: pickTranslationLocales,
    translator: opts.translator,
    baseLocale: 'en',
    locales: opts.locales,
    date: opts.date
  };

  if (!curryOpts.translator) {
    var translatorObject = new MSTranslator(config.MSTranslator, true);
    curryOpts.translator = translatorObject.translate.bind(translatorObject);
  }

  if (!opts.masala) {
    opts.masala = masala;
  }

  var lossyTranslate = opts.masala(translatron.makeLossyRetranslation, 
    curryOpts);

  if (!opts.fortuneSource) {
    opts.fortuneSource = {
      fortune: function asyncFortune(done) {      
        setTimeout(function callback() {
          done(null, fortune.fortune());
        },
        0);
      }
    };
  }
  
  var lossyFortuneMaker = opts.masala(translatron.makeLossyFortune, {
    fortuneSource: opts.fortuneSource,
    lossyTranslate: lossyTranslate
  });

  var postFortuneOpts = _.defaults(
    _.pick(opts, 'twit', 'logger', 'date', 'done'), 
    {
      lossyFortuneMaker: lossyFortuneMaker,
      twit: new Twit(config.twitter),
      logger: console,
      date: new Date()
    }
  );

  module.exports.postLossyFortune(postFortuneOpts);
}

module.exports = {
  runLossyFortune: runLossyFortune,
  postLossyFortune: postLossyFortune
};
