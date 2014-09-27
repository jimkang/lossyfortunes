var clockworkPair = require('./clockworkPair');

function pickTranslationLocales(date, translationLocales, numberOfPairsToPick) {
  var hour = date.getHours();
  var day = date.getDate();
  var locales = [];
  var seed = day - 1;
  if (!numberOfPairsToPick) {
    numberOfPairsToPick = 2;
  }

  var indexes = [];

  for (var i = 0; i < numberOfPairsToPick; ++i) {
    indexes = indexes.concat(
      clockworkPair(translationLocales.length, seed + i * 2)
    );
  }

  return indexes.map(function getLocaleForIndex(index) {
    return translationLocales[index];
  });
}

module.exports = pickTranslationLocales;
