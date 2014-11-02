var wardboss = require('wardboss');
var boss = wardboss.createBoss('lossyboss');
var request = require('request');
var lossyfortune = require('../lossyfortune');
var fortune = require('fortune-tweetable');
var translatron = require('../translatron');
var pickTranslationLocales = require('../pickTranslationLocales');
var MSTranslator = require('mstranslator');
var masala = require('masala');
var homophonizer = require('homophonizer');
var queue = require('queue-async');
var _ = require('lodash');
var verseparser = require('../domains/bible/verseparser');
var translationLoggerModule = require('../loggers/translationlogger');
var tumblrLogPosterLib = require('../loggers/tumblrlogposter');

var phonemeHomophonizer = homophonizer.phoneme.createHomophonizer();

var tumblrLogPoster;

boss.addConstituent('lossyfortune');
boss.addConstituent('lossybible');
boss.addConstituent('phonemeHomophoneFortune');

boss.addFn({
  fn: lossyfortune.runLossyFortune,
  providers: {
    lossyfortune: provideRunLossyFortuneOpts,
    lossybible: provideRunLossyFortuneOptsForLossyBible,
    phonemeHomophoneFortune: provideRunOptsWithPhonemeHomophones
  }
});

// Providers

function provideRunLossyFortuneOpts(context, providerDone) {
  sendNextTick(_.defaults(context, {
    fortuneSource: {
      fortune: asyncFortune
    },
    lossyTranslate: getLossyTranslate(context),
  }),
  providerDone);
}

function provideRunLossyFortuneOptsForLossyBible(context, providerDone) {
  sendNextTick(_.defaults(context, {
    fortuneSource: {
      fortune: getFortuneFromBible,
    },
    lossyTranslate: getLossyTranslate(context)
  }),
  providerDone);
}

function provideRunOptsWithPhonemeHomophones(context, providerDone) {
  sendNextTick(_.defaults(context, {
    fortuneSource: {
      fortune: asyncFortune,
    },
    lossyTranslate: homophonizeTextWithPhonemes,
    masala: masala
  }),
  providerDone);
}

function getLossyTranslate(context) {
  var opts = context;

  function postLogsToTumblr(logs) {
    if (typeof opts.config.tumblr === 'object' && tumblrLogPoster) {      
      tumblrLogPoster.postEntries({
        logs: logs,
        config: opts.config.tumblr,
        done: function tumblrReportDone(error) {
          if (error) {
            console.log(error);
          }
          console.log('Report to Tumblr complete.');
        }
      });
    }
  }

  var curryOpts = {
    translateChain: translatron.translateChain,
    pickTranslationLocales: pickTranslationLocales,
    translator: opts.translator,
    baseLocale: 'en',
    locales: opts.locales,
    date: opts.date,
    logger: translationLoggerModule.createTranslationLogger(postLogsToTumblr)
  };

  if (!curryOpts.translator) {
    var translatorObject = new MSTranslator(opts.config.MSTranslator, true);
    curryOpts.translator = translatorObject.translate.bind(translatorObject);
  }

  if (!opts.masala) {
    opts.masala = masala;
  }

  return opts.masala(
    translatron.makeLossyRetranslation, curryOpts
  );
}

function homophonizeTextWithPhonemes(opts) {
  var q = queue();
  var words = opts.text.split(' ');
  words.forEach(function queueTranslation(word) {
    var word = word.replace(/[\.\-\,\?]/g, '');
    console.log('queuing word:', word);
    q.defer(phonemeHomophonizer.getHomophones, word);
  });

  q.awaitAll(function done(error, translatedWords) {
    if (error) {
      console.log(error);
    }
    else {
      translatedWords = translatedWords.map(function getLast(words) {
        return words[words.length - 1]; 
      });

      opts.done(error, translatedWords.join(' '));
    }
  });
};

// Fortune functions

function asyncFortune(done) {
  sendNextTick([
      {
        text: fortune.fortune(),
        shouldTranslate: true
      }
    ],
    done
  );
}

var bibleTries = 0;

function getFortuneFromBible(done) {
  request('http://labs.bible.org/api/?passage=random', 
    function sendVerse(error, response, body) {
      bibleTries += 1;

      var parsed = verseparser.parse(body);

      if (error || (parsed.citation.length + 1 + parsed.text.length > 140)) {
        if (bibleTries >= 5) {
          console.log('Too many bible tries!');
          done(error);
        }
        else {
          getFortuneFromBible(done);
        }
      }
      else {
        tumblrLogPoster = tumblrLogPosterLib.createLogPoster();
        tumblrLogPoster.setPostTitle(parsed.citation);

        done(error, [
            {
              text: parsed.citation + ' ',
              shouldTranslate: false
            },
            {
              text: parsed.text,
              shouldTranslate: true
            }
          ]);
      }
    }
  );
}

// Utils

function sendNextTick(params, done) {
  process.nextTick(function callDone() {
    done(null, params);
  },
  0);
}

module.exports = boss;
