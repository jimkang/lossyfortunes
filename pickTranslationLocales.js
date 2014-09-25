var clockworkPair = require('./clockworkPair');

function pickTranslationLocales(date, translationLocales) {
  var hour = date.getHours();
  var day = date.getDate();
  var locales = [];
  var seed = day - 1;

  var indexes = clockworkPair(translationLocales.length, seed);
  return [translationLocales[indexes[0]], translationLocales[indexes[1]]];
}

module.exports = pickTranslationLocales;
