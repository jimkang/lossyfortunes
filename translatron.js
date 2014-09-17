function makeLossyRetranslation(opts) {
  var translationLocales = opts.pickTranslationLocales(opts.date, opts.locales);
  opts.translateChain(opts.translator, opts.text, translationLocales, opts.done);
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

    if (index < opts.locales.length) {
      var locale = opts.locales[index];
      index += 1;
      opts.translator(intermediateText, locale, translateNextLocale);
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
