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
      opts.done(error, translation);
    }
  }
}

function translateChain(opts) {
  var index = 0;
  var intermediateText;
  
  function translateNextLocale(error, translation) {
    if (error) {
      opts.done(error, intermediateText);
      return;
    }
    else {
      intermediateText = translation;
    }

    if (index < opts.locales.length - 1) {
      var fromLocale = opts.locales[index];
      var toLocale = opts.locales[index + 1];

      index += 1;
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
  var fortune = opts.fortuneSource.fortune();
  opts.lossyTranslate(fortune, opts.done);
}

module.exports = {
  makeLossyRetranslation: makeLossyRetranslation,
  translateChain: translateChain,
  makeLossyFortune: makeLossyFortune
};
