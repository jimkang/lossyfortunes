var clockworkPair = require('./clockworkPair');

function pickTranslationLocales(date, translationLocales) {
  var hour = date.getHours();
  var day = date.getDate();
  debugger;
  var locales = [];
  var seed = day - 1;

  if (hour < 12) {
    var index = seed % translationLocales.length;
    return [translationLocales[index]];
  }
  else {
    var indexes = clockworkPair(translationLocales.length, seed);
    return [translationLocales[indexes[0]], translationLocales[indexes[1]]];
  }
}

module.exports = pickTranslationLocales;
