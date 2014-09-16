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
    }
    else {
      intermediateText = translation;
    }

    if (index < opts.locales.length) {
      var locale = opts.locales[index];
      index += 1;
      debugger;
      opts.translator(intermediateText, locale, translateNextLocale);
    }
    else {
      opts.done(null, intermediateText);
    }
  };

  translateNextLocale(null, opts.text);
}

module.exports = {
  makeLossyRetranslation: makeLossyRetranslation,
  translateChain: translateChain
};
