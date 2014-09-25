function makeLossyRetranslation(opts) {
  var translationLocales = 
    opts.pickTranslationLocales(opts.date, opts.locales).slice();
  translationLocales.unshift(opts.baseLocale);
  translationLocales.push(opts.baseLocale);

  opts.translateChain({
    translator: opts.translator,
    text: opts.text,
    locales: translationLocales,
    done: checkChainResult
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
      logger.log('From:', previousFromLocale, 'To:', previousToLocale, 
        'Translation:', intermediateText
      );
    }
    else {
      logger.log('Initial translateChain text:', intermediateText);
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
      opts.done(null, intermediateText);
    }
  }

  translateNextLocale(null, opts.text);
}

function makeLossyFortune(opts) {
  var fortune = opts.fortuneSource.fortune(translateFortune);

  function translateFortune(error, fortune) {
    if (error) {
      opts.done(error);
    }
    else {
      opts.lossyTranslate({
        text: fortune, 
        done: opts.done
      });
    }
  }
}

module.exports = {
  makeLossyRetranslation: makeLossyRetranslation,
  translateChain: translateChain,
  makeLossyFortune: makeLossyFortune
};
