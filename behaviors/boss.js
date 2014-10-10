var wardboss = require('wardboss');
var boss = wardboss.createBoss('lossyboss');
var request = require('request');
var lossyfortune = require('../lossyfortune');
var fortune = require('fortune-tweetable');
var translatron = require('../translatron');
var pickTranslationLocales = require('../pickTranslationLocales');
var MSTranslator = require('mstranslator');
var masala = require('masala');
var config = require('../config');


boss.addConstituent('lossyfortune');
boss.addConstituent('lossybible');

boss.addFn({
  fn: lossyfortune.runLossyFortune,
  providers: {
    lossyfortune: provideRunLossyFortuneOpts,
    lossybible: provideRunLossyFortuneOptsForLossyBible,    
  }
});

// Providers

function provideRunLossyFortuneOpts(context, providerDone) {
  sendNextTick({
    fortuneSource: {
      fortune: asyncFortune
    },
    lossyTranslate: getLossyTranslate(context)
  },
  providerDone);
}

function provideRunLossyFortuneOptsForLossyBible(context, providerDone) {
  sendNextTick({
    fortuneSource: {
      fortune: getFortuneFromBible,
    },
    lossyTranslate: getLossyTranslate(context)    
  },
  providerDone);
}

function getLossyTranslate(context) {
  var opts = context;

  if (opts.configFile) {
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

  return opts.masala(translatron.makeLossyRetranslation, 
    curryOpts);
}

// Fortune functions

function asyncFortune(done) {
  sendNextTick(fortune.fortune(), done);
}

var bibleTries = 0;

function getFortuneFromBible(done) {
  request('http://labs.bible.org/api/?passage=random', 
    function sendVerse(error, response, body) {
      bibleTries += 1;
      var verse = body.replace(/<\/?b>/g, '');

      if (error || verse.length > 140) {
        if (bibleTries >= 5) {
          console.log('Too many bible tries!');
          done(error, verse);
        }
        else {
          getFortuneFromBible(done);
        }
      }
      else {
        done(error, verse);
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
