var wardboss = require('wardboss');
var boss = wardboss.createBoss('lossyboss');
var request = require('request');
var lossyfortune = require('../lossyfortune');
var fortune = require('fortune-tweetable');
var translatron = require('../translatron');
var pickTranslationLocales = require('../pickTranslationLocales');
var MSTranslator = require('mstranslator');
var masala = require('masala');
// var homophonizer = require('homophonizer');
var queue = require('queue-async');
var _ = require('lodash');
var verseparser = require('../domains/bible/verseparser');
var translationLoggerModule = require('../loggers/translationlogger');
var tumblrLogPosterLib = require('../loggers/tumblrlogposter');
var probable = require('probable');

// var phonemeHomophonizer = homophonizer.phoneme.createHomophonizer();

var tumblrLogPoster;

boss.addConstituent('lossyfortune');
boss.addConstituent('lossybible');
boss.addConstituent('phonemeHomophoneFortune');

boss.addFn({
  fn: lossyfortune.runLossyFortune,
  providers: {
    lossyfortune: provideRunLossyFortuneOpts,
    lossybible: provideRunLossyFortuneOptsForLossyBible,
    lossyaeneid: provideRunLossyFortuneOptsForLossyAeneid
    // phonemeHomophoneFortune: provideRunOptsWithPhonemeHomophones
  }
});

// Providers

function provideRunLossyFortuneOpts(context, providerDone) {
  sendNextTick(_.defaults(context, {
    fortuneSource: {
      fortune: asyncFortune
    },
    lossyTranslate: getLossyTranslate(context, getLossyTranslateCurryOpts),
  }),
  providerDone);
}

function provideRunLossyFortuneOptsForLossyBible(context, providerDone) {
  var lossyTranslate;

  if (probable.roll(3) === 0) {
    lossyTranslate = getLossyTranslate(context, getLossyTranslateCurryOpts)
  }
  else {
    lossyTranslate = getLossyTranslate(context, getBibleLossyTranslateCurryOpts);
  }

  sendNextTick(_.defaults(context, {
    fortuneSource: {
      fortune: getFortuneFromBible,
    },
    lossyTranslate: lossyTranslate
  }),
  providerDone);
}

function provideRunLossyFortuneOptsForLossyAeneid(context, providerDone) {
  sendNextTick(_.defaults(context, {
    fortuneSource: {
      fortune: getFortuneFromAeneid,
    },
    lossyTranslate: getLossyTranslate(context, getAeneidLossyTranslateCurryOpts),

  }),
  providerDone);
}

// function provideRunOptsWithPhonemeHomophones(context, providerDone) {
//   sendNextTick(_.defaults(context, {
//     fortuneSource: {
//       fortune: asyncFortune,
//     },
//     lossyTranslate: homophonizeTextWithPhonemes,
//     masala: masala
//   }),
//   providerDone);
// }

function getLossyTranslate(context, getCurryOpts) {
  var opts = context;
  var curryOpts = getCurryOpts(context);

  if (!opts.masala) {
    opts.masala = masala;
  }

  return opts.masala(
    translatron.makeLossyRetranslation, curryOpts
  );
}

function getLossyTranslateCurryOpts(context) {
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

  return curryOpts;
}

function getAeneidLossyTranslateCurryOpts(context) {
  var curryOpts = getLossyTranslateCurryOpts(context);
  curryOpts.pickTranslationLocales = function getJan2At5PMChain() {
    return [
      'hi',
      'nl',
      'el',
      'fr',
      'he',
      'ko',
      'fa',
      'ms'
    ];
  };
  return curryOpts;
}

function getBibleLossyTranslateCurryOpts(context) {
  var curryOpts = getLossyTranslateCurryOpts(context);
  curryOpts.pickTranslationLocales = function getFeb18At11PMChain() {
    return [
      'ur',
      'zh-CHS',
      'fi',
      'ar',
      'de',
      'ja',
      'ht',
      'mww'
    ];
  };
  return curryOpts;
}
// function homophonizeTextWithPhonemes(opts) {
//   var q = queue();
//   var words = opts.text.split(' ');
//   words.forEach(function queueTranslation(word) {
//     var word = word.replace(/[\.\-\,\?]/g, '');
//     console.log('queuing word:', word);
//     q.defer(phonemeHomophonizer.getHomophones, word);
//   });

//   q.awaitAll(function done(error, translatedWords) {
//     if (error) {
//       console.log(error);
//     }
//     else {
//       translatedWords = translatedWords.map(function getLast(words) {
//         return words[words.length - 1]; 
//       });

//       opts.done(error, translatedWords.join(' '));
//     }
//   });
// };

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

var emdash = '\u2014';

function getFortuneFromAeneid(done) {
  request('http://api.aeneid.eu/sortes',
    function sendVerse(error, response, body) {
      var parsed = JSON.parse(body);

      if (error) {
        console.log('Error from the Aeneid API:', error);
        done(error);
      }
      else {
        var attribution = '\n' + emdash + 'Aeneid ' + parsed.book + '.' +
          parsed.start_line;

        if (parsed.number_of_lines > 1) {
          attribution += ('-' + parsed.start_line + parsed.number_of_lines);
        }

        done(error, [
          {
            text: parsed.text.join(' '),
            shouldTranslate: true
          },
          {
            text: attribution,
            shouldTranslate: false
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
