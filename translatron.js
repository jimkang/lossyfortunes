function makeLossyRetranslation(opts) {
  var translationLocales = opts.pickTranslationLocales(opts.date, opts.locales);
  opts.translateChain(opts.translator, opts.text, translationLocales, opts.done);
}

module.exports = {
  makeLossyRetranslation: makeLossyRetranslation
};
