var queue = require('queue-async');
var probable = require('probable');

function makeLossyRetranslation(opts) {
  var translationLocales = 
    opts.pickTranslationLocales(opts.date, opts.locales, 
      probable.roll(5) + 1).slice();
  translationLocales.unshift(opts.baseLocale);
  translationLocales.push(opts.baseLocale);

  opts.translateChain({
    translator: opts.translator,
    text: opts.text,
    locales: translationLocales,
    done: checkChainResult,
    logger: opts.logger
  });

  function checkChainResult(error, translation) {
    if (error) {
      opts.done(error);
    }
    else {
      if (translation === opts.text) {
        error = 'translateChain returned the original text.';
        translation = undefined;
      }

      opts.done(error, translation);
    }
  }
}

function translateChain(opts) {
  var index = 0;
  var intermediateText;

  var logger = opts.logger;
  if (!logger) {
    logger = console;
  }

  var previousFromLocale;
  var previousToLocale;
  
  function translateNextLocale(error, translation) {
    if (error) {
      opts.done(error, intermediateText);
      return;
    }

    intermediateText = translation;

    if (previousFromLocale && previousToLocale) {
      logger.log({
        translationStep: {
          from: previousFromLocale,
          to: previousToLocale,
          translation: intermediateText
        }
      });
    }
    else {
      logger.log({
        translationStep: {
          initialText: intermediateText
        }
      });
    }

    if (index < opts.locales.length - 1) {
      var fromLocale = opts.locales[index];
      var toLocale = opts.locales[index + 1];

      index += 1;
      previousFromLocale = fromLocale;
      previousToLocale = toLocale;

      opts.translator({
        text: intermediateText,
        from: fromLocale,
        to: toLocale
      }, 
      translateNextLocale);
    }
    else {
      logger.log({
        translationStep: {
          translationEnded: true
        }
      });

      opts.done(null, intermediateText);
    }
  }

  translateNextLocale(null, opts.text);
}

function makeLossyFortune(opts) {
  opts.fortuneSource.fortune(function checkThenTranslate(error, segments) {
    if (error) {
      opts.done(error);
    }
    else {
      translateSegments(opts.lossyTranslate, segments, opts.done);
    }
  });
}

function translateSegments(lossyTranslate, segments, done) {
  var q = queue();

  segments.forEach(function queueTranslate(segment) {
    var translate = segment.shouldTranslate ? translateWrapper : identity;
    q.defer(translate, segment.text);
  });

  q.awaitAll(translateFortune);

  function translateWrapper(text, done) {
    lossyTranslate({
      text: text,
      done: done
    });
  }

  function translateFortune(error, translatedSegments) {
    console.log('translatedSegments:', translatedSegments);
    if (error) {
      done(error);
    }
    else {
      done(error, translatedSegments.join(''));
    }
  }
}

function identity(text, done) {
  setTimeout(function callDone() {
    done(null, text);
  }, 0);
}

module.exports = {
  makeLossyRetranslation: makeLossyRetranslation,
  translateChain: translateChain,
  makeLossyFortune: makeLossyFortune
};
