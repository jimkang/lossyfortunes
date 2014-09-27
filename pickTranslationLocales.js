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
    if (i < numberOfPairsToPick - 1) {
      // indexes.push(-1);
    }
  }

  return indexes.map(function getLocaleForIndex(index) {
    if (index === -1) {
      return 'en';
    }
    else {
      return translationLocales[index];
    }
  });
}

module.exports = pickTranslationLocales;
